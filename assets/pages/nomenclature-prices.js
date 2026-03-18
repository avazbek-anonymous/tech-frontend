import { bindPager, pagerHtml, queueRender, sectionTitle } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function docStatusBadge(status) {
  return String(status || "draft") === "posted"
    ? '<span class="badge text-bg-success">Проведен</span>'
    : '<span class="badge text-bg-secondary">Черновик</span>';
}

function deleteMarkBadge(flag) {
  return Number(flag) === 1
    ? '<span class="badge text-bg-danger-subtle border border-danger-subtle">Помечен на удаление</span>'
    : '<span class="badge text-bg-light text-dark border">Без пометки</span>';
}

function scopeLabel(scope) {
  return String(scope || "products") === "categories" ? "Категории" : "Товары";
}

function buildCategoryPathMap(items) {
  const byId = new Map((items || []).map((item) => [Number(item.id), item]));
  const memo = new Map();
  function pathOf(id) {
    const key = Number(id || 0);
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

function targetOptionsHtml(refs, scope, selectedId) {
  if (scope === "categories") {
    return [`<option value="">Выбрать категорию</option>`]
      .concat((refs.categories || []).map((item) => `<option value="${item.id}" ${Number(item.id) === Number(selectedId || 0) ? "selected" : ""}>${esc(item.path || item.name)}</option>`))
      .join("");
  }
  return [`<option value="">Выбрать товар</option>`]
    .concat((refs.products || []).map((item) => `<option value="${item.id}" ${Number(item.id) === Number(selectedId || 0) ? "selected" : ""}>${esc(item.name)}</option>`))
    .join("");
}

function priceTypeOptionsHtml(refs, selectedId) {
  return [`<option value="">Выбрать вид цены</option>`]
    .concat((refs.priceTypes || []).map((item) => `<option value="${item.id}" ${Number(item.id) === Number(selectedId || 0) ? "selected" : ""}>${esc(item.currency_symbol ? `${item.name} (${item.currency_symbol})` : item.name)}</option>`))
    .join("");
}

function docLineRowHtml(refs, scope, line = {}, index = 0, fmt = (n) => String(n)) {
  const oldPrice = Number(line.old_price || 0);
  const newPrice = Number(line.new_price || 0);
  const delta = Number(line.delta ?? (newPrice - oldPrice));
  const deltaClass = delta > 0 ? "text-success" : (delta < 0 ? "text-danger" : "text-muted");
  const deltaText = delta > 0 ? `+${fmt(delta)}` : fmt(delta);
  const currencyLabel = line.currency_symbol || line.currency_name || "";

  return `
    <div class="price-doc-line-row" data-line-row data-line-index="${index}">
      <div class="price-doc-line-grid">
        <div>
          <label class="form-label">${scope === "categories" ? "Категория" : "Товар"}</label>
          <select class="form-select" data-line-field="target_id">${targetOptionsHtml(refs, scope, line.target_id)}</select>
        </div>
        <div>
          <label class="form-label">Вид цены</label>
          <select class="form-select" data-line-field="price_type_id">${priceTypeOptionsHtml(refs, line.price_type_id)}</select>
        </div>
        <div>
          <label class="form-label">Старая цена</label>
          <input class="form-control" value="${esc(fmt(oldPrice))}" readonly>
        </div>
        <div>
          <label class="form-label">Новая цена</label>
          <input class="form-control" type="number" min="0" step="0.01" data-line-field="new_price" value="${Number.isFinite(newPrice) ? newPrice : 0}">
        </div>
        <div>
          <label class="form-label">Разница</label>
          <div class="price-doc-delta ${deltaClass}">${esc(deltaText)}</div>
          ${currencyLabel ? `<div class="small text-muted mt-1">${esc(currencyLabel)}</div>` : ""}
        </div>
        <div class="price-doc-line-remove-wrap">
          <button type="button" class="btn btn-outline-danger" data-line-remove>Убрать</button>
        </div>
      </div>
    </div>
  `;
}

function docModalHtml(doc = {}) {
  return `
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Номер</label>
        <input class="form-control" value="${esc(doc.doc_no || "После сохранения")}" readonly>
      </div>
      <div class="col-md-4">
        <label class="form-label">Дата документа</label>
        <input name="doc_date" type="date" class="form-control" value="${esc(doc.doc_date || new Date().toISOString().slice(0, 10))}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Объект строк</label>
        <select name="target_scope" class="form-select">
          <option value="products" ${String(doc.target_scope || "products") === "products" ? "selected" : ""}>Товары</option>
          <option value="categories" ${String(doc.target_scope || "") === "categories" ? "selected" : ""}>Категории</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label">Комментарий</label>
        <textarea name="comment" class="form-control" rows="2">${esc(doc.comment || "")}</textarea>
      </div>
    </div>
    <div class="price-doc-lines-card mt-3">
      <div class="price-doc-lines-head">
        <div>
          <div class="fw-semibold">Табличная часть</div>
          <div class="small text-muted">Для первого релиза <code>v4.2</code> каждая строка хранится как связка объект + вид цены.</div>
        </div>
        <button type="button" class="btn btn-outline-primary" data-add-line>Добавить строку</button>
      </div>
      <div class="price-doc-lines-body" data-lines-host></div>
    </div>
  `;
}

function collectDocPayload(modalEl) {
  const get = (selector) => modalEl.querySelector(selector);
  const state = modalEl.__priceDocState || { scope: "products", lines: [] };
  const seen = new Set();
  const lines = state.lines
    .map((line) => ({
      target_kind: state.scope === "categories" ? "category" : "product",
      target_id: Number(line.target_id || 0),
      price_type_id: Number(line.price_type_id || 0),
      new_price: Number(line.new_price || 0),
      old_price: Number(line.old_price || 0),
      sort_order: Number(line.sort_order || 0),
    }))
    .filter((line) => line.target_id > 0 && line.price_type_id > 0)
    .map((line, idx) => ({ ...line, sort_order: idx + 1 }));

  for (const line of lines) {
    const key = `${line.target_kind}:${line.target_id}:${line.price_type_id}`;
    if (seen.has(key)) throw new Error("Повторяющиеся строки по объекту и виду цены не допускаются");
    seen.add(key);
  }

  return {
    doc_date: get("[name='doc_date']")?.value || new Date().toISOString().slice(0, 10),
    target_scope: get("[name='target_scope']")?.value || "products",
    comment: get("[name='comment']")?.value.trim() || "",
    lines,
  };
}

function mountDocEditor(modalEl, refs, doc = {}, fmt = (n) => String(n)) {
  const state = {
    scope: String(doc.target_scope || "products"),
    lines: Array.isArray(doc.lines) && doc.lines.length
      ? doc.lines.map((line, idx) => ({
          target_id: Number(line.target_id || 0),
          price_type_id: Number(line.price_type_id || 0),
          old_price: Number(line.old_price || 0),
          new_price: Number(line.new_price || 0),
          delta: Number(line.delta || 0),
          currency_symbol: line.currency_symbol || "",
          currency_name: line.currency_name || "",
          sort_order: idx + 1,
        }))
      : [],
  };
  modalEl.__priceDocState = state;

  const scopeEl = modalEl.querySelector("[name='target_scope']");
  const linesHost = modalEl.querySelector("[data-lines-host]");
  const addBtn = modalEl.querySelector("[data-add-line]");

  const syncLineMeta = (line) => {
    const priceType = (refs.priceTypes || []).find((item) => Number(item.id) === Number(line.price_type_id));
    line.currency_symbol = priceType?.currency_symbol || "";
    line.currency_name = priceType?.currency_name || "";
    line.delta = Number(line.new_price || 0) - Number(line.old_price || 0);
  };

  const paintDelta = (rowEl, line) => {
    syncLineMeta(line);
    const deltaEl = rowEl.querySelector(".price-doc-delta");
    if (deltaEl) {
      const delta = Number(line.delta || 0);
      deltaEl.classList.remove("text-success", "text-danger", "text-muted");
      deltaEl.classList.add(delta > 0 ? "text-success" : (delta < 0 ? "text-danger" : "text-muted"));
      deltaEl.textContent = delta > 0 ? `+${fmt(delta)}` : fmt(delta);
    }
  };

  const renderLines = () => {
    if (!state.lines.length) {
      linesHost.innerHTML = '<div class="price-doc-lines-empty">Строк пока нет. Добавь товары или категории и нужные виды цен.</div>';
      return;
    }
    linesHost.innerHTML = state.lines.map((line, index) => {
      syncLineMeta(line);
      return docLineRowHtml(refs, state.scope, { ...line, sort_order: index + 1 }, index, fmt);
    }).join("");

    linesHost.querySelectorAll("[data-line-row]").forEach((rowEl) => {
      const rowIndex = Number(rowEl.getAttribute("data-line-index") || 0);
      rowEl.querySelectorAll("[data-line-field]").forEach((fieldEl) => {
        const fieldName = fieldEl.getAttribute("data-line-field");
        if (fieldName === "new_price") {
          fieldEl.addEventListener("input", () => {
            state.lines[rowIndex].new_price = Number(fieldEl.value || 0);
            paintDelta(rowEl, state.lines[rowIndex]);
          });
          return;
        }
        fieldEl.addEventListener("change", () => {
          state.lines[rowIndex][fieldName] = Number(fieldEl.value || 0);
          renderLines();
        });
      });
      rowEl.querySelector("[data-line-remove]")?.addEventListener("click", () => {
        state.lines.splice(rowIndex, 1);
        renderLines();
      });
    });
  };

  scopeEl?.addEventListener("change", () => {
    state.scope = scopeEl.value === "categories" ? "categories" : "products";
    modalEl.__priceDocState.scope = state.scope;
    state.lines = state.lines.map((line) => ({ ...line, target_id: 0 }));
    renderLines();
  });

  addBtn?.addEventListener("click", () => {
    state.lines.push({ target_id: 0, price_type_id: 0, old_price: 0, new_price: 0, delta: 0, sort_order: state.lines.length + 1 });
    renderLines();
  });

  renderLines();
}

function actionButtonHtml(item, canWrite) {
  if (!canWrite) return "";
  const actions = [`<button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Открыть</button>`];
  if (String(item.status) === "posted") {
    actions.push(`<button class="btn btn-sm btn-outline-warning" data-unpost="${item.id}">Снять проведение</button>`);
  } else {
    actions.push(`<button class="btn btn-sm btn-outline-success" data-post="${item.id}">Провести</button>`);
  }
  actions.push(`<button class="btn btn-sm ${Number(item.marked_for_delete) === 1 ? "btn-outline-secondary" : "btn-outline-danger"}" data-mark-delete="${item.id}">${Number(item.marked_for_delete) === 1 ? "Снять пометку" : "Пометить"}</button>`);
  return `<div class="d-flex gap-2 flex-wrap">${actions.join("")}</div>`;
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, openModal } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });

  const canWrite = accessFor(state.me.role).prices.write;
  const filters = {
    q: viewEl.dataset.q || "",
    status: viewEl.dataset.status || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };

  const qs = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);
  if (filters.status) qs.set("status", filters.status);

  const [listResp, priceTypesResp, productsResp, categoriesResp] = await Promise.all([
    api(`/prices?${qs.toString()}`),
    api("/price-types?page=1&page_size=100"),
    api("/products?page=1&page_size=1000"),
    api("/categories?all=1"),
  ]);

  const items = listResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const categoryPath = buildCategoryPathMap(categoriesResp.items || []);
  const refs = {
    priceTypes: priceTypesResp.items || [],
    products: (productsResp.items || []).map((item) => ({ id: item.id, name: item.name })),
    categories: (categoriesResp.items || []).map((item) => ({ ...item, path: categoryPath.pathOf(item.id) || item.name })),
  };

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="entity-toolbar-shell">
        <div class="entity-toolbar-main">
          <div class="entity-toolbar-item entity-toolbar-search">
            <label class="form-label">Поиск</label>
            <input id="prices_q" class="form-control" value="${esc(filters.q)}" placeholder="Номер документа или комментарий">
          </div>
          <div class="entity-toolbar-item">
            <label class="form-label">Статус</label>
            <select id="prices_status" class="form-select">
              <option value="" ${filters.status === "" ? "selected" : ""}>Все</option>
              <option value="draft" ${filters.status === "draft" ? "selected" : ""}>Черновик</option>
              <option value="posted" ${filters.status === "posted" ? "selected" : ""}>Проведен</option>
            </select>
          </div>
        </div>
        ${canWrite ? `<div class="entity-toolbar-actions"><button id="prices_create" class="btn btn-primary entity-toolbar-btn" ${refs.priceTypes.length ? "" : "disabled"}>Создать</button></div>` : ""}
      </div>
      ${refs.priceTypes.length ? "" : '<div class="alert alert-warning mt-3 mb-0">Сначала создай хотя бы один вид цены в справочнике, потом можно оформлять документ установки цен.</div>'}
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr><th>Номер</th><th>Дата</th><th>Объект</th><th>Строк</th><th>Статус</th><th>Удаление</th><th>Комментарий</th>${canWrite ? "<th>Действия</th>" : ""}</tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${esc(item.doc_no || "-")}</td>
              <td>${esc(item.doc_date || "-")}</td>
              <td>${esc(scopeLabel(item.target_scope))}</td>
              <td>${Number(item.lines_count || 0)}</td>
              <td>${docStatusBadge(item.status)}</td>
              <td>${deleteMarkBadge(item.marked_for_delete)}</td>
              <td>${esc(item.comment || "")}</td>
              ${canWrite ? `<td>${actionButtonHtml(item, canWrite)}</td>` : ""}
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
            <div class="fw-semibold">${esc(item.doc_no || "-")}</div>
            <div class="small text-muted mt-2">Дата: ${esc(item.doc_date || "-")}</div>
            <div class="small text-muted">Объект: ${esc(scopeLabel(item.target_scope))}</div>
            <div class="small text-muted">Строк: ${Number(item.lines_count || 0)}</div>
            <div class="small text-muted mt-1">${docStatusBadge(item.status)}</div>
            <div class="small text-muted mt-1">${deleteMarkBadge(item.marked_for_delete)}</div>
            <div class="small text-muted mt-1">Комментарий: ${esc(item.comment || "-")}</div>
            ${canWrite ? `<div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3">${actionButtonHtml(item, canWrite)}</div>` : ""}
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  const rerender = () => render(ctx);

  viewEl.querySelector("#prices_q")?.addEventListener("input", (ev) => {
    viewEl.dataset.q = ev.target.value.trim();
    queueRender(viewEl, "__pricesTimer", () => {
      viewEl.dataset.page = "1";
      rerender();
    });
  });

  viewEl.querySelector("#prices_status")?.addEventListener("change", (ev) => {
    viewEl.dataset.status = ev.target.value;
    viewEl.dataset.page = "1";
    rerender();
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    rerender();
  });

  if (!canWrite) return;

  const openDocModal = (doc = {}) => {
    openModal({
      title: doc.id ? `Документ ${doc.doc_no || ""}` : "Создать документ установки цен",
      bodyHtml: docModalHtml(doc),
      onMount: (modalEl) => mountDocEditor(modalEl, refs, doc, ctx.fmt),
      onSave: async (modalEl) => {
        const payload = collectDocPayload(modalEl);
        if (!payload.lines.length) throw new Error("Добавь хотя бы одну строку");
        if (doc.id) {
          await api(`/prices/${doc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await api("/prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        await rerender();
      }
    });
  };

  viewEl.querySelector("#prices_create")?.addEventListener("click", () => openDocModal({ doc_date: new Date().toISOString().slice(0, 10), target_scope: "products", lines: [] }));

  viewEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-edit") || 0);
      if (!id) return;
      const resp = await api(`/prices/${id}`);
      openDocModal(resp.item || {});
    });
  });

  viewEl.querySelectorAll("[data-post]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-post") || 0);
      if (!id) return;
      await api(`/prices/${id}/post`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      await rerender();
    });
  });

  viewEl.querySelectorAll("[data-unpost]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-unpost") || 0);
      if (!id) return;
      await api(`/prices/${id}/unpost`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      await rerender();
    });
  });

  viewEl.querySelectorAll("[data-mark-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-mark-delete") || 0);
      if (!id) return;
      await api(`/prices/${id}/mark-delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      await rerender();
    });
  });
}
