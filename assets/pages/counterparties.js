import {
  activeBadge,
  emptyHtml,
  errorHtml,
  esc,
  isEmptyFieldValue,
  langOf,
  loadEntityFieldAccess,
  pick,
  queueRerender,
  stripDisabledFields
} from "./settings-utils.js";

const UI = {
  ru: {
    titleSuppliers: "Контрагенты: Поставщики",
    titleClients: "Контрагенты: Покупатели",
    subtitleSuppliers: "База поставщиков для закупок и взаиморасчетов",
    subtitleClients: "База покупателей для продаж и взаиморасчетов",
    search: "Поиск",
    createSupplier: "Добавить поставщика",
    createClient: "Добавить покупателя",
    editSupplier: "Редактировать поставщика",
    editClient: "Редактировать покупателя",
    noItemsSuppliers: "Поставщики не найдены",
    noItemsClients: "Покупатели не найдены",
    name: "Название",
    contactPerson: "Контактное лицо",
    phone: "Телефон",
    email: "Email",
    inn: "ИНН",
    address: "Адрес",
    comment: "Комментарий",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название",
    duplicateName: "Контрагент с таким названием уже существует",
    duplicateCode: "Контрагент с таким кодом уже существует",
    requiredFlag: "Включите хотя бы один флаг контрагента",
    statusActive: "Активен",
    statusInactive: "Неактивен",
    statusBlocked: "Заблокирован",
    personLegal: "Юр. лицо",
    personPhysical: "Физ. лицо",
    genderMale: "Мужской",
    genderFemale: "Женский",
    genderOther: "Другое",
    flags: "Флаги"
  },
  uz: {
    titleSuppliers: "Kontragentlar: Ta'minotchilar",
    titleClients: "Kontragentlar: Xaridorlar",
    subtitleSuppliers: "Xarid va hisob-kitoblar uchun ta'minotchilar bazasi",
    subtitleClients: "Sotuv va hisob-kitoblar uchun xaridorlar bazasi",
    search: "Qidiruv",
    createSupplier: "Ta'minotchi qo'shish",
    createClient: "Xaridor qo'shish",
    editSupplier: "Ta'minotchini tahrirlash",
    editClient: "Xaridorni tahrirlash",
    noItemsSuppliers: "Ta'minotchilar topilmadi",
    noItemsClients: "Xaridorlar topilmadi",
    name: "Nomi",
    contactPerson: "Mas'ul shaxs",
    phone: "Telefon",
    email: "Email",
    inn: "STIR",
    address: "Manzil",
    comment: "Izoh",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Nomini kiriting",
    duplicateName: "Bunday nomdagi kontragent allaqachon mavjud",
    duplicateCode: "Bunday koddagi kontragent allaqachon mavjud",
    requiredFlag: "Kamida bitta kontragent flagini yoqing",
    statusActive: "Faol",
    statusInactive: "Faol emas",
    statusBlocked: "Bloklangan",
    personLegal: "Yuridik shaxs",
    personPhysical: "Jismoniy shaxs",
    genderMale: "Erkak",
    genderFemale: "Ayol",
    genderOther: "Boshqa",
    flags: "Flaglar"
  },
  en: {
    titleSuppliers: "Counterparties: Suppliers",
    titleClients: "Counterparties: Buyers",
    subtitleSuppliers: "Suppliers directory for purchasing and settlements",
    subtitleClients: "Buyers directory for sales and settlements",
    search: "Search",
    createSupplier: "Add supplier",
    createClient: "Add buyer",
    editSupplier: "Edit supplier",
    editClient: "Edit buyer",
    noItemsSuppliers: "No suppliers found",
    noItemsClients: "No buyers found",
    name: "Name",
    contactPerson: "Contact person",
    phone: "Phone",
    email: "Email",
    inn: "TIN",
    address: "Address",
    comment: "Comment",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    save: "Save",
    update: "Update",
    requiredName: "Name is required",
    duplicateName: "Counterparty with this name already exists",
    duplicateCode: "Counterparty with this code already exists",
    requiredFlag: "Enable at least one counterparty flag",
    statusActive: "Active",
    statusInactive: "Inactive",
    statusBlocked: "Blocked",
    personLegal: "Legal entity",
    personPhysical: "Individual",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    flags: "Flags"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

const EXTRA_TEXT_FIELDS = [
  "code",
  "counterparty_type",
  "full_name",
  "short_name",
  "phone_1",
  "phone_2",
  "telegram",
  "country",
  "region",
  "city",
  "pinfl",
  "passport_series",
  "passport_number",
  "birth_date",
  "gender",
  "person_type",
  "bank_name",
  "mfo",
  "bank_account",
  "director",
  "manager_name"
];

const EXTRA_NUMBER_FIELDS = ["debt_limit", "payment_delay_days", "discount_level"];
const EXTRA_BOOL_FIELDS = ["is_vat_payer", "is_blacklisted", "is_supplier", "is_client", "is_employee", "is_inspection", "is_other"];

function fieldLabel(fields, lang, fieldKey, fallback) {
  return esc(fields.label(fieldKey, lang, fallback || fieldKey));
}

function optionHtml(value, selected, label) {
  return `<option value="${esc(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${esc(label)}</option>`;
}

function sectionKind(sectionId) {
  return sectionId === "counterparties_suppliers" ? "supplier" : "client";
}

function normalizeItem(item) {
  const kind = String(item?.kind || "");
  const isSupplier = item?.is_supplier === undefined || item?.is_supplier === null
    ? (kind === "supplier" ? 1 : 0)
    : Number(item?.is_supplier || 0);
  const isClient = item?.is_client === undefined || item?.is_client === null
    ? (kind === "client" ? 1 : 0)
    : Number(item?.is_client || 0);

  return {
    id: Number(item?.id || 0),
    kind,
    is_supplier: isSupplier,
    is_client: isClient,
    is_employee: Number(item?.is_employee || 0),
    is_inspection: Number(item?.is_inspection || 0),
    is_other: Number(item?.is_other || 0),
    name: String(item?.name || ""),
    full_name: String(item?.full_name || item?.name || ""),
    short_name: String(item?.short_name || ""),
    code: String(item?.code || ""),
    counterparty_type: String(item?.counterparty_type || ""),
    status: String(item?.status || (Number(item?.is_active || 0) === 1 ? "active" : "inactive")),
    contact_person: String(item?.contact_person || ""),
    phone: String(item?.phone || item?.phone_1 || ""),
    phone_1: String(item?.phone_1 || item?.phone || ""),
    phone_2: String(item?.phone_2 || ""),
    telegram: String(item?.telegram || ""),
    email: String(item?.email || ""),
    inn: String(item?.inn || ""),
    country: String(item?.country || ""),
    region: String(item?.region || ""),
    city: String(item?.city || ""),
    address: String(item?.address || ""),
    pinfl: String(item?.pinfl || ""),
    passport_series: String(item?.passport_series || ""),
    passport_number: String(item?.passport_number || ""),
    birth_date: String(item?.birth_date || ""),
    gender: String(item?.gender || ""),
    person_type: String(item?.person_type || ""),
    is_vat_payer: Number(item?.is_vat_payer || 0),
    bank_name: String(item?.bank_name || ""),
    mfo: String(item?.mfo || ""),
    bank_account: String(item?.bank_account || ""),
    director: String(item?.director || ""),
    manager_name: String(item?.manager_name || ""),
    debt_limit: Number(item?.debt_limit || 0),
    payment_delay_days: Number(item?.payment_delay_days || 0),
    discount_level: Number(item?.discount_level || 0),
    is_blacklisted: Number(item?.is_blacklisted || 0),
    comment: String(item?.comment || ""),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q, filterableFields) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  const fields = (filterableFields || []).length
    ? filterableFields
    : ["code", "full_name", "short_name", "contact_person", "phone_1", "email", "inn", "address", "city"];
  return items.filter(item => fields.some((key) => String(item?.[key] || "").toLowerCase().includes(needle)));
}

function mapSaveError(lang, error) {
  const msg = String(error?.message || error || "");
  if (msg === "Required: name" || msg === "name cannot be empty" || msg === "Required: full_name or name" || msg === "full_name cannot be empty") {
    return text(lang, "requiredName");
  }
  if (msg === "Name already exists") return text(lang, "duplicateName");
  if (msg === "Code already exists") return text(lang, "duplicateCode");
  if (msg === "At least one flag must be enabled") return text(lang, "requiredFlag");
  return msg;
}

function modalHtml(lang, item, fields) {
  const extraTextHtml = EXTRA_TEXT_FIELDS.map((key) => {
    if (!fields.showInForm(key)) return "";
    if (key === "gender") {
      return `
        <div class="col-md-4">
          <label class="form-label">${fieldLabel(fields, lang, "gender", "Gender")}</label>
          <select class="form-select" name="gender">
            ${optionHtml("", item?.gender || "", "-")}
            ${optionHtml("male", item?.gender || "", text(lang, "genderMale"))}
            ${optionHtml("female", item?.gender || "", text(lang, "genderFemale"))}
            ${optionHtml("other", item?.gender || "", text(lang, "genderOther"))}
          </select>
        </div>
      `;
    }
    if (key === "person_type") {
      return `
        <div class="col-md-4">
          <label class="form-label">${fieldLabel(fields, lang, "person_type", "Person type")}</label>
          <select class="form-select" name="person_type">
            ${optionHtml("", item?.person_type || "", "-")}
            ${optionHtml("legal", item?.person_type || "", text(lang, "personLegal"))}
            ${optionHtml("physical", item?.person_type || "", text(lang, "personPhysical"))}
          </select>
        </div>
      `;
    }
    if (key === "birth_date") {
      return `
        <div class="col-md-4">
          <label class="form-label">${fieldLabel(fields, lang, "birth_date", "Birth date")}</label>
          <input class="form-control" type="date" name="birth_date" value="${esc(item?.birth_date || "")}">
        </div>
      `;
    }
    const value = item?.[key] ?? "";
    return `
      <div class="col-md-4">
        <label class="form-label">${fieldLabel(fields, lang, key)}</label>
        <input class="form-control" name="${esc(key)}" value="${esc(value)}">
      </div>
    `;
  }).join("");

  const extraNumHtml = EXTRA_NUMBER_FIELDS.map((key) => {
    if (!fields.showInForm(key)) return "";
    const step = key === "payment_delay_days" ? "1" : "0.01";
    return `
      <div class="col-md-4">
        <label class="form-label">${fieldLabel(fields, lang, key)}</label>
        <input class="form-control" type="number" min="0" step="${step}" name="${esc(key)}" value="${esc(item?.[key] ?? 0)}">
      </div>
    `;
  }).join("");

  const extraBoolHtml = EXTRA_BOOL_FIELDS.map((key) => {
    if (!fields.showInForm(key)) return "";
    return `
      <div class="form-check form-switch me-3 mb-2">
        <input class="form-check-input" type="checkbox" role="switch" name="${esc(key)}" ${Number(item?.[key] || 0) === 1 ? "checked" : ""}>
        <label class="form-check-label">${fieldLabel(fields, lang, key)}</label>
      </div>
    `;
  }).join("");

  return `
    <div class="row g-3">
      ${fields.showInForm("status") ? `
        <div class="col-md-4">
          <label class="form-label">${fieldLabel(fields, lang, "status", text(lang, "status"))}</label>
          <select class="form-select" name="status">
            ${optionHtml("active", item?.status || "active", text(lang, "statusActive"))}
            ${optionHtml("inactive", item?.status || "active", text(lang, "statusInactive"))}
            ${optionHtml("blocked", item?.status || "active", text(lang, "statusBlocked"))}
          </select>
        </div>
      ` : ""}
      ${fields.showInForm("full_name") ? `
        <div class="col-md-8">
          <label class="form-label">${fieldLabel(fields, lang, "full_name", text(lang, "name"))}</label>
          <input class="form-control" name="full_name" value="${esc(item?.full_name || item?.name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("name") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "name"))}</label>
          <input class="form-control" name="name" value="${esc(item?.name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("phone") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "phone"))}</label>
          <input class="form-control" name="phone" value="${esc(item?.phone || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("contact_person") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "contactPerson"))}</label>
          <input class="form-control" name="contact_person" value="${esc(item?.contact_person || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("email") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "email"))}</label>
          <input class="form-control" name="email" value="${esc(item?.email || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("inn") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "inn"))}</label>
          <input class="form-control" name="inn" value="${esc(item?.inn || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("address") ? `
        <div class="col-md-8">
          <label class="form-label">${esc(text(lang, "address"))}</label>
          <input class="form-control" name="address" value="${esc(item?.address || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("comment") ? `
        <div class="col-12">
          <label class="form-label">${esc(text(lang, "comment"))}</label>
          <textarea class="form-control" rows="3" name="comment">${esc(item?.comment || "")}</textarea>
        </div>
      ` : ""}
      ${extraTextHtml}
      ${extraNumHtml}
      ${extraBoolHtml ? `
        <div class="col-12">
          <label class="form-label d-block">${esc(text(lang, "flags"))}</label>
          <div class="d-flex flex-wrap">${extraBoolHtml}</div>
        </div>
      ` : ""}
      ${fields.showInForm("is_active") ? `
        <div class="col-12">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" name="is_active" ${Number(item?.is_active ?? 1) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "active"))}</label>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function readForm(modalEl, kind) {
  const byName = (name) => modalEl.querySelector(`[name='${name}']`);
  const readText = (name) => String(byName(name)?.value || "").trim();
  const readNum = (name, fallback = 0) => {
    const raw = String(byName(name)?.value || "").trim();
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  const payload = {
    kind,
    name: readText("name"),
    full_name: readText("full_name"),
    contact_person: readText("contact_person"),
    phone: readText("phone"),
    email: readText("email"),
    inn: readText("inn"),
    address: readText("address"),
    comment: readText("comment"),
    status: readText("status") || "active",
    is_active: byName("is_active")?.checked ? 1 : 0
  };

  for (const key of EXTRA_TEXT_FIELDS) {
    payload[key] = readText(key);
  }
  for (const key of EXTRA_NUMBER_FIELDS) {
    payload[key] = readNum(key, 0);
  }
  for (const key of EXTRA_BOOL_FIELDS) {
    payload[key] = byName(key)?.checked ? 1 : 0;
  }

  payload.full_name = payload.full_name || payload.name;
  payload.phone_1 = payload.phone_1 || payload.phone;
  return payload;
}

function desktopTableHtml(items, lang, canWrite, fields) {
  const labels = {
    active: text(lang, "active"),
    inactive: text(lang, "inactive")
  };

  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              ${fields.showInList("full_name") || fields.showInList("name") ? `<th>${fieldLabel(fields, lang, "full_name", text(lang, "name"))}</th>` : ""}
              ${fields.showInList("contact_person") ? `<th style="width:170px">${esc(text(lang, "contactPerson"))}</th>` : ""}
              ${fields.showInList("phone_1") || fields.showInList("phone") ? `<th style="width:150px">${fieldLabel(fields, lang, "phone_1", text(lang, "phone"))}</th>` : ""}
              ${fields.showInList("address") ? `<th style="width:230px">${esc(text(lang, "address"))}</th>` : ""}
              ${fields.showInList("is_active") ? `<th style="width:110px">${esc(text(lang, "status"))}</th>` : ""}
              ${canWrite ? `<th style="width:160px">${esc(text(lang, "actions"))}</th>` : ""}
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                ${fields.showInList("full_name") || fields.showInList("name") ? `
                  <td>
                    <div class="fw-semibold">${esc(item.full_name || item.name)}</div>
                    ${item.code ? `<div class="small text-muted">${fieldLabel(fields, lang, "code", "Code")}: ${esc(item.code)}</div>` : ""}
                    ${fields.showInCard("inn") && item.inn ? `<div class="small text-muted">${esc(text(lang, "inn"))}: ${esc(item.inn)}</div>` : ""}
                  </td>
                ` : ""}
                ${fields.showInList("contact_person") ? `<td>${esc(item.contact_person || "-")}</td>` : ""}
                ${fields.showInList("phone_1") || fields.showInList("phone") ? `<td>${esc(item.phone_1 || item.phone || "-")}</td>` : ""}
                ${fields.showInList("address") ? `<td>${esc(item.address || "-")}</td>` : ""}
                ${fields.showInList("is_active") ? `<td>${activeBadge(item.is_active, labels)}</td>` : ""}
                ${canWrite ? `
                  <td>
                    <div class="d-flex gap-2 flex-wrap">
                      <button class="btn btn-sm btn-outline-primary" data-edit-counterparty="${item.id}">${esc(text(lang, "update"))}</button>
                      ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-counterparty="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
                    </div>
                  </td>
                ` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function mobileCardsHtml(items, lang, canWrite, fields) {
  const labels = {
    active: text(lang, "active"),
    inactive: text(lang, "inactive")
  };

  return `
    <div class="d-lg-none">
      ${items.map(item => `
        <div class="card mb-2 shadow-sm entity-mobile-card">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                ${fields.showInCard("full_name") || fields.showInCard("name") ? `<div class="fw-semibold">${esc(item.full_name || item.name)}</div>` : ""}
                ${fields.showInCard("inn") && item.inn ? `<div class="small text-muted mt-1">${esc(text(lang, "inn"))}: ${esc(item.inn)}</div>` : ""}
              </div>
              ${fields.showInCard("is_active") ? activeBadge(item.is_active, labels) : ""}
            </div>
            ${fields.showInCard("contact_person") ? `<div class="small text-muted mt-2">${esc(text(lang, "contactPerson"))}: ${esc(item.contact_person || "-")}</div>` : ""}
            ${fields.showInCard("phone_1") || fields.showInCard("phone") ? `<div class="small text-muted">${fieldLabel(fields, lang, "phone_1", text(lang, "phone"))}: ${esc(item.phone_1 || item.phone || "-")}</div>` : ""}
            ${fields.showInCard("email") ? `<div class="small text-muted">${esc(text(lang, "email"))}: ${esc(item.email || "-")}</div>` : ""}
            ${fields.showInCard("address") ? `<div class="small text-muted">${esc(text(lang, "address"))}: ${esc(item.address || "-")}</div>` : ""}
            ${canWrite ? `
              <div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3">
                <button class="btn btn-sm btn-outline-primary" data-edit-counterparty="${item.id}">${esc(text(lang, "update"))}</button>
                ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-counterparty="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
              </div>
            ` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function tableHtml(items, lang, canWrite, fields) {
  return `${desktopTableHtml(items, lang, canWrite, fields)}${mobileCardsHtml(items, lang, canWrite, fields)}`;
}

async function openEntityModal(ctx, item, kind, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;
  const kindIsSupplier = kind === "supplier";
  const draft = item || {
    kind,
    status: "active",
    is_supplier: kind === "supplier" ? 1 : 0,
    is_client: kind === "client" ? 1 : 0,
    is_employee: 0,
    is_inspection: 0,
    is_other: 0,
    is_active: 1
  };

  openModal({
    title: isCreate
      ? text(lang, kindIsSupplier ? "createSupplier" : "createClient")
      : text(lang, kindIsSupplier ? "editSupplier" : "editClient"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, draft, fields),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl, kind), fields);
      if ((fields.isRequired("full_name") || fields.isRequired("name")) && isEmptyFieldValue(payload.full_name || payload.name)) {
        throw new Error(text(lang, "requiredName"));
      }
      const enabledFlagKeys = EXTRA_BOOL_FIELDS.filter((key) => fields.isEnabled(key));
      if (enabledFlagKeys.length && enabledFlagKeys.every((key) => Number(payload[key] || 0) === 0)) {
        throw new Error(text(lang, "requiredFlag"));
      }

      try {
        if (isCreate) {
          await api("/counterparties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await api(`/counterparties/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      } catch (e) {
        throw new Error(mapSaveError(lang, e));
      }

      await render(ctx);
    }
  });
}

export async function render(ctx) {
  const { api, page, viewEl, section, accessFor, state } = ctx;
  const lang = langOf();
  const kind = sectionKind(section?.id || "");
  const isSupplier = kind === "supplier";
  const title = text(lang, isSupplier ? "titleSuppliers" : "titleClients");
  const subtitle = text(lang, isSupplier ? "subtitleSuppliers" : "subtitleClients");
  const noItemsText = text(lang, isSupplier ? "noItemsSuppliers" : "noItemsClients");

  page(title, subtitle, { raw: true });

  const perms = accessFor(state.me.role);
  const canWrite = Boolean(perms?.[section.id]?.write);
  const q = viewEl.getAttribute("data-q") || "";

  let resp;
  let fields;
  try {
    [resp, fields] = await Promise.all([
      api(`/counterparties?kind=${encodeURIComponent(kind)}`),
      loadEntityFieldAccess(api, "counterparties")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (resp.items || []).map(normalizeItem);
  const searchKeys = ["code", "full_name", "short_name", "name", "contact_person", "phone_1", "phone", "email", "inn", "address", "city"];
  const showSearch = searchKeys.some((key) => fields.showInFilters(key));
  const filterableFields = searchKeys.filter((key) => fields.showInFilters(key));
  const items = filterItems(allItems, q, filterableFields);

  viewEl.innerHTML = `
    <div class="card mb-3 entity-toolbar-card">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          ${showSearch ? `
            <div class="col-12 ${canWrite ? "col-md-8 col-lg-9" : "col-md-12"}">
              <label class="form-label">${esc(text(lang, "search"))}</label>
              <input id="counterparties_q" class="form-control" value="${esc(q)}">
            </div>
          ` : ""}
          ${canWrite ? `
            <div class="col-12 col-md-4 col-lg-3 d-grid">
              <button id="counterparties_create" class="btn btn-primary">${esc(text(lang, isSupplier ? "createSupplier" : "createClient"))}</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
    ${items.length ? tableHtml(items, lang, canWrite, fields) : emptyHtml(noItemsText)}
  `;

  if (showSearch) {
    const qEl = document.getElementById("counterparties_q");
    qEl.addEventListener("input", () => {
      viewEl.setAttribute("data-q", qEl.value.trim());
      queueRerender(viewEl, "__counterpartiesTimer", () => render(ctx), 180);
    });
  } else {
    viewEl.setAttribute("data-q", "");
  }

  if (canWrite) {
    const createBtn = document.getElementById("counterparties_create");
    if (createBtn) {
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, kind, fields));
    }

    document.querySelectorAll("[data-edit-counterparty]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editCounterparty);
        const item = allItems.find(entry => entry.id === id);
        if (item) openEntityModal(ctx, item, kind, fields);
      });
    });

    if (fields.isEnabled("is_active")) {
      document.querySelectorAll("[data-toggle-counterparty]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = Number(btn.dataset.toggleCounterparty);
          const next = Number(btn.dataset.next);
          await api(`/counterparties/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: next })
          });
          await render(ctx);
        });
      });
    }
  }
}
