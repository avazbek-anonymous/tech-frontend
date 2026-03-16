import {
  emptyHtml,
  errorHtml,
  esc,
  langOf,
  loadEntityFieldAccess,
  pick,
  queueRerender
} from "./settings-utils.js";

const UI = {
  ru: {
    docsTitle: "Warehouse documents",
    docsSub: "Receipt, transfer, issue and inventory documents",
    movesTitle: "Warehouse register",
    movesSub: "Posted stock movements",
    search: "Search",
    filial: "Branch",
    kind: "Kind",
    status: "Status",
    number: "Number",
    date: "Date",
    currency: "Currency",
    rate: "Rate",
    partner: "Counterparty",
    fromWarehouse: "From warehouse",
    toWarehouse: "To warehouse",
    items: "Items",
    comment: "Comment",
    qty: "Qty",
    price: "Price",
    amount: "Amount",
    cost: "Cost",
    actions: "Actions",
    create: "Create document",
    edit: "Edit",
    open: "Open",
    post: "Post",
    unpost: "Return to draft",
    cancel: "Cancel",
    restore: "Restore",
    save: "Save",
    addRow: "Add row",
    remove: "Remove",
    basis: "Basis",
    chooseBasis: "Choose",
    clearBasis: "Clear",
    noDocs: "No documents found",
    noMoves: "No stock movements found",
    draft: "Draft",
    posted: "Posted",
    cancelled: "Cancelled",
    in: "Receipt",
    out: "Issue",
    transfer: "Transfer",
    adjust: "Inventory",
    return_in: "Return in",
    return_out: "Return out",
    autoNumber: "Generated automatically",
    autoDate: "Generated automatically",
    requiredFilial: "Select a branch",
    requiredProduct: "Select product in each filled row",
    requiredQty: "Quantity must be a non-zero number",
    requiredWarehouse: "Fill required warehouse fields",
    loadingError: "Failed to load document",
    noBasisDocs: "No basis documents available",
    direction: "Direction",
    product: "Product",
    warehouse: "Warehouse"
  },
  uz: {},
  en: {}
};
UI.uz = UI.ru;
UI.en = UI.ru;

function text(lang, key) {
  return pick(UI, lang, key);
}

function localeFor(lang) {
  return lang === "uz" ? "uz-UZ" : (lang === "en" ? "en-US" : "ru-RU");
}

function isOwnerRole(role) {
  return role === "super_admin" || role === "business_owner";
}

function hasAction(state, sectionId, action) {
  if (isOwnerRole(state?.me?.role)) return true;
  return Boolean(state?.rolePermissions?.has(`${sectionId}.${action}`));
}

function sectionForKind(kind) {
  return String(kind || "") === "adjust" ? "stock_inventory" : "stock_income";
}

function stateForSection(ctx) {
  const bag = ctx.state.stockDocs || (ctx.state.stockDocs = {});
  const key = ctx.section.id;
  if (!bag[key]) {
    bag[key] = {
      q: "",
      filial_id: "",
      kind: key === "stock_inventory" ? "adjust" : (key === "stock_income" ? "in" : ""),
      status: "",
      warehouse_id: "",
      product_id: "",
      direction: ""
    };
  }
  return bag[key];
}

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let s = String(value).trim();
  if (!s) return null;
  s = s.replace(/[\s\u00A0]/g, "");
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatNumber(lang, value, digits = 2) {
  const n = parseNumber(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(n).replace(/\u00A0/g, " ");
}

function moneyInputValue(value) {
  const n = parseNumber(value);
  return Number.isFinite(n) ? String(n) : "";
}

function bindNumericInput(input, onChange) {
  if (!input) return;
  input.addEventListener("change", () => {
    const n = parseNumber(input.value);
    input.value = Number.isFinite(n) ? String(n) : "";
    if (typeof onChange === "function") onChange();
  });
}

function toDateInput(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts) * 1000);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function statusBadge(lang, status) {
  const value = String(status || "draft");
  const label = esc(text(lang, value));
  if (value === "posted") return `<span class="badge text-bg-success-subtle border border-success-subtle">${label}</span>`;
  if (value === "cancelled") return `<span class="badge text-bg-secondary">${label}</span>`;
  return `<span class="badge text-bg-warning-subtle border border-warning-subtle">${label}</span>`;
}

