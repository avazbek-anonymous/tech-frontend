import {
  emptyHtml,
  errorHtml,
  esc,
  isEmptyFieldValue,
  langOf,
  loadEntityFieldAccess,
  pick,
  queueRerender
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Цены: Документы",
    subtitle: "Документы установки цен и применение цен по филиалам",
    search: "Поиск по номеру",
    create: "Создать документ",
    createType: "Добавить тип цены",
    edit: "Редактировать документ",
    noItems: "Документы не найдены",
    noPriceTypes: "Нет активных типов цен. Сначала создайте тип цены.",
    docNo: "Номер",
    docDate: "Дата",
    filial: "Филиал",
    priceType: "Тип цены",
    status: "Статус",
    items: "Позиций",
    comment: "Комментарий",
    actions: "Действия",
    draft: "Черновик",
    posted: "Проведен",
    cancelled: "Отменен",
    post: "Провести",
    cancel: "Отменить",
    save: "Сохранить",
    addRow: "Добавить строку",
    remove: "Удалить",
    product: "Товар",
    oldPrice: "Старая цена",
    newPrice: "Новая цена",
    minPrice: "Мин. цена",
    reason: "Основание",
    startDate: "Действует с",
    endDate: "Действует до",
    currency: "Валюта",
    rate: "Курс",
    requiredDocNo: "Укажите номер документа",
    requiredDocDate: "Укажите дату документа",
    requiredFilial: "Выберите филиал",
    requiredPriceType: "Выберите тип цены",
    requiredItems: "Добавьте хотя бы одну позицию для проведения",
    rowProduct: "Выберите товар в каждой строке",
    rowPrice: "Новая цена должна быть числом >= 0",
    detailsLoadFail: "Не удалось загрузить документ"
  },
  uz: {
    title: "Narxlar: Hujjatlar",
    subtitle: "Narx o'rnatish hujjatlari va filiallar bo'yicha narxlarni qo'llash",
    search: "Raqam bo'yicha qidiruv",
    create: "Hujjat yaratish",
    createType: "Narx turi qo'shish",
    edit: "Hujjatni tahrirlash",
    noItems: "Hujjatlar topilmadi",
    noPriceTypes: "Faol narx turlari yo'q. Avval narx turini yarating.",
    docNo: "Raqam",
    docDate: "Sana",
    filial: "Filial",
    priceType: "Narx turi",
    status: "Holat",
    items: "Satrlar",
    comment: "Izoh",
    actions: "Amallar",
    draft: "Qoralama",
    posted: "Tasdiqlangan",
    cancelled: "Bekor qilingan",
    post: "Tasdiqlash",
    cancel: "Bekor qilish",
    save: "Saqlash",
    addRow: "Satr qo'shish",
    remove: "O'chirish",
    product: "Tovar",
    oldPrice: "Eski narx",
    newPrice: "Yangi narx",
    minPrice: "Min narx",
    reason: "Asos",
    startDate: "Amal qilish boshi",
    endDate: "Amal qilish oxiri",
    currency: "Valyuta",
    rate: "Kurs",
    requiredDocNo: "Hujjat raqamini kiriting",
    requiredDocDate: "Hujjat sanasini kiriting",
    requiredFilial: "Filialni tanlang",
    requiredPriceType: "Narx turini tanlang",
    requiredItems: "Tasdiqlash uchun kamida bitta satr kiriting",
    rowProduct: "Har bir satrda tovarni tanlang",
    rowPrice: "Yangi narx 0 dan katta yoki teng son bo'lishi kerak",
    detailsLoadFail: "Hujjatni yuklab bo'lmadi"
  },
  en: {
    title: "Prices: Documents",
    subtitle: "Price setup documents and applied prices by branch",
    search: "Search by number",
    create: "Create document",
    createType: "Add price type",
    edit: "Edit document",
    noItems: "No documents found",
    noPriceTypes: "No active price types. Create a price type first.",
    docNo: "Number",
    docDate: "Date",
    filial: "Branch",
    priceType: "Price type",
    status: "Status",
    items: "Items",
    comment: "Comment",
    actions: "Actions",
    draft: "Draft",
    posted: "Posted",
    cancelled: "Cancelled",
    post: "Post",
    cancel: "Cancel",
    save: "Save",
    addRow: "Add row",
    remove: "Remove",
    product: "Product",
    oldPrice: "Old price",
    newPrice: "New price",
    minPrice: "Min price",
    reason: "Reason",
    startDate: "Effective from",
    endDate: "Effective to",
    currency: "Currency",
    rate: "Rate",
    requiredDocNo: "Document number is required",
    requiredDocDate: "Document date is required",
    requiredFilial: "Select branch",
    requiredPriceType: "Select price type",
    requiredItems: "Add at least one item before posting",
    rowProduct: "Select product in each row",
    rowPrice: "New price must be a number >= 0",
    detailsLoadFail: "Failed to load document details"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function statusLabel(lang, status) {
  const value = String(status || "draft");
  return text(lang, value);
}

function statusBadge(lang, status) {
  const value = String(status || "draft");
  if (value === "posted") return `<span class="badge text-bg-success-subtle border border-success-subtle">${esc(statusLabel(lang, value))}</span>`;
  if (value === "cancelled") return `<span class="badge text-bg-secondary">${esc(statusLabel(lang, value))}</span>`;
  return `<span class="badge text-bg-warning-subtle border border-warning-subtle">${esc(statusLabel(lang, value))}</span>`;
}

function toDateInput(ts) {
  if (!ts) return "";
  const date = new Date(Number(ts) * 1000);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeDoc(item) {
  return {
    id: Number(item?.id || 0),
    doc_no: String(item?.doc_no || ""),
    doc_date: Number(item?.doc_date || 0),
    filial_id: item?.filial_id ? Number(item.filial_id) : null,
    filial_name: String(item?.filial_name || ""),
    price_type_id: item?.price_type_id ? Number(item.price_type_id) : null,
    price_type_name: String(item?.price_type_name || ""),
    status: String(item?.status || "draft"),
    items_count: Number(item?.items_count || 0),
    comment: String(item?.comment || "")
  };
}

function normalizeSimple(row) {
  return {
    id: Number(row?.id || 0),
    name: String(row?.name || row?.full_name || "")
  };
}

function optionHtml(rows, selected, emptyText) {
  return `
    <option value="">${esc(emptyText)}</option>
    ${rows.map((row) => `<option value="${row.id}" ${Number(selected || 0) === row.id ? "selected" : ""}>${esc(row.name || row.id)}</option>`).join("")}
  `;
}

function rowHtml(products, item = {}, idx = 0, lang = "ru") {
  return `
    <tr data-price-item-row>
      <td style="min-width:220px">
        <select class="form-select form-select-sm" data-item="product_id">
          ${optionHtml(products, item.product_id, text(lang, "product"))}
        </select>
      </td>
      <td style="width:130px"><input class="form-control form-control-sm" type="number" min="0" step="0.01" data-item="old_price" value="${esc(item.old_price ?? "")}"></td>
      <td style="width:130px"><input class="form-control form-control-sm" type="number" min="0" step="0.01" data-item="new_price" value="${esc(item.new_price ?? "")}"></td>
      <td style="width:130px"><input class="form-control form-control-sm" type="number" min="0" step="0.01" data-item="min_price" value="${esc(item.min_price ?? 0)}"></td>
      <td><input class="form-control form-control-sm" data-item="comment" value="${esc(item.comment || "")}"></td>
      <td style="width:80px" class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" data-remove-row="${idx}">${esc(text(lang, "remove"))}</button>
      </td>
    </tr>
  `;
}

function modalHtml(lang, draft, refs) {
  const { filials, priceTypes, products } = refs;
  const items = Array.isArray(draft.items) ? draft.items : [];
  return `
    <div class="row g-3 mb-2">
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "docNo"))}</label>
        <input class="form-control" name="doc_no" value="${esc(draft.doc_no || "")}">
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "docDate"))}</label>
        <input class="form-control" type="date" name="doc_date" value="${esc(toDateInput(draft.doc_date) || toDateInput(Date.now() / 1000))}">
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "filial"))}</label>
        <select class="form-select" name="filial_id">${optionHtml(filials, draft.filial_id, text(lang, "filial"))}</select>
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "priceType"))}</label>
        <select class="form-select" name="price_type_id">${optionHtml(priceTypes, draft.price_type_id, text(lang, "priceType"))}</select>
      </div>

      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "status"))}</label>
        <select class="form-select" name="status">
          <option value="draft" ${draft.status === "draft" ? "selected" : ""}>${esc(text(lang, "draft"))}</option>
          <option value="posted" ${draft.status === "posted" ? "selected" : ""}>${esc(text(lang, "posted"))}</option>
          <option value="cancelled" ${draft.status === "cancelled" ? "selected" : ""}>${esc(text(lang, "cancelled"))}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "startDate"))}</label>
        <input class="form-control" type="date" name="start_date" value="${esc(toDateInput(draft.start_date))}">
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "endDate"))}</label>
        <input class="form-control" type="date" name="end_date" value="${esc(toDateInput(draft.end_date))}">
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "currency"))}</label>
        <input class="form-control" name="currency_code" value="${esc(draft.currency_code || "UZS")}">
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "rate"))}</label>
        <input class="form-control" type="number" min="0.000001" step="0.000001" name="currency_rate" value="${esc(draft.currency_rate ?? 1)}">
      </div>
      <div class="col-md-9">
        <label class="form-label">${esc(text(lang, "reason"))}</label>
        <input class="form-control" name="reason" value="${esc(draft.reason || "")}">
      </div>
      <div class="col-12">
        <label class="form-label">${esc(text(lang, "comment"))}</label>
        <textarea class="form-control" rows="2" name="comment">${esc(draft.comment || "")}</textarea>
      </div>
    </div>

    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="m-0">${esc(text(lang, "items"))}</h6>
      <button type="button" class="btn btn-sm btn-outline-primary" data-add-row>${esc(text(lang, "addRow"))}</button>
    </div>
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead>
          <tr>
            <th>${esc(text(lang, "product"))}</th>
            <th>${esc(text(lang, "oldPrice"))}</th>
            <th>${esc(text(lang, "newPrice"))}</th>
            <th>${esc(text(lang, "minPrice"))}</th>
            <th>${esc(text(lang, "comment"))}</th>
            <th></th>
          </tr>
        </thead>
        <tbody data-items-body>
          ${(items.length ? items : [{}]).map((item, idx) => rowHtml(products, item, idx, lang)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindModalRows(modalEl, refs) {
  const lang = langOf();
  const body = modalEl.querySelector("[data-items-body]");
  const addBtn = modalEl.querySelector("[data-add-row]");
  if (!body || !addBtn) return;

  addBtn.addEventListener("click", () => {
    const nextIndex = body.querySelectorAll("[data-price-item-row]").length;
    body.insertAdjacentHTML("beforeend", rowHtml(refs.products, {}, nextIndex, lang));
  });

  body.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-remove-row]");
    if (!btn) return;
    const row = btn.closest("[data-price-item-row]");
    if (!row) return;
    row.remove();
    if (!body.querySelector("[data-price-item-row]")) {
      body.insertAdjacentHTML("beforeend", rowHtml(refs.products, {}, 0, lang));
    }
  });
}

function readModalForm(modalEl) {
  const get = (name) => modalEl.querySelector(`[name='${name}']`);
  const val = (name) => String(get(name)?.value || "").trim();

  const status = val("status") || "draft";
  const items = [];
  modalEl.querySelectorAll("[data-price-item-row]").forEach((row, idx) => {
    const productId = Number(row.querySelector("[data-item='product_id']")?.value || 0);
    const newPriceRaw = String(row.querySelector("[data-item='new_price']")?.value || "").trim();
    const oldPriceRaw = String(row.querySelector("[data-item='old_price']")?.value || "").trim();
    const minPriceRaw = String(row.querySelector("[data-item='min_price']")?.value || "").trim();
    const comment = String(row.querySelector("[data-item='comment']")?.value || "").trim();

    if (!productId && !newPriceRaw && !oldPriceRaw && !minPriceRaw && !comment) return;
    items.push({
      product_id: productId,
      old_price: oldPriceRaw === "" ? null : Number(oldPriceRaw),
      new_price: newPriceRaw === "" ? null : Number(newPriceRaw),
      min_price: minPriceRaw === "" ? 0 : Number(minPriceRaw),
      comment: comment || null,
      sort_order: (idx + 1) * 10
    });
  });

  return {
    doc_no: val("doc_no"),
    doc_date: val("doc_date"),
    filial_id: Number(val("filial_id") || 0) || null,
    price_type_id: Number(val("price_type_id") || 0) || null,
    status,
    start_date: val("start_date") || null,
    end_date: val("end_date") || null,
    currency_code: val("currency_code") || "UZS",
    currency_rate: Number(val("currency_rate") || 1),
    reason: val("reason") || null,
    comment: val("comment") || null,
    items
  };
}

function validateDraft(lang, payload, fields) {
  if (fields.isRequired("doc_no") && isEmptyFieldValue(payload.doc_no)) throw new Error(text(lang, "requiredDocNo"));
  if (fields.isRequired("doc_date") && isEmptyFieldValue(payload.doc_date)) throw new Error(text(lang, "requiredDocDate"));
  if (fields.isRequired("filial_id") && !payload.filial_id) throw new Error(text(lang, "requiredFilial"));
  if (fields.isRequired("price_type_id") && !payload.price_type_id) throw new Error(text(lang, "requiredPriceType"));
  if (payload.status === "posted" && payload.items.length === 0) throw new Error(text(lang, "requiredItems"));

  for (const item of payload.items) {
    if (!item.product_id) throw new Error(text(lang, "rowProduct"));
    if (!Number.isFinite(Number(item.new_price)) || Number(item.new_price) < 0) throw new Error(text(lang, "rowPrice"));
  }
}

async function openEntityModal(ctx, doc, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !doc?.id;

  let refs;
  let draft;
  try {
    const [filialsResp, priceTypesResp, productsResp, detailsResp] = await Promise.all([
      api("/filials"),
      api("/price-types"),
      api("/products"),
      isCreate ? Promise.resolve({ item: null, items: [] }) : api(`/price-setup-docs/${doc.id}`)
    ]);

    refs = {
      filials: (filialsResp.items || []).map(normalizeSimple),
      priceTypes: (priceTypesResp.items || []).map(normalizeSimple).filter((row) => row.id > 0),
      products: (productsResp.items || []).map(normalizeSimple).filter((row) => row.id > 0)
    };
    draft = isCreate
      ? { status: "draft", currency_code: "UZS", currency_rate: 1, items: [{}], doc_date: Math.floor(Date.now() / 1000) }
      : { ...(detailsResp.item || doc), items: detailsResp.items || [] };
  } catch {
    throw new Error(text(lang, "detailsLoadFail"));
  }

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, draft, refs),
    onSave: async (modalEl) => {
      const payload = readModalForm(modalEl);
      validateDraft(lang, payload, fields);

      if (isCreate) {
        await api("/price-setup-docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/price-setup-docs/${doc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      await render(ctx);
    }
  });

  setTimeout(() => {
    const modals = document.querySelectorAll(".modal");
    const modalEl = modals[modals.length - 1];
    if (modalEl) bindModalRows(modalEl, refs);
  }, 0);
}

function openPriceTypeModal(ctx) {
  const { api, openModal } = ctx;
  const lang = langOf();
  openModal({
    title: text(lang, "createType"),
    saveText: text(lang, "save"),
    bodyHtml: `
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">${esc(text(lang, "priceType"))}</label>
          <input class="form-control" name="name">
        </div>
      </div>
    `,
    onSave: async (modalEl) => {
      const name = String(modalEl.querySelector("[name='name']")?.value || "").trim();
      if (!name) throw new Error(text(lang, "requiredPriceType"));

      await api("/price-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, is_active: 1 })
      });

      await render(ctx);
    }
  });
}

export async function render(ctx) {
  const { api, page, viewEl, state, section, accessFor } = ctx;
  const lang = langOf();
  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  const perms = accessFor(state.me.role);
  const canWrite = Boolean(perms?.[section.id]?.write);
  const q = viewEl.getAttribute("data-q") || "";

  let docsResp;
  let priceTypesResp;
  let fields;
  try {
    [docsResp, priceTypesResp, fields] = await Promise.all([
      api(`/price-setup-docs?q=${encodeURIComponent(q)}`),
      api("/price-types"),
      loadEntityFieldAccess(api, "price_setup_doc")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const docs = (docsResp.items || []).map(normalizeDoc);
  const priceTypes = (priceTypesResp.items || []).filter((row) => Number(row?.is_active || 0) === 1);

  viewEl.innerHTML = `
    ${priceTypes.length ? "" : `<div class="alert alert-warning mb-3">${esc(text(lang, "noPriceTypes"))}</div>`}
    <div class="card mb-3 entity-toolbar-card">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 ${canWrite ? "col-md-8 col-lg-9" : ""}">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="prices_docs_q" class="form-control" value="${esc(q)}">
          </div>
          ${canWrite ? `
            <div class="col-12 col-md-4 col-lg-3 d-grid gap-2">
              <button id="prices_docs_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
              <button id="prices_docs_create_type" class="btn btn-outline-secondary btn-sm">${esc(text(lang, "createType"))}</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>

    ${docs.length ? `
      <div class="card">
        <div class="card-body table-wrap">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>${esc(text(lang, "docNo"))}</th>
                <th>${esc(text(lang, "docDate"))}</th>
                <th>${esc(text(lang, "filial"))}</th>
                <th>${esc(text(lang, "priceType"))}</th>
                <th>${esc(text(lang, "status"))}</th>
                <th>${esc(text(lang, "items"))}</th>
                <th>${esc(text(lang, "comment"))}</th>
                ${canWrite ? `<th>${esc(text(lang, "actions"))}</th>` : ""}
              </tr>
            </thead>
            <tbody>
              ${docs.map((doc) => `
                <tr>
                  <td class="fw-semibold">${esc(doc.doc_no)}</td>
                  <td>${esc(toDateInput(doc.doc_date))}</td>
                  <td>${esc(doc.filial_name || "-")}</td>
                  <td>${esc(doc.price_type_name || "-")}</td>
                  <td>${statusBadge(lang, doc.status)}</td>
                  <td>${doc.items_count}</td>
                  <td>${esc(doc.comment || "-")}</td>
                  ${canWrite ? `
                    <td>
                      <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-sm btn-outline-primary" data-edit-doc="${doc.id}">${esc(text(lang, "edit"))}</button>
                        ${doc.status !== "posted" ? `<button class="btn btn-sm btn-outline-success" data-set-status="${doc.id}" data-status="posted">${esc(text(lang, "post"))}</button>` : ""}
                        ${doc.status === "posted" ? `<button class="btn btn-sm btn-outline-secondary" data-set-status="${doc.id}" data-status="cancelled">${esc(text(lang, "cancel"))}</button>` : ""}
                      </div>
                    </td>
                  ` : ""}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    ` : emptyHtml(text(lang, "noItems"))}
  `;

  const qEl = document.getElementById("prices_docs_q");
  if (qEl) {
    qEl.addEventListener("input", () => {
      viewEl.setAttribute("data-q", qEl.value.trim());
      queueRerender(viewEl, "__pricesDocsTimer", () => render(ctx), 180);
    });
  }

  if (canWrite) {
    const createBtn = document.getElementById("prices_docs_create");
    if (createBtn) {
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, fields));
    }
    const createTypeBtn = document.getElementById("prices_docs_create_type");
    if (createTypeBtn) {
      createTypeBtn.addEventListener("click", () => openPriceTypeModal(ctx));
    }

    document.querySelectorAll("[data-edit-doc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editDoc || 0);
        const doc = docs.find((entry) => entry.id === id);
        if (doc) openEntityModal(ctx, doc, fields);
      });
    });

    document.querySelectorAll("[data-set-status]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.setStatus || 0);
        const status = String(btn.dataset.status || "");
        await api(`/price-setup-docs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
        await render(ctx);
      });
    });
  }
}
