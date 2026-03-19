import { bindPager, fg, pagerHtml, queueRender, sectionTitle, selectOptions } from "./mvp-utils.js";

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
  return { pathOf };
}

function leafCategoryOptions(all, selectedId = null) {
  const childParents = new Set((all || []).filter((item) => item.parent_id).map((item) => Number(item.parent_id)));
  const { pathOf } = buildPathMap(all);
  return (all || [])
    .filter((item) => !childParents.has(Number(item.id)))
    .map((item) => `<option value="${item.id}" ${Number(item.id) === Number(selectedId || 0) ? "selected" : ""}>${esc(pathOf(item.id))}</option>`)
    .join("");
}

function formHtml(units, categories, item = {}) {
  return `
    <div class="row">
      <div class="col-md-6">${fg("Название", `<input name="name" class="form-control" value="${esc(item.name || "")}">`)}</div>
      <div class="col-md-6">${fg("Ед. изм.", `<select name="unit_id" class="form-select">${selectOptions(units, item.unit_id, "Выбрать")}</select>`)}</div>
      <div class="col-md-6">${fg("Категория", `<select name="category_id" class="form-select"><option value="">Выбрать</option>${leafCategoryOptions(categories, item.category_id)}</select>`)}</div>
      <div class="col-md-6">${fg("Активный", `<select name="is_active" class="form-select"><option value="1" ${Number(item.is_active ?? 1) === 1 ? "selected" : ""}>Да</option><option value="0" ${Number(item.is_active ?? 1) === 0 ? "selected" : ""}>Нет</option></select>`)}</div>
    </div>
  `;
}

function readForm(root) {
  return {
    name: root.querySelector("[name='name']").value.trim(),
    unit_id: Number(root.querySelector("[name='unit_id']").value || 0),
    category_id: Number(root.querySelector("[name='category_id']").value || 0),
    is_active: Number(root.querySelector("[name='is_active']").value || 1),
  };
}

function productPriceCellsHtml(item, priceTypes, fmt) {
  if (!priceTypes.length) {
    return `<td>${fmt(item.current_price || 0)}</td>`;
  }
  return priceTypes.map((priceType) => {
    const price = Number(item.price_values?.[priceType.id] || 0);
    return `<td>${fmt(price)}</td>`;
  }).join("");
}

function productPriceMobileHtml(item, priceTypes, fmt) {
  if (!priceTypes.length) {
    return `<div class="small text-muted">Цена: ${fmt(item.current_price || 0)}</div>`;
  }
  return priceTypes.map((priceType) => {
    const price = Number(item.price_values?.[priceType.id] || 0);
    return `<div class="small text-muted">${esc(priceType.name)}: ${fmt(price)}</div>`;
  }).join("");
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, openModal, fmt } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });
  const canWrite = accessFor(state.me.role).products.write;

  const filters = {
    q: viewEl.dataset.q || "",
    filial_id: viewEl.dataset.filial_id || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };

  const [filialsResp, unitsResp, categoriesResp] = await Promise.all([
    api("/filials?page=1&page_size=100"),
    api("/units?page=1&page_size=100"),
    api("/categories?all=1")
  ]);
  const filials = filialsResp.items || [];
  if (!filters.filial_id && filials[0]?.id) filters.filial_id = String(filials[0].id);

  const qs = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);
  if (filters.filial_id) qs.set("filial_id", filters.filial_id);

  const listResp = await api(`/products?${qs.toString()}`);
  const items = listResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const visiblePriceTypes = listResp.meta?.visible_price_types || [];
  const categories = categoriesResp.items || [];
  const { pathOf } = buildPathMap(categories);

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="entity-toolbar-shell">
        <div class="entity-toolbar-main">
          <div class="entity-toolbar-item entity-toolbar-search"><label class="form-label">Поиск</label><input id="prod_q" class="form-control" value="${esc(filters.q)}"></div>
          <div class="entity-toolbar-item"><label class="form-label">Филиал</label><select id="prod_filial" class="form-select">${selectOptions(filials, filters.filial_id, "Выбрать")}</select></div>
        </div>
        ${canWrite ? `<div class="entity-toolbar-actions"><button id="prod_create" class="btn btn-primary entity-toolbar-btn">Создать</button></div>` : ``}
      </div>
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr><th>Название</th><th>Ед. изм.</th><th>Категория</th><th>Остаток</th>${visiblePriceTypes.length ? visiblePriceTypes.map((priceType) => `<th>${esc(priceType.name)}</th>`).join("") : "<th>Цена</th>"}<th>Статус</th>${canWrite ? "<th>Действия</th>" : ""}</tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${esc(item.name)}</td>
              <td>${esc(item.unit_name || "")}</td>
              <td>${esc(pathOf(item.category_id) || item.category_name || "")}</td>
              <td>${fmt(item.stock_qty || 0)}</td>
              ${productPriceCellsHtml(item, visiblePriceTypes, fmt)}
              <td>${activeBadge(item.is_active)}</td>
              ${canWrite ? `<td><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></td>` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${pagerHtml(pagination)}
    </div></div>

    <div class="d-lg-none">
      ${items.map((item) => `
        <div class="card entity-mobile-card mb-2 shadow-sm">
          <div class="card-body">
            <div class="fw-semibold">${esc(item.name)}</div>
            <div class="small text-muted mt-2">Ед. изм.: ${esc(item.unit_name || "-")}</div>
            <div class="small text-muted">Категория: ${esc(pathOf(item.category_id) || item.category_name || "-")}</div>
            <div class="small text-muted">Остаток: ${fmt(item.stock_qty || 0)}</div>
            ${productPriceMobileHtml(item, visiblePriceTypes, fmt)}
            <div class="small text-muted">${activeBadge(item.is_active)}</div>
            ${canWrite ? `<div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></div>` : ""}
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  viewEl.querySelector("#prod_q")?.addEventListener("input", (ev) => {
    viewEl.dataset.q = ev.target.value.trim();
    queueRender(viewEl, "__prodTimer", () => {
      viewEl.dataset.page = "1";
      render(ctx);
    });
  });
  viewEl.querySelector("#prod_filial")?.addEventListener("change", (ev) => {
    viewEl.dataset.filial_id = ev.target.value;
    viewEl.dataset.page = "1";
    render(ctx);
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    render(ctx);
  });

  if (!canWrite) return;

  const units = unitsResp.items || [];
  viewEl.querySelector("#prod_create")?.addEventListener("click", () => {
    openModal({
      title: "Создать товар",
      bodyHtml: formHtml(units, categories, { is_active: 1 }),
      onSave: async (modalEl) => {
        await api("/products", {
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
      const item = items.find((row) => Number(row.id) === Number(btn.getAttribute("data-edit")));
      if (!item) return;
      openModal({
        title: "Изменить товар",
        bodyHtml: formHtml(units, categories, item),
        onSave: async (modalEl) => {
          await api(`/products/${item.id}`, {
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