function normalizeSimple(row) {
  return { id: Number(row?.id || 0), name: String(row?.name || row?.full_name || "") };
}

function normalizeCurrency(row) {
  return {
    id: Number(row?.id || 0),
    code: String(row?.code || "UZS").toUpperCase(),
    name: String(row?.name || row?.code || "UZS"),
    is_default: Number(row?.is_default || 0) === 1,
    is_active: Number(row?.is_active || 0) === 1
  };
}

function optionHtml(rows, selected, placeholder) {
  return `<option value="">${esc(placeholder || "-")}</option>${rows.map((row) => `<option value="${row.id}" ${Number(selected || 0) === Number(row.id) ? "selected" : ""}>${esc(row.name || row.id)}</option>`).join("")}`;
}

function currencyOptions(rows, selected) {
  const code = String(selected || "UZS").toUpperCase();
  return rows.map((row) => {
    const label = row.name && row.name !== row.code ? `${row.code} - ${row.name}` : row.code;
    return `<option value="${esc(row.code)}" ${code === row.code ? "selected" : ""}>${esc(label)}</option>`;
  }).join("");
}

function rowHtml(products, item = {}, idx = 0, lang = "ru", isEditable = true) {
  const readonly = isEditable ? "" : "readonly";
  const disabled = isEditable ? "" : "disabled";
  return `
    <tr data-item-row>
      <td><select class="form-select form-select-sm" data-field="product_id" ${disabled}>${optionHtml(products, item.product_id, text(lang, "product"))}</select></td>
      <td><input class="form-control form-control-sm" data-field="qty" value="${esc(moneyInputValue(item.qty))}" ${readonly}></td>
      <td><input class="form-control form-control-sm" data-field="price" value="${esc(moneyInputValue(item.price))}" ${readonly}></td>
      <td><input class="form-control form-control-sm" data-field="amount" value="${esc(formatNumber(lang, item.amount))}" readonly></td>
      <td><input class="form-control form-control-sm" data-field="cost" value="${esc(moneyInputValue(item.cost))}" ${readonly}></td>
      <td><input class="form-control form-control-sm" data-field="comment" value="${esc(item.comment || "")}" ${readonly}></td>
      <td class="text-end">${isEditable ? `<button type="button" class="btn btn-sm btn-outline-danger" data-remove-row="${idx}">${esc(text(lang, "remove"))}</button>` : ""}</td>
    </tr>
  `;
}
function recalcRow(row, lang) {
  const qty = parseNumber(row.querySelector('[data-field="qty"]')?.value) || 0;
  const price = parseNumber(row.querySelector('[data-field="price"]')?.value) || 0;
  const amountEl = row.querySelector('[data-field="amount"]');
  if (amountEl) amountEl.value = formatNumber(lang, Math.abs(qty) * price);
}

function syncKindFields(modalEl, lang) {
  const kind = String(modalEl.querySelector('[name="kind"]')?.value || "in");
  const fromWrap = modalEl.querySelector('[data-wrap="from"]');
  const toWrap = modalEl.querySelector('[data-wrap="to"]');
  const fromLabel = modalEl.querySelector('[data-label="from"]');
  const toLabel = modalEl.querySelector('[data-label="to"]');
  if (fromLabel) fromLabel.textContent = text(lang, kind === "adjust" ? "warehouse" : "fromWarehouse");
  if (toLabel) toLabel.textContent = text(lang, "toWarehouse");
  if (fromWrap) fromWrap.style.display = (kind === "in" || kind === "return_in") ? "none" : "";
  if (toWrap) toWrap.style.display = (kind === "out" || kind === "return_out" || kind === "adjust") ? "none" : "";
}

