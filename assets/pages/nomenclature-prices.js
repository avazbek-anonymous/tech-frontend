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

function targetLabel(scope) {
  return String(scope || "products") === "categories" ? "Категория" : "Товар";
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

function buildCurrentProductPriceMap(items) {
  const map = new Map();
  for (const row of items || []) {
    map.set(`${Number(row.product_id)}:${Number(row.price_type_id)}`, Number(row.price || 0));
  }
  return map;
}

function buildCellState(oldPrice = 0, newPrice = oldPrice) {
  const oldValue = Number(oldPrice || 0);
  const newValue = Number(newPrice ?? oldValue);
  return {
    old_price: oldValue,
    new_price: newValue,
    delta: newValue - oldValue,
  };
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

function buildMatrixRow(refs, scope, targetId = 0, overlay = null) {
  const safeTargetId = Number(targetId || 0);
  const row = {
    target_id: safeTargetId,
    prices: {},
  };

  for (const priceType of refs.priceTypes || []) {
    let oldPrice = 0;
    if (scope === "products" && safeTargetId > 0) {
      oldPrice = refs.currentProductPriceMap.get(`${safeTargetId}:${Number(priceType.id)}`) ?? 0;
    }
    row.prices[String(priceType.id)] = buildCellState(oldPrice, oldPrice);
  }

  if (overlay && typeof overlay === "object") {
    for (const [priceTypeId, cell] of Object.entries(overlay)) {
      row.prices[String(priceTypeId)] = buildCellState(cell.old_price, cell.new_price);
    }
  }

  return row;
}

function buildRowsFromDoc(refs, doc = {}, scope = "products") {
  const grouped = new Map();
  for (const line of doc.lines || []) {
    const key = Number(line.target_id || 0);
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, {});
    grouped.get(key)[String(line.price_type_id)] = {
      old_price: Number(line.old_price || 0),
      new_price: Number(line.new_price || 0),
    };
  }
  return Array.from(grouped.entries()).map(([targetId, overlay]) => buildMatrixRow(refs, scope, targetId, overlay));
}

function deltaClass(delta) {
  return delta > 0 ? "text-success" : (delta < 0 ? "text-danger" : "text-muted");
}

function deltaText(delta, fmt) {
  return delta > 0 ? `+${fmt(delta)}` : fmt(delta);
}

function renderMatrixTable(refs, state, fmt = (n) => String(n)) {
  if (!state.rows.length) {
    return '<div class="price-doc-lines-empty">Строк пока нет. Добавь товар или категорию, а потом заполни новые цены по нужным видам цен.</div>';
  }

  return `
    <div class="price-doc-matrix-wrap">
      <table class="table table-bordered align-middle price-doc-matrix-table mb-0">
        <thead>
          <tr>
            <th class="price-doc-target-col">${targetLabel(state.scope)}</th>
            ${(refs.priceTypes || []).map((priceType) => `<th class="price-doc-price-col">${esc(priceType.name)}</th>`).join("")}
            <th class="price-doc-remove-col"></th>
          </tr>
        </thead>
        <tbody>
          ${state.rows.map((row, rowIndex) => `
            <tr data-matrix-row data-row-index="${rowIndex}">
              <td class="price-doc-target-cell">
                <select class="form-select" data-target-select>${targetOptionsHtml(refs, state.scope, row.target_id)}</select>
              </td>
              ${(refs.priceTypes || []).map((priceType) => {
                const cell = row.prices[String(priceType.id)] || buildCellState(0, 0);
                return `
                  <td class="price-doc-price-cell" data-price-cell="${priceType.id}">
                    <div class="price-doc-cell-stack">
                      <div class="price-doc-cell-block">
                        <div class="price-doc-cell-label">Старая</div>
                        <input class="form-control" value="${esc(fmt(cell.old_price || 0))}" readonly>
                      </div>
                      <div class="price-doc-cell-block">
                        <div class="price-doc-cell-label">Новая</div>
                        <input class="form-control" type="number" min="0" step="0.01" data-new-price="${priceType.id}" value="${Number.isFinite(cell.new_price) ? cell.new_price : 0}">
                      </div>
                      <div class="price-doc-cell-block">
                        <div class="price-doc-cell-label">Разница</div>
                        <div class="price-doc-delta ${deltaClass(Number(cell.delta || 0))}" data-delta>${esc(deltaText(Number(cell.delta || 0), fmt))}</div>
                      </div>
                    </div>
                  </td>
                `;
              }).join("")}
              <td class="price-doc-remove-cell">
                <button type="button" class="btn btn-outline-danger price-doc-remove-btn" data-row-remove>x</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
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
          <div class="small text-muted">Строка = товар или категория. Виды цен идут отдельными колонками, чтобы можно было сразу заполнить несколько цен по одному объекту.</div>
        </div>
        <button type="button" class="btn btn-outline-primary" data-add-row>Добавить строку</button>
      </div>
      <div class="price-doc-lines-body" data-lines-host></div>
    </div>
  `;
}

function collectDocPayload(modalEl) {
  const get = (selector) => modalEl.querySelector(selector);
  const state = modalEl.__priceDocState || { scope: "products", rows: [] };
  const lines = [];

  for (const row of state.rows || []) {
    const targetId = Number(row.target_id || 0);
    if (!targetId) continue;
    for (const [priceTypeId, cell] of Object.entries(row.prices || {})) {
      const oldPrice = Number(cell.old_price || 0);
      const newPrice = Number(cell.new_price || 0);
      if (Math.abs(newPrice - oldPrice) < 0.0000001) continue;
      lines.push({
        target_kind: state.scope === "categories" ? "category" : "product",
        target_id: targetId,
        price_type_id: Number(priceTypeId),
        old_price: oldPrice,
        new_price: newPrice,
        sort_order: lines.length + 1,
      });
    }
  }

  return {
    doc_date: get("[name='doc_date']")?.value || new Date().toISOString().slice(0, 10),
    target_scope: get("[name='target_scope']")?.value || "products",
    comment: get("[name='comment']")?.value.trim() || "",
    lines,
  };
}

function mountDocEditor(modalEl, refs, doc = {}, fmt = (n) => String(n)) {
  const initialScope = String(doc.target_scope || "products") === "categories" ? "categories" : "products";
  const initialRows = buildRowsFromDoc(refs, doc, initialScope);
  const state = {
    scope: initialScope,
    rows: initialRows,
  };
  modalEl.__priceDocState = state;

  const scopeEl = modalEl.querySelector("[name='target_scope']");
  const linesHost = modalEl.querySelector("[data-lines-host]");
  const addRowBtn = modalEl.querySelector("[data-add-row]");

  const paintDeltaCell = (inputEl, cell) => {
    const deltaEl = inputEl.closest("[data-price-cell]")?.querySelector("[data-delta]");
    if (!deltaEl) return;
    const delta = Number(cell.delta || 0);
    deltaEl.classList.remove("text-success", "text-danger", "text-muted");
    deltaEl.classList.add(deltaClass(delta));
    deltaEl.textContent = deltaText(delta, fmt);
  };

  const renderRows = () => {
    linesHost.innerHTML = renderMatrixTable(refs, state, fmt);

    linesHost.querySelectorAll("[data-matrix-row]").forEach((rowEl) => {
      const rowIndex = Number(rowEl.getAttribute("data-row-index") || 0);
      rowEl.querySelector("[data-target-select]")?.addEventListener("change", (ev) => {
        state.rows[rowIndex] = buildMatrixRow(refs, state.scope, Number(ev.target.value || 0));
        renderRows();
      });

      rowEl.querySelectorAll("[data-new-price]").forEach((inputEl) => {
        inputEl.addEventListener("input", () => {
          const priceTypeId = String(inputEl.getAttribute("data-new-price") || "");
          const cell = state.rows[rowIndex].prices[priceTypeId] || buildCellState(0, 0);
          cell.new_price = Number(inputEl.value || 0);
          cell.delta = Number(cell.new_price || 0) - Number(cell.old_price || 0);
          state.rows[rowIndex].prices[priceTypeId] = cell;
          paintDeltaCell(inputEl, cell);
        });
      });

      rowEl.querySelector("[data-row-remove]")?.addEventListener("click", () => {
        state.rows.splice(rowIndex, 1);
        renderRows();
      });
    });
  };

  scopeEl?.addEventListener("change", () => {
    state.scope = scopeEl.value === "categories" ? "categories" : "products";
    modalEl.__priceDocState.scope = state.scope;
    state.rows = state.rows.map(() => buildMatrixRow(refs, state.scope, 0));
    renderRows();
  });

  addRowBtn?.addEventListener("click", () => {
    state.rows.push(buildMatrixRow(refs, state.scope, 0));
    renderRows();
  });

  renderRows();
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

  const [listResp, priceTypesResp, productsResp, categoriesResp, metaResp] = await Promise.all([
    api(`/prices?${qs.toString()}`),
    api("/price-types?page=1&page_size=100"),
    api("/products?page=1&page_size=1000"),
    api("/categories?all=1"),
    api("/prices/meta"),
  ]);

  const items = listResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const categoryPath = buildCategoryPathMap(categoriesResp.items || []);
  const refs = {
    priceTypes: (priceTypesResp.items || [])
      .filter((item) => Number(item.is_active) === 1)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(a.id || 0) - Number(b.id || 0)),
    products: (productsResp.items || []).map((item) => ({ id: item.id, name: item.name })),
    categories: (categoriesResp.items || []).map((item) => ({ ...item, path: categoryPath.pathOf(item.id) || item.name })),
    currentProductPriceMap: buildCurrentProductPriceMap(metaResp.current_product_prices || []),
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
      ${refs.priceTypes.length ? "" : '<div class="alert alert-warning mt-3 mb-0">Сначала создай хотя бы один активный вид цены в справочнике, потом можно оформлять документ установки цен.</div>'}
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
        if (!payload.lines.length) throw new Error("Заполни хотя бы одну новую цену");
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