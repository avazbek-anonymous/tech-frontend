import { bindPager, pagerHtml, queueRender, sectionTitle } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navigate(path, { replace = false, force = false } = {}) {
  const next = String(path || "/prices");
  if (!force && next === window.location.pathname) return;
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function parsePricesRoute(pathname) {
  const clean = String(pathname || "").replace(/\/+$/, "") || "/prices";
  if (clean === "/prices") return { mode: "list", id: 0 };
  if (clean === "/prices/new") return { mode: "new", id: 0 };

  let m = clean.match(/^\/prices\/(\d+)\/edit$/);
  if (m) return { mode: "edit", id: Number(m[1]) };

  m = clean.match(/^\/prices\/(\d+)\/view$/);
  if (m) return { mode: "view", id: Number(m[1]) };

  m = clean.match(/^\/prices\/(\d+)$/);
  if (m) return { mode: "view", id: Number(m[1]) };

  return { mode: "list", id: 0 };
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
    const out = parentPath ? `${parentPath} / ${item.name}` : String(item.name || "");
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

function currencyRateValue(currencyCode, rateValue) {
  const code = String(currencyCode || "").toUpperCase();
  if (code === "UZS") return 1;
  const rate = Number(rateValue || 0);
  return rate > 0 ? rate : null;
}

function roundAutoFill(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(2));
}

function convertByCurrencyRates(amount, sourceRate, targetRate) {
  const source = Number(sourceRate || 0);
  const target = Number(targetRate || 0);
  const value = Number(amount || 0);
  if (!(source > 0) || !(target > 0) || !Number.isFinite(value)) return null;
  return (value * source) / target;
}

function deltaClass(delta) {
  return delta > 0 ? "text-success" : (delta < 0 ? "text-danger" : "text-muted");
}

function deltaText(delta, fmt) {
  return delta > 0 ? `+${fmt(delta)}` : fmt(delta);
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

function targetNameFromRefs(refs, scope, targetId) {
  const safeTargetId = Number(targetId || 0);
  if (!safeTargetId) return "-";
  if (scope === "categories") {
    const item = (refs.categories || []).find((row) => Number(row.id) === safeTargetId);
    return item?.path || item?.name || `#${safeTargetId}`;
  }
  const item = (refs.products || []).find((row) => Number(row.id) === safeTargetId);
  return item?.name || `#${safeTargetId}`;
}

function buildMatrixRow(refs, scope, targetId = 0, overlay = null) {
  const safeTargetId = Number(targetId || 0);
  const row = {
    target_id: safeTargetId,
    target_name: targetNameFromRefs(refs, scope, safeTargetId),
    prices: {},
    auto_fill_locked: !!(overlay && Object.keys(overlay).length),
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
    if (!grouped.has(key)) {
      grouped.set(key, {
        target_name: String(line.target_name || targetNameFromRefs(refs, scope, key) || ""),
        prices: {},
      });
    }
    grouped.get(key).prices[String(line.price_type_id)] = {
      old_price: Number(line.old_price || 0),
      new_price: Number(line.new_price || 0),
    };
  }

  return Array.from(grouped.entries()).map(([targetId, data]) => {
    const row = buildMatrixRow(refs, scope, targetId, data.prices);
    row.target_name = data.target_name || row.target_name;
    return row;
  });
}

function mergeRefsWithDoc(refs, doc = {}) {
  const merged = {
    ...refs,
    priceTypes: [...(refs.priceTypes || [])],
  };
  const seen = new Set(merged.priceTypes.map((item) => Number(item.id)));
  for (const line of doc.lines || []) {
    const id = Number(line.price_type_id || 0);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.priceTypes.push({ id, name: line.price_type_name || `#${id}`, sort_order: 999999, currency_code: "", currency_rate_value: 0 });
  }
  merged.priceTypes.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(a.id || 0) - Number(b.id || 0));
  merged.priceTypesById = new Map(merged.priceTypes.map((item) => [Number(item.id), item]));
  return merged;
}

function autoFillRowPrices(refs, row, sourcePriceTypeId) {
  const priceTypeId = Number(sourcePriceTypeId || 0);
  const sourceType = refs.priceTypesById.get(priceTypeId);
  if (!sourceType) return;
  const sourceCell = row.prices[String(priceTypeId)];
  if (!sourceCell) return;

  const sourceRate = currencyRateValue(sourceType.currency_code, sourceType.currency_rate_value);
  if (!(sourceRate > 0)) return;

  for (const priceType of refs.priceTypes || []) {
    const key = String(priceType.id);
    const targetCell = row.prices[key] || buildCellState(0, 0);
    if (Number(priceType.id) === priceTypeId) {
      targetCell.delta = Number(targetCell.new_price || 0) - Number(targetCell.old_price || 0);
      row.prices[key] = targetCell;
      continue;
    }

    const targetRate = currencyRateValue(priceType.currency_code, priceType.currency_rate_value);
    const converted = convertByCurrencyRates(sourceCell.new_price, sourceRate, targetRate);
    if (converted === null) continue;
    targetCell.new_price = roundAutoFill(converted);
    targetCell.delta = Number(targetCell.new_price || 0) - Number(targetCell.old_price || 0);
    row.prices[key] = targetCell;
  }

  row.auto_fill_locked = true;
}

function renderMatrixTable(refs, state, fmt, { readOnly = false } = {}) {
  const removeHead = readOnly ? "" : '<th class="price-doc-remove-col" rowspan="2"></th>';

  if (!state.rows.length) {
    return '<div class="price-doc-lines-empty">Строк пока нет.</div>';
  }

  return `
    <div class="price-doc-matrix-wrap">
      <table class="table table-bordered align-middle price-doc-matrix-table mb-0">
        <thead>
          <tr>
            <th class="price-doc-target-col" rowspan="2">${targetLabel(state.scope)}</th>
            ${(refs.priceTypes || []).map((priceType) => `<th class="price-doc-group-head" colspan="3">${esc(priceType.name)}</th>`).join("")}
            ${removeHead}
          </tr>
          <tr>
            ${(refs.priceTypes || []).map(() => '<th class="price-doc-sub-col">Старая</th><th class="price-doc-sub-col">Новая</th><th class="price-doc-sub-col">Разница</th>').join("")}
          </tr>
        </thead>
        <tbody>
          ${state.rows.map((row, rowIndex) => `
            <tr data-matrix-row data-row-index="${rowIndex}">
              <td class="price-doc-target-cell">
                ${readOnly
                  ? `<div class="price-doc-target-static">${esc(row.target_name || targetNameFromRefs(refs, state.scope, row.target_id) || "-")}</div>`
                  : `<select class="form-select" data-target-select>${targetOptionsHtml(refs, state.scope, row.target_id)}</select>`}
              </td>
              ${(refs.priceTypes || []).map((priceType) => {
                const cell = row.prices[String(priceType.id)] || buildCellState(0, 0);
                return `
                  <td class="price-doc-value-cell"><input class="form-control" value="${esc(fmt(cell.old_price || 0))}" readonly></td>
                  <td class="price-doc-value-cell">
                    ${readOnly
                      ? `<div class="price-doc-value-static">${esc(fmt(cell.new_price || 0))}</div>`
                      : `<input class="form-control" type="number" min="0" step="0.01" data-new-price="${priceType.id}" value="${Number.isFinite(cell.new_price) ? cell.new_price : 0}">`}
                  </td>
                  <td class="price-doc-delta-cell"><div class="price-doc-delta ${deltaClass(Number(cell.delta || 0))}" data-delta="${priceType.id}">${esc(deltaText(Number(cell.delta || 0), fmt))}</div></td>
                `;
              }).join("")}
              ${readOnly ? "" : '<td class="price-doc-remove-cell"><button type="button" class="btn btn-outline-danger price-doc-remove-btn" data-row-remove>x</button></td>'}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function collectDocPayload(hostEl) {
  const state = hostEl.__priceDocState || { scope: "products", rows: [] };
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
    doc_date: hostEl.querySelector("[name='doc_date']")?.value || todayIsoDate(),
    target_scope: hostEl.querySelector("[name='target_scope']")?.value || "products",
    comment: hostEl.querySelector("[name='comment']")?.value.trim() || "",
    lines,
  };
}

function docFieldHtml(label, controlHtml, className = "col-xl-3 col-md-6") {
  return `<div class="${className}"><label class="form-label">${label}</label>${controlHtml}</div>`;
}

function docPageShell(title, subtitle, actionsHtml, bodyHtml) {
  return `
    <div class="price-doc-page d-grid gap-3">
      <div class="card price-doc-hero">
        <div class="card-body d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h3 class="mb-1">${esc(title)}</h3>
            ${subtitle ? `<div class="text-muted">${subtitle}</div>` : ""}
          </div>
          <div class="price-doc-page-actions d-flex flex-wrap gap-2">${actionsHtml}</div>
        </div>
      </div>
      ${bodyHtml}
    </div>
  `;
}

async function loadRefs(api) {
  const [priceTypesResp, productsResp, categoriesResp, metaResp, currenciesResp] = await Promise.all([
    api("/price-types?page=1&page_size=200"),
    api("/products?page=1&page_size=5000"),
    api("/categories?all=1"),
    api("/prices/meta"),
    api("/currencies?page=1&page_size=200"),
  ]);

  const categoryPath = buildCategoryPathMap(categoriesResp.items || []);
  const currenciesById = new Map((currenciesResp.items || []).map((item) => [Number(item.id), item]));
  const priceTypes = (priceTypesResp.items || [])
      .filter((item) => Number(item.is_active) === 1)
      .map((item) => {
        const currency = currenciesById.get(Number(item.currency_id)) || null;
        return {
          ...item,
          currency_code: currency?.code || item.currency_code || "",
          currency_rate_value: Number(currency?.rate_value ?? item.currency_rate_value ?? 0),
        };
      })
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(a.id || 0) - Number(b.id || 0));
  return {
    priceTypes,
    priceTypesById: new Map(priceTypes.map((item) => [Number(item.id), item])),
    products: (productsResp.items || []).map((item) => ({ id: item.id, name: item.name })),
    categories: (categoriesResp.items || []).map((item) => ({ ...item, path: categoryPath.pathOf(item.id) || item.name })),
    currentProductPriceMap: buildCurrentProductPriceMap(metaResp.current_product_prices || []),
    currenciesById,
  };
}