async function ensureRefs(ctx) {
  if (ctx.state.stockDocsRefs) return ctx.state.stockDocsRefs;
  const [filialsResp, warehousesResp, productsResp, counterpartiesResp, currenciesResp] = await Promise.all([
    ctx.api("/filials"),
    ctx.api("/warehouses"),
    ctx.api("/products"),
    ctx.api("/counterparties"),
    ctx.api("/currencies")
  ]);
  const currencies = (currenciesResp.items || []).map(normalizeCurrency).filter((row) => row.is_active);
  ctx.state.stockDocsRefs = {
    filials: (filialsResp.items || []).map(normalizeSimple).filter((row) => row.id > 0),
    warehouses: (warehousesResp.items || []).map(normalizeSimple).filter((row) => row.id > 0),
    products: (productsResp.items || []).map(normalizeSimple).filter((row) => row.id > 0),
    counterparties: (counterpartiesResp.items || []).map((row) => ({ id: Number(row?.id || 0), name: String(row?.name || row?.full_name || "") })).filter((row) => row.id > 0),
    currencies: currencies.length ? currencies : [{ id: 0, code: "UZS", name: "UZS", is_default: true, is_active: true }]
  };
  return ctx.state.stockDocsRefs;
}

function modalHtml(lang, draft, refs, canEditKind, isEditable) {
  const rows = (draft.items && draft.items.length ? draft.items : (isEditable ? [{}] : []));
  const disabled = isEditable ? "" : "disabled";
  const readonly = isEditable ? "" : "readonly";
  return `
    <div class="row g-3 mb-3">
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "number"))}</label><input class="form-control" value="${esc(draft.doc_no || text(lang, "autoNumber"))}" readonly></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "date"))}</label><input class="form-control" value="${esc(draft.doc_date ? toDateInput(draft.doc_date) : text(lang, "autoDate"))}" readonly></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "status"))}</label><input class="form-control" value="${esc(text(lang, draft.status || "draft"))}" readonly></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "kind"))}</label><select class="form-select" name="kind" ${isEditable && canEditKind ? "" : "disabled"}>${["in","out","transfer","adjust","return_in","return_out"].map((kind) => `<option value="${kind}" ${String(draft.kind || "in") === kind ? "selected" : ""}>${esc(text(lang, kind))}</option>`).join("")}</select></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "filial"))}</label><select class="form-select" name="filial_id" ${disabled}>${optionHtml(refs.filials, draft.filial_id, text(lang, "filial"))}</select></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "currency"))}</label><select class="form-select" name="currency_code" ${disabled}>${currencyOptions(refs.currencies, draft.currency_code || "UZS")}</select></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "rate"))}</label><input class="form-control" name="currency_rate" value="${esc(moneyInputValue(draft.currency_rate ?? 1))}" ${readonly}></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "partner"))}</label><select class="form-select" name="partner_id" ${disabled}>${optionHtml(refs.counterparties, draft.partner_id, text(lang, "partner"))}</select></div>
      <div class="col-md-3" data-wrap="from"><label class="form-label" data-label="from">${esc(text(lang, "fromWarehouse"))}</label><select class="form-select" name="from_warehouse_id" ${disabled}>${optionHtml(refs.warehouses, draft.from_warehouse_id, text(lang, "fromWarehouse"))}</select></div>
      <div class="col-md-3" data-wrap="to"><label class="form-label" data-label="to">${esc(text(lang, "toWarehouse"))}</label><select class="form-select" name="to_warehouse_id" ${disabled}>${optionHtml(refs.warehouses, draft.to_warehouse_id, text(lang, "toWarehouse"))}</select></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "cost"))}</label><input class="form-control" name="extra_cost" value="${esc(moneyInputValue(draft.extra_cost ?? 0))}" ${readonly}></div>
      <div class="col-md-3"><label class="form-label">${esc(text(lang, "basis"))}</label><div class="input-group"><input class="form-control" name="basis_doc_label" value="${esc(draft.basis_doc_no || "")}" readonly><button type="button" class="btn btn-outline-secondary" data-basis-pick ${isEditable ? "" : "disabled"}>${esc(text(lang, "chooseBasis"))}</button><button type="button" class="btn btn-outline-secondary" data-basis-clear ${isEditable ? "" : "disabled"}>${esc(text(lang, "clearBasis"))}</button></div><input type="hidden" name="basis_doc_type" value="${esc(draft.basis_doc_type || "")}"><input type="hidden" name="basis_doc_id" value="${esc(draft.basis_doc_id || "")}"></div>
      <div class="col-12"><label class="form-label">${esc(text(lang, "comment"))}</label><textarea class="form-control" rows="2" name="comment" ${readonly}>${esc(draft.comment || "")}</textarea></div>
    </div>
    <div class="d-flex align-items-center justify-content-between mb-2"><h6 class="m-0">${esc(text(lang, "items"))}</h6>${isEditable ? `<button type="button" class="btn btn-sm btn-outline-primary" data-add-row>${esc(text(lang, "addRow"))}</button>` : ""}</div>
    <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>${esc(text(lang, "product"))}</th><th>${esc(text(lang, "qty"))}</th><th>${esc(text(lang, "price"))}</th><th>${esc(text(lang, "amount"))}</th><th>${esc(text(lang, "cost"))}</th><th>${esc(text(lang, "comment"))}</th><th></th></tr></thead><tbody data-items-body>${rows.map((row, idx) => rowHtml(refs.products, row, idx, lang, isEditable)).join("")}</tbody></table></div>
  `;
}

