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
    subtitle: "Документы установки цен и подтверждение цен по филиалам",
    search: "Поиск по номеру",
    create: "Создать документ",
    createType: "Добавить тип цены",
    edit: "Редактировать документ",
    noItems: "Документы не найдены",
    noPriceTypes: "Нет активных типов цен. Сначала создайте тип цены.",
    docNo: "Номер",
    docDate: "Дата",
    filial: "Филиал",
    allFilials: "Все филиалы",
    priceType: "Тип цены",
    status: "Статус",
    items: "Позиции",
    comment: "Комментарий",
    actions: "Действия",
    draft: "Черновик",
    posted: "Подтвержден",
    cancelled: "Отменен",
    post: "Подтвердить",
    cancel: "Отменить",
    save: "Сохранить",
    addRow: "Добавить строку",
    remove: "Удалить",
    product: "Товар",
    oldPrice: "Старая цена",
    newPrice: "Новая цена",
    minPrice: "Мин. цена",
    basis: "Основание",
    selectBasis: "Выбрать",
    clearBasis: "Очистить",
    basisType: "Тип документа",
    startDate: "Действует с",
    endDate: "Действует до",
    currency: "Валюта",
    rate: "Курс",
    autoNumber: "Автоматически после сохранения",
    autoDate: "Автоматически при создании",
    requiredFilial: "Выберите филиал или включите режим \"Все филиалы\"",
    requiredPriceType: "Выберите тип цены",
    rowProduct: "Выберите товар в каждой заполненной строке",
    rowPrice: "Новая цена должна быть числом >= 0",
    detailsLoadFail: "Не удалось загрузить документ",
    basisTypeTitle: "Выбор типа документа",
    basisDocTitle: "Выбор документа-основания",
    choose: "Выбрать",
    emptyBasis: "Не выбрано",
    mixedOldPrice: "Разные цены по филиалам",
    oldPriceHint: "Старая цена подтягивается автоматически",
    noBasisDocs: "Подходящие документы не найдены"
  },
  uz: {
    title: "Narxlar: Hujjatlar",
    subtitle: "Narx o'rnatish hujjatlari va filiallar bo'yicha tasdiqlash",
    search: "Raqam bo'yicha qidiruv",
    create: "Hujjat yaratish",
    createType: "Narx turi qo'shish",
    edit: "Hujjatni tahrirlash",
    noItems: "Hujjatlar topilmadi",
    noPriceTypes: "Faol narx turlari yo'q. Avval narx turini yarating.",
    docNo: "Raqam",
    docDate: "Sana",
    filial: "Filial",
    allFilials: "Barcha filiallar",
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
    basis: "Asos",
    selectBasis: "Tanlash",
    clearBasis: "Tozalash",
    basisType: "Hujjat turi",
    startDate: "Amal qilish boshi",
    endDate: "Amal qilish oxiri",
    currency: "Valyuta",
    rate: "Kurs",
    autoNumber: "Saqlangandan keyin avtomatik",
    autoDate: "Yaratilganda avtomatik",
    requiredFilial: "Filialni tanlang yoki \"Barcha filiallar\" rejimini yoqing",
    requiredPriceType: "Narx turini tanlang",
    rowProduct: "Har bir to'ldirilgan satrda tovarni tanlang",
    rowPrice: "Yangi narx 0 dan katta yoki teng bo'lishi kerak",
    detailsLoadFail: "Hujjatni yuklab bo'lmadi",
    basisTypeTitle: "Hujjat turi tanlash",
    basisDocTitle: "Asos hujjatini tanlash",
    choose: "Tanlash",
    emptyBasis: "Tanlanmagan",
    mixedOldPrice: "Filiallar bo'yicha narxlar turlicha",
    oldPriceHint: "Eski narx avtomatik chiqadi",
    noBasisDocs: "Mos hujjatlar topilmadi"
  },
  en: {
    title: "Prices: Documents",
    subtitle: "Price setup documents and posting by branches",
    search: "Search by number",
    create: "Create document",
    createType: "Add price type",
    edit: "Edit document",
    noItems: "No documents found",
    noPriceTypes: "No active price types. Create a price type first.",
    docNo: "Number",
    docDate: "Date",
    filial: "Branch",
    allFilials: "All branches",
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
    basis: "Basis",
    selectBasis: "Select",
    clearBasis: "Clear",
    basisType: "Document type",
    startDate: "Effective from",
    endDate: "Effective to",
    currency: "Currency",
    rate: "Rate",
    autoNumber: "Generated automatically after save",
    autoDate: "Generated automatically on create",
    requiredFilial: "Select a branch or enable all branches mode",
    requiredPriceType: "Select price type",
    rowProduct: "Select a product in each filled row",
    rowPrice: "New price must be a number >= 0",
    detailsLoadFail: "Failed to load document",
    basisTypeTitle: "Choose document type",
    basisDocTitle: "Choose basis document",
    choose: "Choose",
    emptyBasis: "Not selected",
    mixedOldPrice: "Different prices across branches",
    oldPriceHint: "Old price is filled automatically",
    noBasisDocs: "No matching documents found"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function localeFor(lang) {
  return lang === "uz" ? "uz-UZ" : (lang === "en" ? "en-US" : "ru-RU");
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
    applies_all_filials: Number(item?.applies_all_filials || 0) === 1,
    price_type_id: item?.price_type_id ? Number(item.price_type_id) : null,
    price_type_name: String(item?.price_type_name || ""),
    status: String(item?.status || "draft"),
    items_count: Number(item?.items_count || 0),
    comment: String(item?.comment || ""),
    basis_doc_type: String(item?.basis_doc_type || ""),
    basis_doc_id: item?.basis_doc_id ? Number(item.basis_doc_id) : null,
    basis_doc_no: String(item?.basis_doc_no || "")
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

function parseFlexibleNumber(value) {
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

function formatMoneyNumber(lang, value) {
  const n = parseFlexibleNumber(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n).replace(/\u00A0/g, " ");
}

function formatMoneyInput(value) {
  let s = String(value ?? "").replace(/[^\d,.\s]/g, "").replace(/[\s\u00A0]/g, "");
  if (!s) return "";
  s = s.replace(/\./g, ",");
  const commaIndex = s.indexOf(",");
  const hasComma = commaIndex >= 0;
  let intPart = hasComma ? s.slice(0, commaIndex) : s;
  let fracPart = hasComma ? s.slice(commaIndex + 1).replace(/,/g, "") : "";
  intPart = intPart.replace(/^0+(?=\d)/, "");
  const grouped = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  fracPart = fracPart.slice(0, 2);
  if (hasComma) return `${grouped},${fracPart}`;
  return grouped;
}

function bindMoneyInput(input) {
  if (!input) return;
  if (input.value) input.value = formatMoneyInput(input.value);
  input.addEventListener("input", () => {
    input.value = formatMoneyInput(input.value);
  });
  input.addEventListener("blur", () => {
    const parsed = parseFlexibleNumber(input.value);
    input.value = Number.isFinite(parsed) ? formatMoneyNumber(langOf(), parsed) : "";
  });
}

function rowHtml(products, item = {}, idx = 0, lang = "ru") {
  return `
    <tr data-price-item-row>
      <td style="min-width:220px">
        <select class="form-select form-select-sm" data-item="product_id">
          ${optionHtml(products, item.product_id, text(lang, "product"))}
        </select>
      </td>
      <td style="width:150px">
        <input class="form-control form-control-sm" type="text" data-item="old_price" value="${esc(formatMoneyNumber(lang, item.old_price))}" placeholder="${esc(text(lang, "oldPrice"))}" readonly>
      </td>
      <td style="width:150px">
        <input class="form-control form-control-sm" type="text" inputmode="decimal" data-item="new_price" value="${esc(formatMoneyNumber(lang, item.new_price))}">
      </td>
      <td style="width:150px">
        <input class="form-control form-control-sm" type="text" inputmode="decimal" data-item="min_price" value="${esc(formatMoneyNumber(lang, item.min_price ?? 0))}">
      </td>
      <td>
        <input class="form-control form-control-sm" data-item="comment" value="${esc(item.comment || "")}">
      </td>
      <td style="width:90px" class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" data-remove-row="${idx}">${esc(text(lang, "remove"))}</button>
      </td>
    </tr>
  `;
}

function modalHtml(lang, draft, refs, isCreate) {
  const { filials, priceTypes, products } = refs;
  const items = Array.isArray(draft.items) ? draft.items : [];
  const basisLabel = draft.basis_doc_no || text(lang, "emptyBasis");
  return `
    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "docNo"))}</label>
        <input class="form-control" value="${esc(draft.doc_no || text(lang, "autoNumber"))}" readonly>
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "docDate"))}</label>
        <input class="form-control" value="${esc(isCreate ? toDateInput(Date.now() / 1000) : toDateInput(draft.doc_date))}" readonly>
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "status"))}</label>
        <input class="form-control" value="${esc(statusLabel(lang, draft.status || "draft"))}" readonly>
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "priceType"))}</label>
        <select class="form-select" name="price_type_id">${optionHtml(priceTypes, draft.price_type_id, text(lang, "priceType"))}</select>
      </div>

      <div class="col-md-4">
        <label class="form-label">${esc(text(lang, "filial"))}</label>
        <select class="form-select" name="filial_id" ${draft.applies_all_filials ? "disabled" : ""}>${optionHtml(filials, draft.filial_id, text(lang, "filial"))}</select>
      </div>
      <div class="col-md-4 d-flex align-items-end">
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" role="switch" name="applies_all_filials" ${draft.applies_all_filials ? "checked" : ""}>
          <label class="form-check-label">${esc(text(lang, "allFilials"))}</label>
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label">${esc(text(lang, "currency"))}</label>
        <input class="form-control" name="currency_code" value="${esc(draft.currency_code || "UZS")}">
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
        <label class="form-label">${esc(text(lang, "rate"))}</label>
        <input class="form-control" name="currency_rate" value="${esc(draft.currency_rate ?? 1)}">
      </div>
      <div class="col-md-3">
        <label class="form-label">${esc(text(lang, "basis"))}</label>
        <div class="input-group">
          <input class="form-control" name="basis_doc_label" value="${esc(basisLabel)}" readonly>
          <button type="button" class="btn btn-outline-secondary" data-basis-select>${esc(text(lang, "selectBasis"))}</button>
          <button type="button" class="btn btn-outline-secondary" data-basis-clear>${esc(text(lang, "clearBasis"))}</button>
        </div>
        <input type="hidden" name="basis_doc_type" value="${esc(draft.basis_doc_type || "")}">
        <input type="hidden" name="basis_doc_id" value="${esc(draft.basis_doc_id || "")}">
      </div>

      <div class="col-12">
        <label class="form-label">${esc(text(lang, "comment"))}</label>
        <textarea class="form-control" rows="2" name="comment">${esc(draft.comment || "")}</textarea>
      </div>
    </div>

    <div class="small text-muted mb-2">${esc(text(lang, "oldPriceHint"))}</div>
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

function getDocContext(modalEl) {
  const filialEl = modalEl.querySelector("[name='filial_id']");
  const allFilialsEl = modalEl.querySelector("[name='applies_all_filials']");
  const priceTypeEl = modalEl.querySelector("[name='price_type_id']");
  return {
    filial_id: Number(filialEl?.value || 0) || null,
    applies_all_filials: Boolean(allFilialsEl?.checked),
    price_type_id: Number(priceTypeEl?.value || 0) || null
  };
}

async function refreshOldPrices(ctx, modalEl, refs) {
  const lang = langOf();
  const body = modalEl.querySelector("[data-items-body]");
  if (!body) return;

  const rows = [...body.querySelectorAll("[data-price-item-row]")];
  const productIds = [...new Set(
    rows
      .map((row) => Number(row.querySelector("[data-item='product_id']")?.value || 0))
      .filter((id) => id > 0)
  )];
  const context = getDocContext(modalEl);

  const clearValues = () => {
    rows.forEach((row) => {
      const input = row.querySelector("[data-item='old_price']");
      if (input) {
        input.value = "";
        input.placeholder = "";
        input.title = "";
      }
    });
  };

  if (!productIds.length || !context.price_type_id || (!context.applies_all_filials && !context.filial_id)) {
    clearValues();
    return;
  }

  const qs = new URLSearchParams();
  qs.set("price_type_id", String(context.price_type_id));
  if (context.applies_all_filials) {
    qs.set("applies_all_filials", "1");
  } else {
    qs.set("filial_id", String(context.filial_id));
  }
  if (refs.docId) qs.set("exclude_doc_id", String(refs.docId));
  productIds.forEach((productId) => qs.append("product_id", String(productId)));

  try {
    const resp = await ctx.api(`/price-setup-docs/old-prices?${qs.toString()}`);
    const priceMap = new Map((resp.items || []).map((item) => [Number(item.product_id), item.old_price]));
    rows.forEach((row) => {
      const productId = Number(row.querySelector("[data-item='product_id']")?.value || 0);
      const input = row.querySelector("[data-item='old_price']");
      if (!input) return;
      const oldPrice = priceMap.get(productId);
      if (oldPrice === null || oldPrice === undefined) {
        input.value = "";
        input.placeholder = text(lang, "mixedOldPrice");
        input.title = text(lang, "mixedOldPrice");
        return;
      }
      input.value = formatMoneyNumber(lang, oldPrice);
      input.placeholder = "";
      input.title = "";
    });
  } catch {
    clearValues();
  }
}

function readModalForm(modalEl) {
  const get = (name) => modalEl.querySelector(`[name='${name}']`);
  const val = (name) => String(get(name)?.value || "").trim();
  const appliesAllFilials = Boolean(get("applies_all_filials")?.checked);
  const items = [];

  modalEl.querySelectorAll("[data-price-item-row]").forEach((row, idx) => {
    const productId = Number(row.querySelector("[data-item='product_id']")?.value || 0);
    const newPriceRaw = String(row.querySelector("[data-item='new_price']")?.value || "").trim();
    const minPriceRaw = String(row.querySelector("[data-item='min_price']")?.value || "").trim();
    const comment = String(row.querySelector("[data-item='comment']")?.value || "").trim();

    if (!productId && !newPriceRaw && !minPriceRaw && !comment) return;
    items.push({
      product_id: productId,
      new_price: newPriceRaw === "" ? null : parseFlexibleNumber(newPriceRaw),
      min_price: minPriceRaw === "" ? 0 : parseFlexibleNumber(minPriceRaw),
      comment: comment || null,
      sort_order: (idx + 1) * 10
    });
  });

  return {
    filial_id: appliesAllFilials ? null : (Number(val("filial_id") || 0) || null),
    applies_all_filials: appliesAllFilials ? 1 : 0,
    price_type_id: Number(val("price_type_id") || 0) || null,
    start_date: val("start_date") || null,
    end_date: val("end_date") || null,
    currency_code: val("currency_code") || "UZS",
    currency_rate: parseFlexibleNumber(val("currency_rate")) ?? 1,
    basis_doc_type: val("basis_doc_type") || null,
    basis_doc_id: Number(val("basis_doc_id") || 0) || null,
    comment: val("comment") || null,
    items
  };
}

function validateDraft(lang, payload, fields) {
  if (!payload.applies_all_filials && fields.isRequired("filial_id") && !payload.filial_id) {
    throw new Error(text(lang, "requiredFilial"));
  }
  if (fields.isRequired("price_type_id") && !payload.price_type_id) {
    throw new Error(text(lang, "requiredPriceType"));
  }

  for (const item of payload.items) {
    if (!item.product_id) throw new Error(text(lang, "rowProduct"));
    if (!Number.isFinite(Number(item.new_price)) || Number(item.new_price) < 0) throw new Error(text(lang, "rowPrice"));
    if (!Number.isFinite(Number(item.min_price)) || Number(item.min_price) < 0) throw new Error(text(lang, "rowPrice"));
  }
}

function isOwnerRole(role) {
  return role === "super_admin" || role === "business_owner";
}

function hasActionPermission(state, sectionId, action) {
  if (isOwnerRole(state?.me?.role)) return true;
  return Boolean(state?.rolePermissions?.has(`${sectionId}.${action}`));
}

async function chooseBasisType(ctx, basisTypes) {
  const lang = langOf();
  return new Promise((resolve) => {
    ctx.openModal({
      title: text(lang, "basisTypeTitle"),
      saveText: text(lang, "choose"),
      bodyHtml: `
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">${esc(text(lang, "basisType"))}</label>
            <select class="form-select" name="basis_doc_type">
              ${basisTypes.map((item) => `<option value="${esc(item.key)}">${esc((item.label && (item.label[lang] || item.label.ru || item.label.en)) || item.key)}</option>`).join("")}
            </select>
          </div>
        </div>
      `,
      onSave: async (modalEl) => {
        const selected = String(modalEl.querySelector("[name='basis_doc_type']")?.value || "").trim();
        resolve(selected || null);
      }
    });
  });
}

async function chooseBasisDoc(ctx, basisType, currentDocId) {
  const lang = langOf();
  const qs = new URLSearchParams();
  qs.set("basis_doc_type", basisType);
  if (currentDocId) qs.set("exclude_doc_id", String(currentDocId));
  const resp = await ctx.api(`/price-setup-docs/basis-docs?${qs.toString()}`);
  const docs = resp.items || [];

  return new Promise((resolve) => {
    ctx.openModal({
      title: text(lang, "basisDocTitle"),
      saveText: text(lang, "choose"),
      bodyHtml: docs.length ? `
        <div class="list-group">
          ${docs.map((doc) => `
            <label class="list-group-item d-flex gap-3 align-items-start">
              <input class="form-check-input mt-1" type="radio" name="basis_doc_id" value="${doc.id}">
              <div>
                <div class="fw-semibold">${esc(doc.doc_no || "")}</div>
                <div class="small text-muted">${esc(toDateInput(doc.doc_date))}</div>
              </div>
            </label>
          `).join("")}
        </div>
      ` : `<div class="text-muted">${esc(text(lang, "noBasisDocs"))}</div>`,
      onSave: async (modalEl) => {
        const selected = Number(modalEl.querySelector("[name='basis_doc_id']:checked")?.value || 0) || null;
        const doc = docs.find((item) => Number(item.id) === selected) || null;
        resolve(doc);
      }
    });
  });
}

async function bindModalRows(ctx, modalEl, refs) {
  const lang = langOf();
  const body = modalEl.querySelector("[data-items-body]");
  const addBtn = modalEl.querySelector("[data-add-row]");
  const filialSelect = modalEl.querySelector("[name='filial_id']");
  const allFilialsSwitch = modalEl.querySelector("[name='applies_all_filials']");
  const priceTypeSelect = modalEl.querySelector("[name='price_type_id']");

  const bindRowInputs = (scope) => {
    scope.querySelectorAll("[data-item='new_price'], [data-item='min_price']").forEach((input) => bindMoneyInput(input));
  };

  bindRowInputs(modalEl);
  await refreshOldPrices(ctx, modalEl, refs);

  if (addBtn && body) {
    addBtn.addEventListener("click", async () => {
      const nextIndex = body.querySelectorAll("[data-price-item-row]").length;
      body.insertAdjacentHTML("beforeend", rowHtml(refs.products, {}, nextIndex, lang));
      const row = body.lastElementChild;
      if (row) bindRowInputs(row);
      await refreshOldPrices(ctx, modalEl, refs);
    });
  }

  if (body) {
    body.addEventListener("click", async (ev) => {
      const btn = ev.target.closest("[data-remove-row]");
      if (!btn) return;
      const row = btn.closest("[data-price-item-row]");
      if (!row) return;
      row.remove();
      if (!body.querySelector("[data-price-item-row]")) {
        body.insertAdjacentHTML("beforeend", rowHtml(refs.products, {}, 0, lang));
        const newRow = body.lastElementChild;
        if (newRow) bindRowInputs(newRow);
      }
      await refreshOldPrices(ctx, modalEl, refs);
    });

    body.addEventListener("change", async (ev) => {
      if (ev.target.matches("[data-item='product_id']")) {
        await refreshOldPrices(ctx, modalEl, refs);
      }
    });
  }

  if (allFilialsSwitch && filialSelect) {
    allFilialsSwitch.addEventListener("change", async () => {
      filialSelect.disabled = allFilialsSwitch.checked;
      await refreshOldPrices(ctx, modalEl, refs);
    });
  }

  if (filialSelect) filialSelect.addEventListener("change", async () => refreshOldPrices(ctx, modalEl, refs));
  if (priceTypeSelect) priceTypeSelect.addEventListener("change", async () => refreshOldPrices(ctx, modalEl, refs));

  const basisSelectBtn = modalEl.querySelector("[data-basis-select]");
  if (basisSelectBtn) {
    basisSelectBtn.addEventListener("click", async () => {
      const typesResp = await ctx.api("/price-setup-docs/basis-types");
      const basisType = await chooseBasisType(ctx, typesResp.items || []);
      if (!basisType) return;
      const doc = await chooseBasisDoc(ctx, basisType, refs.docId);
      if (!doc) return;
      const labelEl = modalEl.querySelector("[name='basis_doc_label']");
      const typeEl = modalEl.querySelector("[name='basis_doc_type']");
      const idEl = modalEl.querySelector("[name='basis_doc_id']");
      if (labelEl) labelEl.value = String(doc.doc_no || "");
      if (typeEl) typeEl.value = basisType;
      if (idEl) idEl.value = String(doc.id || "");
    });
  }

  const basisClearBtn = modalEl.querySelector("[data-basis-clear]");
  if (basisClearBtn) {
    basisClearBtn.addEventListener("click", () => {
      const labelEl = modalEl.querySelector("[name='basis_doc_label']");
      const typeEl = modalEl.querySelector("[name='basis_doc_type']");
      const idEl = modalEl.querySelector("[name='basis_doc_id']");
      if (labelEl) labelEl.value = text(lang, "emptyBasis");
      if (typeEl) typeEl.value = "";
      if (idEl) idEl.value = "";
    });
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
      docId: isCreate ? null : Number(doc.id),
      filials: (filialsResp.items || []).map(normalizeSimple),
      priceTypes: (priceTypesResp.items || []).map(normalizeSimple).filter((row) => row.id > 0),
      products: (productsResp.items || []).map(normalizeSimple).filter((row) => row.id > 0)
    };
    draft = isCreate
      ? { status: "draft", currency_code: "UZS", currency_rate: 1, items: [{}], applies_all_filials: false }
      : { ...(detailsResp.item || doc), items: detailsResp.items || [] };
  } catch {
    throw new Error(text(lang, "detailsLoadFail"));
  }

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, draft, refs, isCreate),
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
    if (modalEl) bindModalRows(ctx, modalEl, refs);
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
  const { api, page, viewEl, state, section } = ctx;
  const lang = langOf();
  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  const canAdd = hasActionPermission(state, section.id, "add");
  const canChange = hasActionPermission(state, section.id, "change");
  const canPost = hasActionPermission(state, section.id, "post");
  const hasToolbarActions = canAdd;
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
          <div class="col-12 ${hasToolbarActions ? "col-md-8 col-lg-9" : ""}">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="prices_docs_q" class="form-control" value="${esc(q)}">
          </div>
          ${hasToolbarActions ? `
            <div class="col-12 col-md-4 col-lg-3 d-grid gap-2">
              ${canAdd ? `<button id="prices_docs_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>` : ""}
              ${canAdd ? `<button id="prices_docs_create_type" class="btn btn-outline-secondary btn-sm">${esc(text(lang, "createType"))}</button>` : ""}
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
                ${(canChange || canPost) ? `<th>${esc(text(lang, "actions"))}</th>` : ""}
              </tr>
            </thead>
            <tbody>
              ${docs.map((doc) => `
                <tr>
                  <td class="fw-semibold">${esc(doc.doc_no)}</td>
                  <td>${esc(toDateInput(doc.doc_date))}</td>
                  <td>${esc(doc.applies_all_filials ? text(lang, "allFilials") : (doc.filial_name || "-"))}</td>
                  <td>${esc(doc.price_type_name || "-")}</td>
                  <td>${statusBadge(lang, doc.status)}</td>
                  <td>${doc.items_count}</td>
                  <td>${esc(doc.comment || "-")}</td>
                  ${(canChange || canPost) ? `
                    <td>
                      <div class="d-flex gap-2 flex-wrap">
                        ${canChange && doc.status === "draft" ? `<button class="btn btn-sm btn-outline-primary" data-edit-doc="${doc.id}">${esc(text(lang, "edit"))}</button>` : ""}
                        ${canPost && doc.status === "draft" ? `<button class="btn btn-sm btn-outline-success" data-set-status="${doc.id}" data-status="posted">${esc(text(lang, "post"))}</button>` : ""}
                        ${canPost && doc.status === "posted" ? `<button class="btn btn-sm btn-outline-secondary" data-set-status="${doc.id}" data-status="cancelled">${esc(text(lang, "cancel"))}</button>` : ""}
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

  if (canAdd) {
    const createBtn = document.getElementById("prices_docs_create");
    if (createBtn) createBtn.addEventListener("click", () => openEntityModal(ctx, null, fields));

    const createTypeBtn = document.getElementById("prices_docs_create_type");
    if (createTypeBtn) createTypeBtn.addEventListener("click", () => openPriceTypeModal(ctx));
  }

  if (canChange) {
    document.querySelectorAll("[data-edit-doc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editDoc || 0);
        const doc = docs.find((entry) => entry.id === id);
        if (doc) openEntityModal(ctx, doc, fields);
      });
    });
  }

  if (canPost) {
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