function bindDocEditor(hostEl, refs, initialDoc, ctx, { isNew = false } = {}) {
  const state = {
    scope: String(initialDoc.target_scope || "products") === "categories" ? "categories" : "products",
    rows: buildRowsFromDoc(refs, initialDoc, String(initialDoc.target_scope || "products") === "categories" ? "categories" : "products"),
  };
  hostEl.__priceDocState = state;

  const scopeEl = hostEl.querySelector("[name='target_scope']");
  const linesHost = hostEl.querySelector("[data-lines-host]");
  const addRowBtn = hostEl.querySelector("[data-add-row]");

  const paintRows = () => {
    linesHost.innerHTML = renderMatrixTable(refs, state, ctx.fmt);

    linesHost.querySelectorAll("[data-matrix-row]").forEach((rowEl) => {
      const rowIndex = Number(rowEl.getAttribute("data-row-index") || 0);
      rowEl.querySelector("[data-target-select]")?.addEventListener("change", (ev) => {
        const nextTargetId = Number(ev.target.value || 0);
        state.rows[rowIndex] = buildMatrixRow(refs, state.scope, nextTargetId);
        paintRows();
      });

      rowEl.querySelectorAll("[data-new-price]").forEach((inputEl) => {
        inputEl.addEventListener("input", () => {
          const priceTypeId = String(inputEl.getAttribute("data-new-price") || "");
          const row = state.rows[rowIndex];
          const cell = row.prices[priceTypeId] || buildCellState(0, 0);
          cell.new_price = Number(inputEl.value || 0);
          cell.delta = Number(cell.new_price || 0) - Number(cell.old_price || 0);
          row.prices[priceTypeId] = cell;
          if (!row.auto_fill_locked) {
            autoFillRowPrices(refs, row, priceTypeId);
            paintRows();
            return;
          }
          const deltaEl = rowEl.querySelector(`[data-delta="${priceTypeId}"]`);
          if (deltaEl) {
            deltaEl.className = `price-doc-delta ${deltaClass(cell.delta)}`;
            deltaEl.textContent = deltaText(cell.delta, ctx.fmt);
          }
        });
      });

      rowEl.querySelector("[data-row-remove]")?.addEventListener("click", () => {
        state.rows.splice(rowIndex, 1);
        paintRows();
      });
    });
  };

  scopeEl?.addEventListener("change", () => {
    state.scope = scopeEl.value === "categories" ? "categories" : "products";
    hostEl.__priceDocState.scope = state.scope;
    state.rows = state.rows.map(() => buildMatrixRow(refs, state.scope, 0));
    paintRows();
  });

  addRowBtn?.addEventListener("click", () => {
    state.rows.push(buildMatrixRow(refs, state.scope, 0));
    paintRows();
  });

  const saveErrorEl = hostEl.querySelector("[data-save-error]");
  const bindAsyncButton = (selector, handler) => {
    hostEl.querySelectorAll(selector).forEach((btn) => {
      const baseHtml = btn.innerHTML;
      btn.addEventListener("click", async () => {
        saveErrorEl.textContent = "";
        hostEl.querySelectorAll("[data-save-doc], [data-save-post-doc]").forEach((peer) => { peer.disabled = true; });
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Сохранение...';
        try {
          await handler();
        } catch (e) {
          saveErrorEl.textContent = String(e?.message || e || "Ошибка сохранения");
        } finally {
          hostEl.querySelectorAll("[data-save-doc], [data-save-post-doc]").forEach((peer) => { peer.disabled = false; });
          btn.innerHTML = baseHtml;
        }
      });
    });
  };

  const saveDoc = async ({ post = false } = {}) => {
    const payload = collectDocPayload(hostEl);
    let docId = Number(initialDoc.id || 0);
    if (isNew) {
      const resp = await ctx.api("/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      docId = Number(resp.item?.id || 0);
      if (!docId) throw new Error("Не удалось сохранить документ");
    } else {
      await ctx.api(`/prices/${initialDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      docId = Number(initialDoc.id || 0);
    }

    if (post) {
      await ctx.api(`/prices/${docId}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      navigate(`/prices/${docId}/view`, { replace: true, force: true });
      return;
    }

    navigate(`/prices/${docId}/edit`, { replace: true, force: true });
  };

  bindAsyncButton("[data-save-doc]", () => saveDoc({ post: false }));
  bindAsyncButton("[data-save-post-doc]", () => saveDoc({ post: true }));

  paintRows();
}

function listActionButtons(item, canWrite) {
  const buttons = [`<button class="btn btn-sm btn-outline-primary" data-open="${item.id}">Открыть</button>`];
  if (canWrite && String(item.status || "draft") !== "posted") {
    buttons.push(`<button class="btn btn-sm btn-outline-secondary" data-edit="${item.id}">Изменить</button>`);
    buttons.push(`<button class="btn btn-sm btn-outline-success" data-post="${item.id}">Провести</button>`);
  }
  if (canWrite && String(item.status || "draft") === "posted") {
    buttons.push(`<button class="btn btn-sm btn-outline-warning" data-unpost="${item.id}">Снять проведение</button>`);
  }
  if (canWrite) {
    buttons.push(`<button class="btn btn-sm ${Number(item.marked_for_delete) === 1 ? "btn-outline-secondary" : "btn-outline-danger"}" data-mark-delete="${item.id}">${Number(item.marked_for_delete) === 1 ? "Снять пометку" : "Пометить"}</button>`);
  }
  return `<div class="d-flex gap-2 flex-wrap">${buttons.join("")}</div>`;
}

async function renderList(ctx) {
  const { page, section, viewEl, api, accessFor, state } = ctx;
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

  const listResp = await api(`/prices?${qs.toString()}`);
  const priceTypesResp = await api("/price-types?page=1&page_size=200");
  const items = listResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const hasPriceTypes = (priceTypesResp.items || []).some((item) => Number(item.is_active) === 1);

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
        ${canWrite ? `<div class="entity-toolbar-actions"><button id="prices_create" class="btn btn-primary entity-toolbar-btn" ${hasPriceTypes ? "" : "disabled"}>Создать</button></div>` : ""}
      </div>
      ${hasPriceTypes ? "" : '<div class="alert alert-warning mt-3 mb-0">Сначала создай хотя бы один активный вид цены, потом можно оформлять документы установки цен.</div>'}
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr><th>Номер</th><th>Дата</th><th>Объект</th><th>Строк</th><th>Статус</th><th>Удаление</th><th>Комментарий</th><th>Действия</th></tr></thead>
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
              <td>${listActionButtons(item, canWrite)}</td>
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
            <div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3">${listActionButtons(item, canWrite)}</div>
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  viewEl.querySelector("#prices_q")?.addEventListener("input", (ev) => {
    viewEl.dataset.q = ev.target.value.trim();
    queueRender(viewEl, "__pricesTimer", () => {
      viewEl.dataset.page = "1";
      renderList(ctx);
    });
  });

  viewEl.querySelector("#prices_status")?.addEventListener("change", (ev) => {
    viewEl.dataset.status = ev.target.value;
    viewEl.dataset.page = "1";
    renderList(ctx);
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    renderList(ctx);
  });

  viewEl.querySelector("#prices_create")?.addEventListener("click", () => navigate("/prices/new"));
  viewEl.querySelectorAll("[data-open]").forEach((btn) => btn.addEventListener("click", () => navigate(`/prices/${btn.getAttribute("data-open")}/view`)));
  viewEl.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => navigate(`/prices/${btn.getAttribute("data-edit")}/edit`)));

  viewEl.querySelectorAll("[data-post]").forEach((btn) => btn.addEventListener("click", async () => {
    await api(`/prices/${btn.getAttribute("data-post")}/post`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await renderList(ctx);
  }));

  viewEl.querySelectorAll("[data-unpost]").forEach((btn) => btn.addEventListener("click", async () => {
    await api(`/prices/${btn.getAttribute("data-unpost")}/unpost`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await renderList(ctx);
  }));

  viewEl.querySelectorAll("[data-mark-delete]").forEach((btn) => btn.addEventListener("click", async () => {
    await api(`/prices/${btn.getAttribute("data-mark-delete")}/mark-delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await renderList(ctx);
  }));
}

async function renderDocPage(ctx, route) {
  const { page, section, viewEl, api, accessFor, state, fmt } = ctx;
  const canWrite = accessFor(state.me.role).prices.write;
  const baseTitle = sectionTitle(section);

  if ((route.mode === "new" || route.mode === "edit") && !canWrite) {
    page(baseTitle, "", { raw: true });
    viewEl.innerHTML = '<div class="alert alert-danger">Нет доступа к редактированию документов установки цен.</div>';
    return;
  }

  let refs = await loadRefs(api);
  let doc = {
    id: 0,
    doc_no: "После сохранения",
    doc_date: todayIsoDate(),
    target_scope: "products",
    comment: "",
    status: "draft",
    marked_for_delete: 0,
    lines: [],
  };

  if (route.mode !== "new") {
    const resp = await api(`/prices/${route.id}`);
    doc = resp.item || doc;
    refs = mergeRefsWithDoc(refs, doc);
  }

  let mode = route.mode;
  if (mode === "edit" && String(doc.status || "draft") === "posted") mode = "view";
  const readOnly = mode === "view";
  if (readOnly && Array.isArray(doc.lines) && doc.lines.length) {
    const usedIds = new Set(doc.lines.map((line) => Number(line.price_type_id || 0)).filter((id) => id > 0));
    const priceTypes = refs.priceTypes.filter((item) => usedIds.has(Number(item.id || 0)));
    refs = { ...refs, priceTypes, priceTypesById: new Map(priceTypes.map((item) => [Number(item.id), item])) };
  }
  const stateScope = String(doc.target_scope || "products") === "categories" ? "categories" : "products";
  const rows = buildRowsFromDoc(refs, doc, stateScope);

  const titleMap = {
    new: `${baseTitle} / Создание`,
    edit: `${baseTitle} / Редактирование`,
    view: `${baseTitle} / Просмотр`,
  };
  page(titleMap[mode] || baseTitle, "", { raw: true });

  const infoSubtitle = [
    doc.id ? `Документ ${doc.doc_no || ""}` : "Новый документ",
    doc.id ? `Статус: ${String(doc.status || "draft") === "posted" ? "Проведен" : "Черновик"}` : "После первого сохранения номер присвоится автоматически",
  ].join(" • ");

  const actionButtons = [];
  actionButtons.push('<button type="button" class="btn btn-outline-secondary" data-back-list>К списку</button>');

  if (mode === "new") {
    actionButtons.push('<button type="button" class="btn btn-primary" data-save-doc>Сохранить</button>');
    actionButtons.push('<button type="button" class="btn btn-success" data-save-post-doc>Сохранить и провести</button>');
  }

  if (mode === "edit") {
    actionButtons.push(`<button type="button" class="btn btn-outline-primary" data-open-view="${doc.id}">Просмотр</button>`);
    actionButtons.push('<button type="button" class="btn btn-primary" data-save-doc>Сохранить</button>');
    actionButtons.push('<button type="button" class="btn btn-success" data-save-post-doc>Сохранить и провести</button>');
  }

  if (mode === "view" && canWrite) {
    if (String(doc.status || "draft") !== "posted") {
      actionButtons.push(`<button type="button" class="btn btn-outline-primary" data-open-edit="${doc.id}">Изменить</button>`);
      actionButtons.push(`<button type="button" class="btn btn-success" data-post-doc="${doc.id}">Провести</button>`);
    } else {
      actionButtons.push(`<button type="button" class="btn btn-warning" data-unpost-doc="${doc.id}">Снять проведение</button>`);
    }
    actionButtons.push(`<button type="button" class="btn ${Number(doc.marked_for_delete) === 1 ? "btn-outline-secondary" : "btn-outline-danger"}" data-toggle-delete="${doc.id}">${Number(doc.marked_for_delete) === 1 ? "Снять пометку" : "Пометить на удаление"}</button>`);
  }

  const bodyHtml = `
    ${route.mode === "edit" && mode === "view" ? '<div class="alert alert-warning mb-0">Документ уже проведен, поэтому открылся в режиме просмотра. Чтобы редактировать его, сначала сними проведение.</div>' : ""}
    <div class="card">
      <div class="card-body">
        <div class="row g-3 align-items-start">
          ${docFieldHtml("Номер", `<input class="form-control" value="${esc(doc.doc_no || "После сохранения")}" readonly>`)}
          ${docFieldHtml("Дата создания", `<input class="form-control" value="${esc(doc.created_at ? new Date(Number(doc.created_at) * 1000).toLocaleString() : "Сейчас")}" readonly>`)}
          ${docFieldHtml("Дата документа", `<input name="doc_date" type="date" class="form-control" value="${esc(doc.doc_date || todayIsoDate())}" ${readOnly ? "disabled" : ""}>`)}
          ${docFieldHtml("Объект строк", readOnly
            ? `<input class="form-control" value="${esc(scopeLabel(doc.target_scope))}" readonly>`
            : `<select name="target_scope" class="form-select"><option value="products" ${String(doc.target_scope || "products") === "products" ? "selected" : ""}>Товары</option><option value="categories" ${String(doc.target_scope || "") === "categories" ? "selected" : ""}>Категории</option></select>`)}
          <div class="col-12">
            <label class="form-label">Комментарий</label>
            <textarea name="comment" class="form-control" rows="3" ${readOnly ? "readonly" : ""}>${esc(doc.comment || "")}</textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="card price-doc-lines-card">
      <div class="card-body">
        <div class="price-doc-lines-head">
          <div>
            <div class="fw-semibold">Табличная часть</div>
            <div class="small text-muted">Строка = ${targetLabel(doc.target_scope).toLowerCase()}. Под каждым видом цены идут горизонтальные колонки: Старая, Новая, Разница.</div>
          </div>
          ${readOnly ? "" : '<button type="button" class="btn btn-outline-primary" data-add-row>Добавить строку</button>'}
        </div>
        <div class="price-doc-lines-body" data-lines-host>${renderMatrixTable(refs, { scope: stateScope, rows }, fmt, { readOnly })}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex flex-wrap gap-2 align-items-center">
          ${docStatusBadge(doc.status)}
          ${deleteMarkBadge(doc.marked_for_delete)}
          ${doc.id ? `<span class="text-muted small">Строк в документе: ${Number(doc.lines_count || (doc.lines || []).length || 0)}</span>` : '<span class="text-muted small">Номер документа появится после первого сохранения</span>'}
        </div>
        <div class="price-doc-page-actions d-flex flex-wrap gap-2">${actionButtons.join("")}</div>
      </div>
      ${readOnly ? "" : '<div class="card-footer"><div class="text-danger small" data-save-error></div></div>'}
    </div>
  `;

  viewEl.innerHTML = docPageShell(mode === "new" ? "Создать документ установки цен" : `${readOnly ? "Просмотр" : "Редактирование"} документа ${esc(doc.doc_no || "")}`, infoSubtitle, actionButtons.join(""), bodyHtml);

  viewEl.querySelectorAll("[data-back-list]").forEach((btn) => btn.addEventListener("click", () => navigate("/prices")));
  viewEl.querySelectorAll("[data-open-view]").forEach((btn) => btn.addEventListener("click", () => navigate(`/prices/${btn.getAttribute("data-open-view")}/view`)));
  viewEl.querySelectorAll("[data-open-edit]").forEach((btn) => btn.addEventListener("click", () => navigate(`/prices/${btn.getAttribute("data-open-edit")}/edit`)));

  if (readOnly) {
    viewEl.querySelectorAll("[data-post-doc]").forEach((btn) => btn.addEventListener("click", async () => {
      await api(`/prices/${btn.getAttribute("data-post-doc")}/post`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      navigate(`/prices/${btn.getAttribute("data-post-doc")}/view`, { replace: true, force: true });
    }));

    viewEl.querySelectorAll("[data-unpost-doc]").forEach((btn) => btn.addEventListener("click", async () => {
      await api(`/prices/${btn.getAttribute("data-unpost-doc")}/unpost`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      navigate(`/prices/${btn.getAttribute("data-unpost-doc")}/view`, { replace: true, force: true });
    }));

    viewEl.querySelectorAll("[data-toggle-delete]").forEach((btn) => btn.addEventListener("click", async () => {
      await api(`/prices/${btn.getAttribute("data-toggle-delete")}/mark-delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      navigate(`/prices/${btn.getAttribute("data-toggle-delete")}/view`, { replace: true, force: true });
    }));

    return;
  }

  bindDocEditor(viewEl, refs, doc, ctx, { isNew: mode === "new" });
}

export async function render(ctx) {
  const route = parsePricesRoute(window.location.pathname);
  if (route.mode === "list") {
    await renderList(ctx);
    return;
  }
  await renderDocPage(ctx, route);
}