function readPayload(modalEl) {
  const value = (name) => String(modalEl.querySelector(`[name="${name}"]`)?.value || "").trim();
  const payload = {
    kind: value("kind") || "in",
    filial_id: Number(value("filial_id") || 0) || null,
    currency_code: value("currency_code") || "UZS",
    currency_rate: parseNumber(value("currency_rate")) ?? 1,
    partner_id: Number(value("partner_id") || 0) || null,
    from_warehouse_id: Number(value("from_warehouse_id") || 0) || null,
    to_warehouse_id: Number(value("to_warehouse_id") || 0) || null,
    extra_cost: parseNumber(value("extra_cost")) ?? 0,
    basis_doc_type: value("basis_doc_type") || null,
    basis_doc_id: Number(value("basis_doc_id") || 0) || null,
    comment: value("comment") || null,
    items: []
  };

  modalEl.querySelectorAll("[data-item-row]").forEach((row, idx) => {
    const productId = Number(row.querySelector('[data-field="product_id"]')?.value || 0) || null;
    const qty = parseNumber(row.querySelector('[data-field="qty"]')?.value);
    const price = parseNumber(row.querySelector('[data-field="price"]')?.value) ?? 0;
    const cost = parseNumber(row.querySelector('[data-field="cost"]')?.value) ?? price;
    const comment = String(row.querySelector('[data-field="comment"]')?.value || "").trim() || null;
    if (!productId && !qty && !price && !comment) return;
    payload.items.push({ product_id: productId, qty, price, amount: Math.abs(qty || 0) * price, cost, comment, sort_order: (idx + 1) * 10 });
  });

  return payload;
}

function validatePayload(lang, payload, fields) {
  if (fields.isRequired("filial_id") && !payload.filial_id) throw new Error(text(lang, "requiredFilial"));
  if (!["in","out","transfer","adjust","return_in","return_out"].includes(payload.kind)) throw new Error(text(lang, "requiredWarehouse"));
  if ((payload.kind === "in" || payload.kind === "return_in") && !payload.to_warehouse_id) throw new Error(text(lang, "requiredWarehouse"));
  if ((payload.kind === "out" || payload.kind === "return_out" || payload.kind === "adjust") && !payload.from_warehouse_id) throw new Error(text(lang, "requiredWarehouse"));
  if (payload.kind === "transfer" && (!payload.from_warehouse_id || !payload.to_warehouse_id || payload.from_warehouse_id === payload.to_warehouse_id)) throw new Error(text(lang, "requiredWarehouse"));
  for (const item of payload.items) {
    if (!item.product_id) throw new Error(text(lang, "requiredProduct"));
    if (!Number.isFinite(Number(item.qty)) || Number(item.qty) === 0) throw new Error(text(lang, "requiredQty"));
  }
}

