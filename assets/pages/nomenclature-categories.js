import { bindPager, fg, pagerHtml, queueRender, sectionTitle } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function activeBadge(v) {
  return Number(v) === 1
    ? '<span class="badge text-bg-success-subtle border border-success-subtle">Активный</span>'
    : '<span class="badge text-bg-secondary">Неактивный</span>';
}

function buildPathMap(items) {
  const byId = new Map((items || []).map((item) => [Number(item.id), item]));
  const memo = new Map();
  function pathOf(id) {
    const key = Number(id);
    if (!key || !byId.has(key)) return "";
    if (memo.has(key)) return memo.get(key);
    const item = byId.get(key);
    const parentPath = item.parent_id ? pathOf(item.parent_id) : "";
    const out = parentPath ? `${parentPath} / ${item.name}` : item.name;
    memo.set(key, out);
    return out;
  }
  return { byId, pathOf };
}

function parentOptions(all, currentId = null, selectedId = null) {
  const { pathOf } = buildPathMap(all);
  return [`<option value=""></option>`].concat(
    (all || [])
      .filter((item) => Number(item.id) !== Number(currentId || 0))
      .map((item) => `<option value="${item.id}" ${Number(item.id) === Number(selectedId || 0) ? "selected" : ""}>${esc(pathOf(item.id))}</option>`)
  ).join("");
}

function formHtml(all, item = {}) {
  return `
    <div class="row">
      <div class="col-md-6">${fg("Название", `<input name="name" class="form-control" value="${esc(item.name || "")}">`)}</div>
      <div class="col-md-6">${fg("Родительская категория", `<select name="parent_id" class="form-select">${parentOptions(all, item.id, item.parent_id)}</select>`)}</div>
      <div class="col-md-6">${fg("Активный", `<select name="is_active" class="form-select"><option value="1" ${Number(item.is_active ?? 1) === 1 ? "selected" : ""}>Да</option><option value="0" ${Number(item.is_active ?? 1) === 0 ? "selected" : ""}>Нет</option></select>`)}</div>
    </div>
  `;
}

function readForm(root) {
  return {
    name: root.querySelector("[name='name']").value.trim(),
    parent_id: root.querySelector("[name='parent_id']").value ? Number(root.querySelector("[name='parent_id']").value) : null,
    is_active: Number(root.querySelector("[name='is_active']").value || 1),
  };
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, openModal } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });
  const canWrite = accessFor(state.me.role).categories.write;

  const filters = {
    q: viewEl.dataset.q || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };
  const qs = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);

  const [listResp, allResp] = await Promise.all([
    api(`/categories?${qs.toString()}`),
    api("/categories?all=1")
  ]);
  const items = listResp.items || [];
  const all = allResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const { pathOf, byId } = buildPathMap(all);

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="entity-toolbar-shell">
        <div class="entity-toolbar-main">
          <div class="entity-toolbar-item entity-toolbar-search"><label class="form-label">Поиск</label><input id="cat_q" class="form-control" value="${esc(filters.q)}"></div>
        </div>
        ${canWrite ? `<div class="entity-toolbar-actions"><button id="cat_create" class="btn btn-primary entity-toolbar-btn">Создать</button></div>` : ``}
      </div>
    </div></div>

    <div class="card category-tree-card">
      <div class="card-body">
        <div class="category-tree has-actions">
          <div class="category-tree-head">
            <div>Категория</div>
            <div>Статус</div>
            ${canWrite ? `<div>Действия</div>` : `<div></div>`}
          </div>
          ${items.map((item) => `
            <div class="category-tree-row" style="--tree-depth:${Math.max(0, String(pathOf(item.id)).split("/").length - 1)}">
              <div class="category-tree-name">
                <span class="category-tree-label">${esc(pathOf(item.id))}${item.is_leaf ? " <span class='badge text-bg-info'>Leaf</span>" : ""}</span>
              </div>
              <div>${activeBadge(item.is_active)}</div>
              ${canWrite ? `<div class="category-tree-actions"><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></div>` : `<div></div>`}
            </div>
          `).join("")}
        </div>
        ${pagerHtml(pagination)}
      </div>
    </div>
  `;

  const qEl = viewEl.querySelector("#cat_q");
  qEl?.addEventListener("input", () => {
    viewEl.dataset.q = qEl.value.trim();
    queueRender(viewEl, "__catTimer", () => {
      viewEl.dataset.page = "1";
      render(ctx);
    });
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    render(ctx);
  });

  if (!canWrite) return;

  viewEl.querySelector("#cat_create")?.addEventListener("click", () => {
    openModal({
      title: "Создать категорию",
      bodyHtml: formHtml(all, { is_active: 1 }),
      onSave: async (modalEl) => {
        await api("/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readForm(modalEl))
        });
        await render(ctx);
      }
    });
  });

  viewEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = byId.get(Number(btn.getAttribute("data-edit")));
      if (!item) return;
      openModal({
        title: "Изменить категорию",
        bodyHtml: formHtml(all, item),
        onSave: async (modalEl) => {
          await api(`/categories/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(readForm(modalEl))
          });
          await render(ctx);
        }
      });
    });
  });
}
