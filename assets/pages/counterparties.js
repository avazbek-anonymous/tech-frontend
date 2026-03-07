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
    titleClients: "Контрагенты: Клиенты",
    titleInspections: "Контрагенты: Инспекции",
    titleEmployees: "Контрагенты: Сотрудники",
    titleOther: "Контрагенты: Прочее",
    subtitleSuppliers: "База поставщиков для закупок и взаиморасчетов",
    subtitleClients: "База клиентов для продаж и взаиморасчетов",
    subtitleInspections: "Контрагенты проверяющих и контролирующих органов",
    subtitleEmployees: "Справочник сотрудников в роли контрагентов",
    subtitleOther: "Прочие контрагенты бизнеса",
    search: "Поиск",
    createSupplier: "Добавить поставщика",
    createClient: "Добавить клиента",
    createInspection: "Добавить инспекцию",
    createEmployee: "Добавить сотрудника",
    createOther: "Добавить контрагента",
    editSupplier: "Редактировать поставщика",
    editClient: "Редактировать клиента",
    editInspection: "Редактировать инспекцию",
    editEmployee: "Редактировать сотрудника",
    editOther: "Редактировать контрагента",
    noItemsSuppliers: "Поставщики не найдены",
    noItemsClients: "Клиенты не найдены",
    noItemsInspections: "Инспекции не найдены",
    noItemsEmployees: "Сотрудники не найдены",
    noItemsOther: "Контрагенты не найдены",
    name: "Полное наименование",
    fio: "ФИО",
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
    employeeAlwaysPhysical: "Для сотрудника тип всегда: Физ. лицо",
    genderMale: "Мужской",
    genderFemale: "Женский",
    genderOther: "Другое",
    mainBlock: "Основное",
    contactsBlock: "Контактные данные",
    advancedOpen: "Расширенные",
    advancedClose: "Скрыть расширенные",
    additionalBlock: "Дополнительно",
    requisitesBlock: "Реквизиты",
    flagSupplier: "Поставщик",
    flagClient: "Клиент",
    flagEmployee: "Сотрудник",
    flagInspection: "Инспекция",
    flagOther: "Прочее",
    flags: "Флаги"
  },
  uz: {
    titleSuppliers: "Kontragentlar: Ta'minotchilar",
    titleClients: "Kontragentlar: Mijozlar",
    titleInspections: "Kontragentlar: Inspeksiyalar",
    titleEmployees: "Kontragentlar: Xodimlar",
    titleOther: "Kontragentlar: Boshqa",
    subtitleSuppliers: "Xarid va hisob-kitoblar uchun ta'minotchilar bazasi",
    subtitleClients: "Sotuv va hisob-kitoblar uchun mijozlar bazasi",
    subtitleInspections: "Tekshiruvchi va nazorat organlari kontragentlari",
    subtitleEmployees: "Kontragent rolidagi xodimlar ro'yxati",
    subtitleOther: "Biznesning boshqa kontragentlari",
    search: "Qidiruv",
    createSupplier: "Ta'minotchi qo'shish",
    createClient: "Mijoz qo'shish",
    createInspection: "Inspeksiya qo'shish",
    createEmployee: "Xodim qo'shish",
    createOther: "Kontragent qo'shish",
    editSupplier: "Ta'minotchini tahrirlash",
    editClient: "Mijozni tahrirlash",
    editInspection: "Inspeksiyani tahrirlash",
    editEmployee: "Xodimni tahrirlash",
    editOther: "Kontragentni tahrirlash",
    noItemsSuppliers: "Ta'minotchilar topilmadi",
    noItemsClients: "Mijozlar topilmadi",
    noItemsInspections: "Inspeksiyalar topilmadi",
    noItemsEmployees: "Xodimlar topilmadi",
    noItemsOther: "Kontragentlar topilmadi",
    name: "To'liq nom",
    fio: "F.I.Sh.",
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
    employeeAlwaysPhysical: "Xodim uchun tur doim: Jismoniy shaxs",
    genderMale: "Erkak",
    genderFemale: "Ayol",
    genderOther: "Boshqa",
    mainBlock: "Asosiy",
    contactsBlock: "Kontakt ma'lumotlari",
    advancedOpen: "Kengaytirilgan",
    advancedClose: "Kengaytirilganni yopish",
    additionalBlock: "Qo'shimcha",
    requisitesBlock: "Rekvizitlar",
    flagSupplier: "Ta'minotchi",
    flagClient: "Mijoz",
    flagEmployee: "Xodim",
    flagInspection: "Inspeksiya",
    flagOther: "Boshqa",
    flags: "Flaglar"
  },
  en: {
    titleSuppliers: "Counterparties: Suppliers",
    titleClients: "Counterparties: Clients",
    titleInspections: "Counterparties: Inspections",
    titleEmployees: "Counterparties: Employees",
    titleOther: "Counterparties: Other",
    subtitleSuppliers: "Suppliers directory for purchasing and settlements",
    subtitleClients: "Clients directory for sales and settlements",
    subtitleInspections: "Inspection and regulatory counterparties",
    subtitleEmployees: "Employees registered as counterparties",
    subtitleOther: "Other business counterparties",
    search: "Search",
    createSupplier: "Add supplier",
    createClient: "Add client",
    createInspection: "Add inspection",
    createEmployee: "Add employee",
    createOther: "Add counterparty",
    editSupplier: "Edit supplier",
    editClient: "Edit client",
    editInspection: "Edit inspection",
    editEmployee: "Edit employee",
    editOther: "Edit counterparty",
    noItemsSuppliers: "No suppliers found",
    noItemsClients: "No clients found",
    noItemsInspections: "No inspections found",
    noItemsEmployees: "No employees found",
    noItemsOther: "No counterparties found",
    name: "Full name",
    fio: "Full name",
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
    employeeAlwaysPhysical: "Employees are always: Individual",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    mainBlock: "Main",
    contactsBlock: "Contact details",
    advancedOpen: "Advanced",
    advancedClose: "Hide advanced",
    additionalBlock: "Additional",
    requisitesBlock: "Requisites",
    flagSupplier: "Supplier",
    flagClient: "Client",
    flagEmployee: "Employee",
    flagInspection: "Inspection",
    flagOther: "Other",
    flags: "Flags"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

const EXTRA_TEXT_FIELDS = [
  "code",
  "counterparty_type",
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

const ROLE_FLAG_FIELDS = ["is_supplier", "is_client", "is_employee", "is_inspection", "is_other"];

const SECTION_META = {
  counterparties_suppliers: {
    role: "supplier",
    kind: "supplier",
    titleKey: "titleSuppliers",
    subtitleKey: "subtitleSuppliers",
    createKey: "createSupplier",
    editKey: "editSupplier",
    noItemsKey: "noItemsSuppliers",
    defaultFlags: { is_supplier: 1, is_client: 0, is_employee: 0, is_inspection: 0, is_other: 0 },
    forcePhysical: false
  },
  counterparties_clients: {
    role: "client",
    kind: "client",
    titleKey: "titleClients",
    subtitleKey: "subtitleClients",
    createKey: "createClient",
    editKey: "editClient",
    noItemsKey: "noItemsClients",
    defaultFlags: { is_supplier: 0, is_client: 1, is_employee: 0, is_inspection: 0, is_other: 0 },
    forcePhysical: false
  },
  counterparties_inspections: {
    role: "inspection",
    kind: "client",
    titleKey: "titleInspections",
    subtitleKey: "subtitleInspections",
    createKey: "createInspection",
    editKey: "editInspection",
    noItemsKey: "noItemsInspections",
    defaultFlags: { is_supplier: 0, is_client: 0, is_employee: 0, is_inspection: 1, is_other: 0 },
    forcePhysical: false
  },
  counterparties_employees: {
    role: "employee",
    kind: "client",
    titleKey: "titleEmployees",
    subtitleKey: "subtitleEmployees",
    createKey: "createEmployee",
    editKey: "editEmployee",
    noItemsKey: "noItemsEmployees",
    defaultFlags: { is_supplier: 0, is_client: 0, is_employee: 1, is_inspection: 0, is_other: 0 },
    forcePhysical: true
  },
  counterparties_other: {
    role: "other",
    kind: "client",
    titleKey: "titleOther",
    subtitleKey: "subtitleOther",
    createKey: "createOther",
    editKey: "editOther",
    noItemsKey: "noItemsOther",
    defaultFlags: { is_supplier: 0, is_client: 0, is_employee: 0, is_inspection: 0, is_other: 1 },
    forcePhysical: false
  }
};

function fieldLabel(fields, lang, fieldKey, fallback) {
  const fallbackMap = {
    is_supplier: text(lang, "flagSupplier"),
    is_client: text(lang, "flagClient"),
    is_employee: text(lang, "flagEmployee"),
    is_inspection: text(lang, "flagInspection"),
    is_other: text(lang, "flagOther")
  };
  const resolved = String(fields.label(fieldKey, lang, fallback || fallbackMap[fieldKey] || fieldKey) || "");
  if (fallbackMap[fieldKey] && resolved.trim().toLowerCase() === String(fieldKey).toLowerCase()) {
    return esc(fallbackMap[fieldKey]);
  }
  return esc(resolved);
}

function optionHtml(value, selected, label) {
  return `<option value="${esc(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${esc(label)}</option>`;
}

function sectionMeta(sectionId) {
  return SECTION_META[sectionId] || SECTION_META.counterparties_clients;
}

function visible(fields, key, mode = "form") {
  if (!fields) return true;
  const fn = mode === "list"
    ? fields.showInList
    : mode === "filters"
      ? fields.showInFilters
      : mode === "card"
        ? fields.showInCard
        : fields.showInForm;

  if (key === "phone_1") return fn("phone_1") || fn("phone");
  return fn(key);
}

function displayName(item, meta) {
  if (meta.role === "employee") {
    return String(item?.full_name || item?.name || item?.contact_person || "");
  }
  return String(item?.full_name || item?.name || "");
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

function modalHtml(lang, item, fields, meta) {
  const forcePhysical = Boolean(meta?.forcePhysical);
  const currentPerson = forcePhysical ? "physical" : (String(item?.person_type || "legal") === "physical" ? "physical" : "legal");
  const fullNameLabel = forcePhysical || currentPerson === "physical" ? text(lang, "fio") : text(lang, "name");

  const statusField = visible(fields, "status", "form") ? `
    <div class="col-md-4">
      <label class="form-label">${fieldLabel(fields, lang, "status", text(lang, "status"))}</label>
      <select class="form-select" name="status">
        ${optionHtml("active", item?.status || "active", text(lang, "statusActive"))}
        ${optionHtml("inactive", item?.status || "active", text(lang, "statusInactive"))}
        ${optionHtml("blocked", item?.status || "active", text(lang, "statusBlocked"))}
      </select>
    </div>
  ` : "";

  const personField = visible(fields, "person_type", "form")
    ? (forcePhysical
      ? `
        <div class="col-md-4">
          <label class="form-label">${fieldLabel(fields, lang, "person_type", text(lang, "personPhysical"))}</label>
          <input class="form-control" value="${esc(text(lang, "employeeAlwaysPhysical"))}" disabled>
          <input type="hidden" name="person_type" value="physical">
        </div>
      `
      : `
        <div class="col-md-4">
          <label class="form-label">${fieldLabel(fields, lang, "person_type", "Person type")}</label>
          <select class="form-select" name="person_type" data-person-type>
            ${optionHtml("legal", currentPerson, text(lang, "personLegal"))}
            ${optionHtml("physical", currentPerson, text(lang, "personPhysical"))}
          </select>
        </div>
      `)
    : "";

  const contactPhoneField = visible(fields, "phone_1", "form") ? `
    <div class="col-md-4">
      <label class="form-label">${fieldLabel(fields, lang, "phone_1", text(lang, "phone"))}</label>
      <input class="form-control" name="phone_1" value="${esc(item?.phone_1 || item?.phone || "")}">
    </div>
  ` : "";

  const counterpartyTypeField = visible(fields, "counterparty_type", "form") ? `
    <div class="col-md-4">
      <label class="form-label">${fieldLabel(fields, lang, "counterparty_type", "Type")}</label>
      <select class="form-select" name="counterparty_type">
        ${optionHtml("", item?.counterparty_type || "", "-")}
        ${optionHtml("partner", item?.counterparty_type || "", "Partner")}
        ${optionHtml("state", item?.counterparty_type || "", "State")}
        ${optionHtml("service", item?.counterparty_type || "", "Service")}
        ${optionHtml("other", item?.counterparty_type || "", "Other")}
      </select>
    </div>
  ` : "";

  const additionalFields = ["code", "short_name", "manager_name"].map((key) => {
    if (!visible(fields, key, "form")) return "";
    return `
      <div class="col-md-4">
        <label class="form-label">${fieldLabel(fields, lang, key)}</label>
        <input class="form-control" name="${esc(key)}" value="${esc(item?.[key] ?? "")}">
      </div>
    `;
  }).join("");

  const legalFields = [
    { key: "inn", col: "col-md-4", type: "text" },
    { key: "bank_name", col: "col-md-4", type: "text" },
    { key: "mfo", col: "col-md-4", type: "text" },
    { key: "bank_account", col: "col-md-4", type: "text" },
    { key: "director", col: "col-md-4", type: "text" }
  ].map((f) => {
    if (!visible(fields, f.key, "form")) return "";
    return `
      <div class="${f.col}" data-person-only="legal">
        <label class="form-label">${fieldLabel(fields, lang, f.key)}</label>
        <input class="form-control" type="${f.type}" name="${esc(f.key)}" value="${esc(item?.[f.key] ?? "")}">
      </div>
    `;
  }).join("");

  const vatField = visible(fields, "is_vat_payer", "form") ? `
    <div class="form-check form-switch me-3 mb-2" data-person-only="legal">
      <input class="form-check-input" type="checkbox" role="switch" name="is_vat_payer" ${Number(item?.is_vat_payer || 0) === 1 ? "checked" : ""}>
      <label class="form-check-label">${fieldLabel(fields, lang, "is_vat_payer")}</label>
    </div>
  ` : "";

  const physicalFields = ["pinfl", "passport_series", "passport_number"].map((key) => {
    if (!visible(fields, key, "form")) return "";
    return `
      <div class="col-md-4" data-person-only="physical">
        <label class="form-label">${fieldLabel(fields, lang, key)}</label>
        <input class="form-control" name="${esc(key)}" value="${esc(item?.[key] ?? "")}">
      </div>
    `;
  }).join("");

  const birthField = visible(fields, "birth_date", "form") ? `
    <div class="col-md-4" data-person-only="physical">
      <label class="form-label">${fieldLabel(fields, lang, "birth_date", "Birth date")}</label>
      <input class="form-control" type="date" name="birth_date" value="${esc(item?.birth_date || "")}">
    </div>
  ` : "";

  const genderField = visible(fields, "gender", "form") ? `
    <div class="col-md-4" data-person-only="physical">
      <label class="form-label">${fieldLabel(fields, lang, "gender", "Gender")}</label>
      <select class="form-select" name="gender">
        ${optionHtml("", item?.gender || "", "-")}
        ${optionHtml("male", item?.gender || "", text(lang, "genderMale"))}
        ${optionHtml("female", item?.gender || "", text(lang, "genderFemale"))}
        ${optionHtml("other", item?.gender || "", text(lang, "genderOther"))}
      </select>
    </div>
  ` : "";

  const numericFields = EXTRA_NUMBER_FIELDS.map((key) => {
    if (!visible(fields, key, "form")) return "";
    const step = key === "payment_delay_days" ? "1" : "0.01";
    return `
      <div class="col-md-4">
        <label class="form-label">${fieldLabel(fields, lang, key)}</label>
        <input class="form-control" type="number" min="0" step="${step}" name="${esc(key)}" value="${esc(item?.[key] ?? 0)}">
      </div>
    `;
  }).join("");

  const roleFlags = ROLE_FLAG_FIELDS.map((key) => {
    if (!visible(fields, key, "form")) return "";
    return `
      <div class="form-check form-switch me-3 mb-2">
        <input class="form-check-input" type="checkbox" role="switch" name="${esc(key)}" ${Number(item?.[key] || 0) === 1 ? "checked" : ""}>
        <label class="form-check-label">${fieldLabel(fields, lang, key)}</label>
      </div>
    `;
  }).join("");

  const blacklistedField = visible(fields, "is_blacklisted", "form") ? `
    <div class="form-check form-switch me-3 mb-2">
      <input class="form-check-input" type="checkbox" role="switch" name="is_blacklisted" ${Number(item?.is_blacklisted || 0) === 1 ? "checked" : ""}>
      <label class="form-check-label">${fieldLabel(fields, lang, "is_blacklisted")}</label>
    </div>
  ` : "";

  return `
    <div data-counterparty-form data-force-physical="${forcePhysical ? "1" : "0"}">
      <div class="counterparty-form-block">
        <div class="counterparty-form-title">${esc(text(lang, "mainBlock"))}</div>
        <div class="row g-3">
          ${statusField}
          ${personField}
          ${visible(fields, "full_name", "form") ? `
            <div class="col-md-8">
              <label class="form-label" data-full-name-label>${esc(fullNameLabel)}</label>
              <input class="form-control" name="full_name" value="${esc(item?.full_name || item?.name || "")}">
            </div>
          ` : ""}
          ${visible(fields, "contact_person", "form") ? `
            <div class="col-md-6" data-contact-row>
              <label class="form-label">${esc(text(lang, "contactPerson"))}</label>
              <input class="form-control" name="contact_person" value="${esc(item?.contact_person || "")}">
            </div>
          ` : ""}
          ${visible(fields, "is_active", "form") ? `
            <div class="col-12">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" name="is_active" ${Number(item?.is_active ?? 1) === 1 ? "checked" : ""}>
                <label class="form-check-label">${esc(text(lang, "active"))}</label>
              </div>
            </div>
          ` : ""}
        </div>
      </div>

      <div class="counterparty-form-block mt-3">
        <div class="counterparty-form-title">${esc(text(lang, "contactsBlock"))}</div>
        <div class="row g-3">
          ${contactPhoneField}
          ${visible(fields, "phone_2", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "phone_2")}</label>
              <input class="form-control" name="phone_2" value="${esc(item?.phone_2 || "")}">
            </div>
          ` : ""}
          ${visible(fields, "telegram", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "telegram")}</label>
              <input class="form-control" name="telegram" value="${esc(item?.telegram || "")}">
            </div>
          ` : ""}
          ${visible(fields, "email", "form") ? `
            <div class="col-md-6">
              <label class="form-label">${esc(text(lang, "email"))}</label>
              <input class="form-control" name="email" value="${esc(item?.email || "")}">
            </div>
          ` : ""}
          ${visible(fields, "address", "form") ? `
            <div class="col-md-6">
              <label class="form-label">${esc(text(lang, "address"))}</label>
              <input class="form-control" name="address" value="${esc(item?.address || "")}">
            </div>
          ` : ""}
          ${visible(fields, "country", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "country")}</label>
              <input class="form-control" name="country" value="${esc(item?.country || "")}">
            </div>
          ` : ""}
          ${visible(fields, "region", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "region")}</label>
              <input class="form-control" name="region" value="${esc(item?.region || "")}">
            </div>
          ` : ""}
          ${visible(fields, "city", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "city")}</label>
              <input class="form-control" name="city" value="${esc(item?.city || "")}">
            </div>
          ` : ""}
        </div>
      </div>

      <div class="counterparty-advanced-toggle mt-3 pt-2 border-top">
        <button class="btn btn-link p-0 counterparty-advanced-btn" type="button" data-advanced-toggle aria-expanded="false">
          <i class="bi bi-chevron-down" data-advanced-icon></i>
          <span data-advanced-label>${esc(text(lang, "advancedOpen"))}</span>
        </button>
      </div>

      <div class="counterparty-advanced-body d-none" data-advanced-body>
        <div class="counterparty-form-block mt-3">
          <div class="counterparty-form-title">${esc(text(lang, "additionalBlock"))}</div>
          <div class="row g-3">
            ${counterpartyTypeField}
            ${additionalFields}
            ${visible(fields, "comment", "form") ? `
              <div class="col-12">
                <label class="form-label">${esc(text(lang, "comment"))}</label>
                <textarea class="form-control" rows="3" name="comment">${esc(item?.comment || "")}</textarea>
              </div>
            ` : ""}
          </div>
        </div>

        <div class="counterparty-form-block mt-3">
          <div class="counterparty-form-title">${esc(text(lang, "requisitesBlock"))}</div>
          <div class="row g-3">
            ${legalFields}
            ${physicalFields}
            ${birthField}
            ${genderField}
            ${numericFields}
          </div>
          ${vatField ? `<div class="d-flex flex-wrap mt-2">${vatField}</div>` : ""}
        </div>

        ${(roleFlags || blacklistedField) ? `
          <div class="counterparty-form-block mt-3">
            <div class="counterparty-form-title">${esc(text(lang, "flags"))}</div>
            <div class="d-flex flex-wrap">
              ${roleFlags}
              ${blacklistedField}
            </div>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function readForm(modalEl, meta, draft = {}) {
  const byName = (name) => modalEl.querySelector(`[name='${name}']`);
  const readText = (name) => String(byName(name)?.value || "").trim();
  const readNum = (name, fallback = 0) => {
    const raw = String(byName(name)?.value || "").trim();
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  const readBool = (name, fallback = 0) => {
    const el = byName(name);
    if (!el) return Number(fallback || 0) === 1 ? 1 : 0;
    return el.checked ? 1 : 0;
  };
  const phone1 = readText("phone_1") || readText("phone");
  const payload = {
    kind: meta.kind,
    name: readText("name"),
    full_name: readText("full_name"),
    contact_person: readText("contact_person"),
    phone: phone1,
    phone_1: phone1,
    email: readText("email"),
    inn: readText("inn"),
    address: readText("address"),
    comment: readText("comment"),
    status: readText("status") || "active",
    is_active: readBool("is_active", Number(draft?.is_active ?? 1))
  };

  for (const key of EXTRA_TEXT_FIELDS) {
    payload[key] = readText(key);
  }
  for (const key of EXTRA_NUMBER_FIELDS) {
    payload[key] = readNum(key, Number(draft?.[key] ?? 0));
  }
  for (const key of EXTRA_BOOL_FIELDS) {
    payload[key] = readBool(key, Number(draft?.[key] ?? 0));
  }

  payload.phone_1 = payload.phone_1 || payload.phone;
  if (meta.forcePhysical || Number(payload.is_employee || 0) === 1) {
    payload.person_type = "physical";
  } else if (!payload.person_type) {
    payload.person_type = "legal";
  }
  if (payload.person_type === "physical") {
    payload.contact_person = "";
  }
  payload.full_name = payload.full_name || payload.contact_person || payload.name;
  payload.name = payload.full_name || payload.contact_person || payload.name;
  return payload;
}

function bindModalBehavior(modalEl, meta) {
  const root = modalEl.querySelector("[data-counterparty-form]");
  if (!root) return;
  const lang = langOf();

  const advancedBtn = root.querySelector("[data-advanced-toggle]");
  const advancedBody = root.querySelector("[data-advanced-body]");
  const advancedLabel = root.querySelector("[data-advanced-label]");
  const advancedIcon = root.querySelector("[data-advanced-icon]");
  const fullNameLabelEl = root.querySelector("[data-full-name-label]");
  const contactRowEl = root.querySelector("[data-contact-row]");

  if (advancedBtn && advancedBody && advancedLabel && advancedIcon) {
    advancedBtn.addEventListener("click", () => {
      const opened = !advancedBody.classList.contains("d-none");
      advancedBody.classList.toggle("d-none", opened);
      advancedBtn.setAttribute("aria-expanded", opened ? "false" : "true");
      advancedIcon.classList.toggle("bi-chevron-down", opened);
      advancedIcon.classList.toggle("bi-chevron-up", !opened);
      advancedLabel.textContent = opened ? text(lang, "advancedOpen") : text(lang, "advancedClose");
    });
  }

  const personTypeEl = root.querySelector("[data-person-type]");
  const employeeFlagEl = root.querySelector("[name='is_employee']");
  const syncPersonMode = () => {
    let mode = String(personTypeEl?.value || "legal").toLowerCase();
    if (meta.forcePhysical || (employeeFlagEl && employeeFlagEl.checked)) {
      mode = "physical";
      if (personTypeEl) personTypeEl.value = "physical";
    }
    root.querySelectorAll("[data-person-only='legal']").forEach((el) => el.classList.toggle("d-none", mode !== "legal"));
    root.querySelectorAll("[data-person-only='physical']").forEach((el) => el.classList.toggle("d-none", mode !== "physical"));
    if (fullNameLabelEl) fullNameLabelEl.textContent = mode === "physical" ? text(lang, "fio") : text(lang, "name");
    if (contactRowEl) contactRowEl.classList.toggle("d-none", mode === "physical");
  };

  if (personTypeEl) personTypeEl.addEventListener("change", syncPersonMode);
  if (employeeFlagEl) employeeFlagEl.addEventListener("change", syncPersonMode);
  syncPersonMode();
}

function desktopTableHtml(items, lang, canWrite, fields, meta) {
  const labels = {
    active: text(lang, "active"),
    inactive: text(lang, "inactive")
  };
  const nameHead = meta.role === "employee"
    ? esc(text(lang, "fio"))
    : fieldLabel(fields, lang, "full_name", text(lang, "name"));

  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              ${(visible(fields, "full_name", "list") || fields.showInList("name")) ? `<th>${nameHead}</th>` : ""}
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
                ${(visible(fields, "full_name", "list") || fields.showInList("name")) ? `
                  <td>
                    <div class="fw-semibold">${esc(displayName(item, meta) || "-")}</div>
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

function mobileCardsHtml(items, lang, canWrite, fields, meta) {
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
                ${fields.showInCard("full_name") || fields.showInCard("name") ? `<div class="fw-semibold">${esc(displayName(item, meta) || "-")}</div>` : ""}
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

function tableHtml(items, lang, canWrite, fields, meta) {
  return `${desktopTableHtml(items, lang, canWrite, fields, meta)}${mobileCardsHtml(items, lang, canWrite, fields, meta)}`;
}

async function openEntityModal(ctx, item, meta, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;
  const draft = item || {
    kind: meta.kind,
    status: "active",
    person_type: meta.forcePhysical ? "physical" : "legal",
    ...meta.defaultFlags,
    is_active: 1
  };

  openModal({
    title: isCreate ? text(lang, meta.createKey) : text(lang, meta.editKey),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, draft, fields, meta),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl, meta, draft), fields);
      for (const key of ROLE_FLAG_FIELDS) {
        if (payload[key] === undefined) payload[key] = Number(draft[key] || 0);
      }
      if (meta.forcePhysical || Number(payload.is_employee || 0) === 1) {
        payload.person_type = "physical";
      }
      if (payload.person_type === "physical") {
        payload.contact_person = "";
      }
      payload.full_name = String(payload.full_name || "").trim() || String(payload.contact_person || "").trim();
      payload.name = payload.full_name || String(payload.name || "").trim();
      payload.phone = String(payload.phone_1 || payload.phone || "").trim();

      if ((fields.isRequired("full_name") || fields.isRequired("name")) && isEmptyFieldValue(payload.full_name || payload.name)) {
        throw new Error(text(lang, "requiredName"));
      }
      const enabledFlagKeys = ROLE_FLAG_FIELDS.filter((key) => fields.isEnabled(key));
      const checkKeys = enabledFlagKeys.length ? enabledFlagKeys : ROLE_FLAG_FIELDS;
      if (checkKeys.every((key) => Number(payload[key] || 0) === 0)) {
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

  setTimeout(() => {
    const modals = document.querySelectorAll(".modal");
    const modalEl = modals[modals.length - 1];
    if (modalEl) bindModalBehavior(modalEl, meta);
  }, 0);
}

export async function render(ctx) {
  const { api, page, viewEl, section, accessFor, state } = ctx;
  const lang = langOf();
  const meta = sectionMeta(section?.id || "");
  const title = text(lang, meta.titleKey);
  const subtitle = text(lang, meta.subtitleKey);
  const noItemsText = text(lang, meta.noItemsKey);

  page(title, subtitle, { raw: true });

  const perms = accessFor(state.me.role);
  const canWrite = Boolean(perms?.[section.id]?.write);
  const q = viewEl.getAttribute("data-q") || "";

  let resp;
  let fields;
  try {
    [resp, fields] = await Promise.all([
      api(`/counterparties?role=${encodeURIComponent(meta.role)}`),
      loadEntityFieldAccess(api, "counterparties")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (resp.items || []).map(normalizeItem);
  const searchKeys = ["code", "full_name", "short_name", "name", "contact_person", "phone_1", "phone", "email", "inn", "address", "city"];
  const showSearch = searchKeys.some((key) => visible(fields, key, "filters"));
  const filterableFields = searchKeys.filter((key) => visible(fields, key, "filters"));
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
              <button id="counterparties_create" class="btn btn-primary">${esc(text(lang, meta.createKey))}</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
    ${items.length ? tableHtml(items, lang, canWrite, fields, meta) : emptyHtml(noItemsText)}
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
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, meta, fields));
    }

    document.querySelectorAll("[data-edit-counterparty]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editCounterparty);
        const item = allItems.find(entry => entry.id === id);
        if (item) openEntityModal(ctx, item, meta, fields);
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