async function chooseBasisDoc(ctx, kind, currentDocId) {
  const lang = langOf();
  const qs = new URLSearchParams();
  qs.set("basis_doc_type", "stock_doc");
  qs.set("kind", kind || "");
  if (currentDocId) qs.set("exclude_doc_id", String(currentDocId));
  const resp = await ctx.api(`/stock_docs/basis-docs?${qs.toString()}`);
  const docs = resp.items || [];
  return new Promise((resolve) => {
    ctx.openModal({
      title: text(lang, "basis"),
      saveText: text(lang, "chooseBasis"),
      bodyHtml: docs.length ? `<div class="list-group">${docs.map((doc) => `<label class="list-group-item d-flex gap-3 align-items-start"><input class="form-check-input mt-1" type="radio" name="basis_doc_id" value="${doc.id}"><div><div class="fw-semibold">${esc(doc.doc_no || "")}</div><div class="small text-muted">${esc(toDateInput(doc.doc_date))}</div></div></label>`).join("")}</div>` : `<div class="text-muted">${esc(text(lang, "noBasisDocs"))}</div>`,
      onSave: async (modalEl) => {
        const selected = Number(modalEl.querySelector('[name="basis_doc_id"]:checked')?.value || 0) || null;
        resolve(docs.find((item) => Number(item.id) === selected) || null);
      }
    });
  });
}
async function openDocModal(ctx, doc, mode = "edit") {
  const lang = langOf();
  const refs = await ensureRefs(ctx);
  const isCreate = !doc?.id;
  let fullDoc = doc || { kind: ctx.section.id === "stock_inventory" ? "adjust" : (ctx.section.id === "stock_income" ? "in" : "in"), status: "draft", items: [{}], currency_code: "UZS", currency_rate: 1, extra_cost: 0 };
  if (!isCreate) {
    try {
      const resp = await ctx.api(`/stock_docs/${doc.id}`);
      fullDoc = { ...(resp.item || {}), items: resp.items || [] };
    } catch {
      throw new Error(text(lang, "loadingError"));
    }
  }

  const entityKey = String(fullDoc.kind || "") === "adjust" ? "inventory_doc" : "stock_income_doc";
  const fields = await loadEntityFieldAccess(ctx.api, entityKey);
  const isEditable = isCreate || mode === "edit";
  const canEditKind = isCreate && ctx.section.id === "stock_list";

  ctx.openModal({
    title: isCreate ? text(lang, "create") : (isEditable ? text(lang, "edit") : text(lang, "open")),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, fullDoc, refs, canEditKind, isEditable),
    onSave: isEditable ? async (modalEl) => {
      const payload = readPayload(modalEl);
      validatePayload(lang, payload, fields);
      if (isCreate) {
        payload.section_id = ctx.section.id;
        await ctx.api("/stock_docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await ctx.api(`/stock_docs/${doc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      await render(ctx);
    } : undefined
  });

  setTimeout(() => {
    const modals = document.querySelectorAll(".modal");
    const modalEl = modals[modals.length - 1];
    if (!modalEl) return;

    const body = modalEl.querySelector("[data-items-body]");
    const addBtn = modalEl.querySelector("[data-add-row]");
    const kindEl = modalEl.querySelector('[name="kind"]');
    syncKindFields(modalEl, lang);

    modalEl.querySelectorAll('[data-field="qty"], [data-field="price"], [data-field="cost"], [name="currency_rate"], [name="extra_cost"]').forEach((input) => bindNumericInput(input));
    modalEl.querySelectorAll("[data-item-row]").forEach((row) => {
      row.querySelectorAll('[data-field="qty"], [data-field="price"]').forEach((input) => bindNumericInput(input, () => recalcRow(row, lang)));
      recalcRow(row, lang);
    });

    if (kindEl) {
      kindEl.addEventListener("change", () => syncKindFields(modalEl, lang));
    }

    if (addBtn && body) {
      addBtn.addEventListener("click", () => {
        const idx = body.querySelectorAll("[data-item-row]").length;
        body.insertAdjacentHTML("beforeend", rowHtml(refs.products, {}, idx, lang, true));
        const row = body.lastElementChild;
        if (!row) return;
        row.querySelectorAll('[data-field="qty"], [data-field="price"]').forEach((input) => bindNumericInput(input, () => recalcRow(row, lang)));
        row.querySelectorAll('[data-field="cost"]').forEach((input) => bindNumericInput(input));
        recalcRow(row, lang);
      });
    }

    if (body) {
      body.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-remove-row]");
        if (!btn) return;
        const row = btn.closest("[data-item-row]");
        if (!row) return;
        row.remove();
      });
    }

    const basisPick = modalEl.querySelector("[data-basis-pick]");
    if (basisPick) {
      basisPick.addEventListener("click", async () => {
        const kind = String(modalEl.querySelector('[name="kind"]')?.value || "in");
        const docItem = await chooseBasisDoc(ctx, kind, fullDoc.id || null);
        if (!docItem) return;
        modalEl.querySelector('[name="basis_doc_label"]').value = String(docItem.doc_no || "");
        modalEl.querySelector('[name="basis_doc_type"]').value = "stock_doc";
        modalEl.querySelector('[name="basis_doc_id"]').value = String(docItem.id || "");
      });
    }

    const basisClear = modalEl.querySelector("[data-basis-clear]");
    if (basisClear) {
      basisClear.addEventListener("click", () => {
        modalEl.querySelector('[name="basis_doc_label"]').value = "";
        modalEl.querySelector('[name="basis_doc_type"]').value = "";
        modalEl.querySelector('[name="basis_doc_id"]').value = "";
      });
    }
  }, 0);
}

async function changeStatus(ctx, doc, status) {
  await ctx.api(`/stock_docs/${doc.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  await render(ctx);
}

function docsTableHtml(ctx, rows) {
  const lang = langOf();
  const canEdit = (doc) => hasAction(ctx.state, sectionForKind(doc.kind), "change");
  const canPost = (doc) => hasAction(ctx.state, sectionForKind(doc.kind), "post");
  return rows.length ? `<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>${esc(text(lang, "number"))}</th><th>${esc(text(lang, "date"))}</th><th>${esc(text(lang, "kind"))}</th><th>${esc(text(lang, "filial"))}</th><th>${esc(text(lang, "warehouse"))}</th><th>${esc(text(lang, "partner"))}</th><th>${esc(text(lang, "status"))}</th><th>${esc(text(lang, "items"))}</th><th>${esc(text(lang, "comment"))}</th><th>${esc(text(lang, "actions"))}</th></tr></thead><tbody>${rows.map((doc) => `<tr><td>${esc(doc.doc_no || "")}</td><td>${esc(toDateInput(doc.doc_date))}</td><td>${esc(text(lang, doc.kind || "in"))}</td><td>${esc(doc.filial_name || "-")}</td><td>${esc(doc.from_warehouse_name || doc.to_warehouse_name || "-")}</td><td>${esc(doc.partner_name || "-")}</td><td>${statusBadge(lang, doc.status)}</td><td>${esc(doc.items_count || 0)}</td><td>${esc(doc.comment || "-")}</td><td class="text-nowrap"><button class="btn btn-sm btn-outline-secondary me-1" data-open="${doc.id}">${esc(text(lang, "open"))}</button>${doc.status === "draft" && canEdit(doc) ? `<button class="btn btn-sm btn-outline-primary me-1" data-edit="${doc.id}">${esc(text(lang, "edit"))}</button>` : ""}${doc.status === "draft" && canPost(doc) ? `<button class="btn btn-sm btn-outline-success me-1" data-post="${doc.id}">${esc(text(lang, "post"))}</button>` : ""}${doc.status === "posted" && canPost(doc) ? `<button class="btn btn-sm btn-outline-warning me-1" data-unpost="${doc.id}">${esc(text(lang, "unpost"))}</button><button class="btn btn-sm btn-outline-danger me-1" data-cancel="${doc.id}">${esc(text(lang, "cancel"))}</button>` : ""}${doc.status === "cancelled" && canPost(doc) ? `<button class="btn btn-sm btn-outline-warning" data-restore="${doc.id}">${esc(text(lang, "restore"))}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : emptyHtml(text(lang, "noDocs"));
}

function movesTableHtml(rows) {
  const lang = langOf();
  return rows.length ? `<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>${esc(text(lang, "date"))}</th><th>${esc(text(lang, "number"))}</th><th>${esc(text(lang, "kind"))}</th><th>${esc(text(lang, "warehouse"))}</th><th>${esc(text(lang, "product"))}</th><th>${esc(text(lang, "direction"))}</th><th>${esc(text(lang, "qty"))}</th><th>${esc(text(lang, "cost"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${esc(toDateInput(row.doc_date))}</td><td>${esc(row.doc_no || "-")}</td><td>${esc(text(lang, row.doc_kind || "in"))}</td><td>${esc(row.warehouse_name || "-")}</td><td>${esc(row.product_name || row.product_code || "-")}</td><td>${esc(String(row.direction || "").toUpperCase())}</td><td>${esc(formatNumber(lang, row.qty))}</td><td>${esc(formatNumber(lang, row.cost))}</td></tr>`).join("")}</tbody></table></div>` : emptyHtml(text(lang, "noMoves"));
}

export async function render(ctx) {
  const lang = langOf();
  const local = stateForSection(ctx);
  const sectionId = ctx.section.id;

  if (sectionId === "stock_dbkd") {
    ctx.page(text(lang, "movesTitle"), text(lang, "movesSub"), { raw: true });
    let rows = [];
    try {
      const qs = new URLSearchParams({ section_id: sectionId });
      if (local.q) qs.set("q", local.q);
      if (local.filial_id) qs.set("filial_id", local.filial_id);
      if (local.warehouse_id) qs.set("warehouse_id", local.warehouse_id);
      if (local.product_id) qs.set("product_id", local.product_id);
      if (local.direction) qs.set("direction", local.direction);
      const refs = await ensureRefs(ctx);
      const resp = await ctx.api(`/stock-moves?${qs.toString()}`);
      rows = resp.items || [];
      ctx.viewEl.innerHTML = `
        <div class="card border-0 shadow-sm"><div class="card-body d-flex flex-wrap gap-2 align-items-end"><div><label class="form-label">${esc(text(lang, "search"))}</label><input id="stock_q" class="form-control" value="${esc(local.q)}"></div><div><label class="form-label">${esc(text(lang, "filial"))}</label><select id="stock_filial" class="form-select">${optionHtml(refs.filials, local.filial_id, text(lang, "filial"))}</select></div><div><label class="form-label">${esc(text(lang, "warehouse"))}</label><select id="stock_warehouse" class="form-select">${optionHtml(refs.warehouses, local.warehouse_id, text(lang, "warehouse"))}</select></div><div><label class="form-label">${esc(text(lang, "product"))}</label><select id="stock_product" class="form-select">${optionHtml(refs.products, local.product_id, text(lang, "product"))}</select></div><div><label class="form-label">${esc(text(lang, "direction"))}</label><select id="stock_direction" class="form-select"><option value=""></option><option value="in" ${local.direction === "in" ? "selected" : ""}>IN</option><option value="out" ${local.direction === "out" ? "selected" : ""}>OUT</option></select></div></div></div><div class="card border-0 shadow-sm mt-3"><div class="card-body">${movesTableHtml(rows)}</div></div>`;
    } catch (error) {
      ctx.viewEl.innerHTML = errorHtml(error?.message || error);
      return;
    }

    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => { local[key] = el.value.trim(); queueRerender(ctx.viewEl, "stockDocsTimer", () => render(ctx)); });
      el.addEventListener("change", () => { local[key] = el.value.trim(); render(ctx); });
    };
    bind("stock_q", "q"); bind("stock_filial", "filial_id"); bind("stock_warehouse", "warehouse_id"); bind("stock_product", "product_id"); bind("stock_direction", "direction");
    return;
  }

  ctx.page(text(lang, "docsTitle"), text(lang, "docsSub"), { raw: true });
  const refs = await ensureRefs(ctx);
  try {
    const qs = new URLSearchParams({ section_id: sectionId });
    if (local.q) qs.set("q", local.q);
    if (local.filial_id) qs.set("filial_id", local.filial_id);
    if (local.kind) qs.set("kind", local.kind);
    if (local.status) qs.set("status", local.status);
    const resp = await ctx.api(`/stock_docs?${qs.toString()}`);
    const rows = resp.items || [];
    const canCreate = sectionId === "stock_inventory" ? hasAction(ctx.state, "stock_inventory", "add") : (hasAction(ctx.state, "stock_income", "add") || hasAction(ctx.state, "stock_inventory", "add"));
    ctx.viewEl.innerHTML = `
      <div class="card border-0 shadow-sm"><div class="card-body d-flex flex-wrap gap-2 align-items-end"><div><label class="form-label">${esc(text(lang, "search"))}</label><input id="stock_q" class="form-control" value="${esc(local.q)}"></div><div><label class="form-label">${esc(text(lang, "filial"))}</label><select id="stock_filial" class="form-select">${optionHtml(refs.filials, local.filial_id, text(lang, "filial"))}</select></div><div><label class="form-label">${esc(text(lang, "kind"))}</label><select id="stock_kind" class="form-select" ${sectionId === "stock_list" ? "" : "disabled"}><option value=""></option>${["in","out","transfer","adjust","return_in","return_out"].map((kind) => `<option value="${kind}" ${local.kind === kind ? "selected" : ""}>${esc(text(lang, kind))}</option>`).join("")}</select></div><div><label class="form-label">${esc(text(lang, "status"))}</label><select id="stock_status" class="form-select"><option value=""></option><option value="draft" ${local.status === "draft" ? "selected" : ""}>${esc(text(lang, "draft"))}</option><option value="posted" ${local.status === "posted" ? "selected" : ""}>${esc(text(lang, "posted"))}</option><option value="cancelled" ${local.status === "cancelled" ? "selected" : ""}>${esc(text(lang, "cancelled"))}</option></select></div>${canCreate ? `<div class="ms-auto"><button id="stock_create" class="btn btn-primary">${esc(text(lang, "create"))}</button></div>` : ""}</div></div><div class="card border-0 shadow-sm mt-3"><div class="card-body">${docsTableHtml(ctx, rows)}</div></div>`;

    const findDoc = (id) => rows.find((row) => Number(row.id) === Number(id));
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => { local[key] = el.value.trim(); queueRerender(ctx.viewEl, "stockDocsTimer", () => render(ctx)); });
      el.addEventListener("change", () => { local[key] = el.value.trim(); render(ctx); });
    };
    bind("stock_q", "q"); bind("stock_filial", "filial_id"); bind("stock_kind", "kind"); bind("stock_status", "status");

    const createBtn = document.getElementById("stock_create");
    if (createBtn) createBtn.addEventListener("click", () => openDocModal(ctx, { kind: sectionId === "stock_inventory" ? "adjust" : (sectionId === "stock_income" ? "in" : (local.kind || "in")), status: "draft", items: [{}], currency_code: "UZS", currency_rate: 1, extra_cost: 0 }, "edit"));

    ctx.viewEl.querySelectorAll("[data-open]").forEach((btn) => btn.addEventListener("click", () => openDocModal(ctx, findDoc(btn.dataset.open), "view")));
    ctx.viewEl.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => openDocModal(ctx, findDoc(btn.dataset.edit), "edit")));
    ctx.viewEl.querySelectorAll("[data-post]").forEach((btn) => btn.addEventListener("click", () => changeStatus(ctx, findDoc(btn.dataset.post), "posted")));
    ctx.viewEl.querySelectorAll("[data-unpost]").forEach((btn) => btn.addEventListener("click", () => changeStatus(ctx, findDoc(btn.dataset.unpost), "draft")));
    ctx.viewEl.querySelectorAll("[data-cancel]").forEach((btn) => btn.addEventListener("click", () => changeStatus(ctx, findDoc(btn.dataset.cancel), "cancelled")));
    ctx.viewEl.querySelectorAll("[data-restore]").forEach((btn) => btn.addEventListener("click", () => changeStatus(ctx, findDoc(btn.dataset.restore), "draft")));
  } catch (error) {
    ctx.viewEl.innerHTML = errorHtml(error?.message || error);
  }
}
