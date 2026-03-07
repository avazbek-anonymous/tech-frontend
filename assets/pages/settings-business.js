import {
  esc,
  errorHtml,
  langOf,
  noAccessHtml,
  pick,
  queueRerender
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки бизнесов",
    subtitle: "Выберите бизнес и настройте разделы, сущности и реквизиты",
    noAccess: "Раздел доступен только super_admin",
    business: "Бизнес",
    businessRequired: "Сначала выберите бизнес",
    reload: "Обновить",
    sections: "Разделы и подразделы",
    entities: "Справочники и документы",
    fields: "Реквизиты",
    group: "Группа",
    section: "Раздел",
    object: "Сущность",
    objectType: "Тип",
    field: "Поле",
    enabled: "Включено",
    required: "Обязательно",
    form: "Форма",
    list: "Список",
    filters: "Фильтры",
    card: "Карточка",
    comment: "Комментарий",
    dictionary: "Справочник",
    document: "Документ",
    saveSections: "Сохранить разделы",
    saveEntities: "Сохранить сущности",
    saveFields: "Сохранить реквизиты",
    selectEntity: "Выберите сущность",
    all: "Все",
    allSaved: "Изменения сохранены"
  },
  uz: {
    title: "Biznes sozlamalari",
    subtitle: "Biznesni tanlang va bo'limlar, obyektlar hamda rekvizitlarni sozlang",
    noAccess: "Bo'lim faqat super_admin uchun ochiq",
    business: "Biznes",
    businessRequired: "Avval biznesni tanlang",
    reload: "Yangilash",
    sections: "Bo'limlar va ichki bo'limlar",
    entities: "Ma'lumotnomalar va hujjatlar",
    fields: "Rekvizitlar",
    group: "Guruh",
    section: "Bo'lim",
    object: "Obyekt",
    objectType: "Turi",
    field: "Maydon",
    enabled: "Yoqilgan",
    required: "Majburiy",
    form: "Forma",
    list: "Ro'yxat",
    filters: "Filtrlar",
    card: "Karta",
    comment: "Izoh",
    dictionary: "Ma'lumotnoma",
    document: "Hujjat",
    saveSections: "Bo'limlarni saqlash",
    saveEntities: "Obyektlarni saqlash",
    saveFields: "Rekvizitlarni saqlash",
    selectEntity: "Obyektni tanlang",
    all: "Barchasi",
    allSaved: "O'zgarishlar saqlandi"
  },
  en: {
    title: "Business settings",
    subtitle: "Select business and configure sections, entities, and fields",
    noAccess: "Section is available only to super_admin",
    business: "Business",
    businessRequired: "Select a business first",
    reload: "Reload",
    sections: "Sections and subsections",
    entities: "Dictionaries and documents",
    fields: "Fields",
    group: "Group",
    section: "Section",
    object: "Entity",
    objectType: "Type",
    field: "Field",
    enabled: "Enabled",
    required: "Required",
    form: "Form",
    list: "List",
    filters: "Filters",
    card: "Card",
    comment: "Comment",
    dictionary: "Dictionary",
    document: "Document",
    saveSections: "Save sections",
    saveEntities: "Save entities",
    saveFields: "Save fields",
    selectEntity: "Select entity",
    all: "All",
    allSaved: "Changes saved"
  }
};

const LANG_KEY_BY_CODE = {
  ru: "comment_ru",
  uz: "comment_uz",
  en: "comment_en"
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function trLabel(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru || value.en || "";
}

function sortSections(items, lang) {
  return (items || []).slice().sort((a, b) => {
    const ga = trLabel(a.group_label, lang);
    const gb = trLabel(b.group_label, lang);
    if (ga !== gb) return ga.localeCompare(gb);
    return trLabel(a.label, lang).localeCompare(trLabel(b.label, lang));
  });
}

function sortEntities(items, lang) {
  return (items || []).slice().sort((a, b) => {
    if (a.entity_type !== b.entity_type) return a.entity_type.localeCompare(b.entity_type);
    return trLabel(a.label, lang).localeCompare(trLabel(b.label, lang));
  });
}

function sectionsTableHtml(sections, lang) {
  return `
    <table class="table table-sm align-middle mb-0 biz-settings-table">
      <thead>
        <tr>
          <th>${esc(text(lang, "group"))}</th>
          <th>${esc(text(lang, "section"))}</th>
          <th class="text-center biz-check-col">
            <div class="biz-master-head">
              <span>${esc(text(lang, "enabled"))}</span>
              <label class="biz-master-toggle">
                <input class="form-check-input" type="checkbox" data-master="section-enabled">
                <span>${esc(text(lang, "all"))}</span>
              </label>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        ${sections.map(item => `
          <tr>
            <td class="small text-muted">${esc(trLabel(item.group_label, lang) || "-")}</td>
            <td>${esc(trLabel(item.label, lang) || item.section_id)}</td>
            <td class="text-center">
              <input class="form-check-input" type="checkbox" data-section-enabled="${esc(item.section_id)}" ${Number(item.is_enabled) === 1 ? "checked" : ""} ${Number(item.locked) === 1 ? "disabled" : ""}>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function entitiesTableHtml(entities, lang) {
  return `
    <table class="table table-sm align-middle mb-0 biz-settings-table">
      <thead>
        <tr>
          <th>${esc(text(lang, "object"))}</th>
          <th class="biz-type-col">${esc(text(lang, "objectType"))}</th>
          <th class="text-center biz-check-col">
            <div class="biz-master-head">
              <span>${esc(text(lang, "enabled"))}</span>
              <label class="biz-master-toggle">
                <input class="form-check-input" type="checkbox" data-master="entity-enabled">
                <span>${esc(text(lang, "all"))}</span>
              </label>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        ${entities.map(item => `
          <tr>
            <td>${esc(trLabel(item.label, lang) || item.entity_key)}</td>
            <td class="small text-muted">${esc(item.entity_type === "document" ? text(lang, "document") : text(lang, "dictionary"))}</td>
            <td class="text-center">
              <input class="form-check-input" type="checkbox" data-entity-enabled="${esc(item.entity_key)}" ${Number(item.is_enabled) === 1 ? "checked" : ""}>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function fieldsTableHtml(fields, lang) {
  return `
    <table class="table table-sm align-middle mb-0 biz-settings-table">
      <thead>
        <tr>
          <th>${esc(text(lang, "field"))}</th>
          ${masterHead(lang, "enabled", "field-enabled")}
          ${masterHead(lang, "required", "field-required")}
          ${masterHead(lang, "form", "field-form")}
          ${masterHead(lang, "list", "field-list")}
          ${masterHead(lang, "filters", "field-filters")}
          ${masterHead(lang, "card", "field-card")}
          <th class="biz-comment-col">${esc(text(lang, "comment"))}</th>
        </tr>
      </thead>
      <tbody>
        ${fields.map(item => `
          <tr data-field-row="${esc(item.field_key)}">
            <td class="biz-field-name">
              <div class="fw-semibold">${esc(trLabel(item.label, lang) || item.field_key)}</div>
              <div class="small text-muted">${esc(item.field_key)}</div>
            </td>
            <td class="text-center"><input class="form-check-input" type="checkbox" data-field-enabled ${Number(item.is_enabled) === 1 ? "checked" : ""}></td>
            <td class="text-center"><input class="form-check-input" type="checkbox" data-field-required ${Number(item.is_required) === 1 ? "checked" : ""}></td>
            <td class="text-center"><input class="form-check-input" type="checkbox" data-field-form ${Number(item.show_in_form) === 1 ? "checked" : ""}></td>
            <td class="text-center"><input class="form-check-input" type="checkbox" data-field-list ${Number(item.show_in_list) === 1 ? "checked" : ""}></td>
            <td class="text-center"><input class="form-check-input" type="checkbox" data-field-filters ${Number(item.show_in_filters) === 1 ? "checked" : ""}></td>
            <td class="text-center"><input class="form-check-input" type="checkbox" data-field-card ${Number(item.show_in_card) === 1 ? "checked" : ""}></td>
            <td>
              <input class="form-control form-control-sm" data-field-comment value="${esc(commentValue(item, lang))}">
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function masterHead(lang, titleKey, masterKey) {
  return `
    <th class="text-center biz-check-col">
      <div class="biz-master-head">
        <span>${esc(text(lang, titleKey))}</span>
        <label class="biz-master-toggle">
          <input class="form-check-input" type="checkbox" data-master="${esc(masterKey)}">
          <span>${esc(text(lang, "all"))}</span>
        </label>
      </div>
    </th>
  `;
}

function commentValue(item, lang) {
  const key = LANG_KEY_BY_CODE[lang] || "comment_ru";
  return item?.[key] || "";
}

function bindMaster(viewEl, masterKey, itemSelector) {
  const master = viewEl.querySelector(`[data-master="${masterKey}"]`);
  if (!master) return;

  const getItems = () => Array.from(viewEl.querySelectorAll(itemSelector)).filter(item => !item.disabled);

  const sync = () => {
    const items = getItems();
    if (!items.length) {
      master.checked = false;
      master.indeterminate = false;
      master.disabled = true;
      return;
    }

    const checked = items.filter(item => item.checked).length;
    master.disabled = false;
    master.checked = checked === items.length;
    master.indeterminate = checked > 0 && checked < items.length;
  };

  master.addEventListener("change", () => {
    const items = getItems();
    const checked = master.checked;
    items.forEach(item => {
      item.checked = checked;
    });
    sync();
  });

  getItems().forEach(item => {
    item.addEventListener("change", sync);
  });

  sync();
}

function collectSectionPayload(viewEl) {
  return Array.from(viewEl.querySelectorAll("[data-section-enabled]")).map(el => ({
    section_id: String(el.dataset.sectionEnabled || ""),
    is_enabled: el.checked ? 1 : 0
  }));
}

function collectEntityPayload(viewEl) {
  return Array.from(viewEl.querySelectorAll("[data-entity-enabled]")).map(el => ({
    entity_key: String(el.dataset.entityEnabled || ""),
    is_enabled: el.checked ? 1 : 0
  }));
}

function collectFieldPayload(viewEl, entityKey, fieldsByKey, lang) {
  return Array.from(viewEl.querySelectorAll("[data-field-row]")).map(row => {
    const fieldKey = String(row.dataset.fieldRow || "");
    const current = fieldsByKey.get(fieldKey) || {};
    const comment = String(row.querySelector("[data-field-comment]")?.value || "").trim();

    const item = {
      entity_key: entityKey,
      field_key: fieldKey,
      is_enabled: row.querySelector("[data-field-enabled]")?.checked ? 1 : 0,
      is_required: row.querySelector("[data-field-required]")?.checked ? 1 : 0,
      show_in_form: row.querySelector("[data-field-form]")?.checked ? 1 : 0,
      show_in_list: row.querySelector("[data-field-list]")?.checked ? 1 : 0,
      show_in_filters: row.querySelector("[data-field-filters]")?.checked ? 1 : 0,
      show_in_card: row.querySelector("[data-field-card]")?.checked ? 1 : 0,
      comment_ru: current.comment_ru || "",
      comment_uz: current.comment_uz || "",
      comment_en: current.comment_en || ""
    };

    const commentKey = LANG_KEY_BY_CODE[lang] || "comment_ru";
    item[commentKey] = comment;
    return item;
  });
}

function chooseBusinessId(viewEl, businesses) {
  const fromView = Number(viewEl.getAttribute("data-business-id") || 0);
  const fromStore = Number(localStorage.getItem("settings_business_target_id") || 0);
  const ids = new Set((businesses || []).map(item => Number(item.id)));

  if (ids.has(fromView)) return fromView;
  if (ids.has(fromStore)) return fromStore;
  return Number((businesses && businesses[0] && businesses[0].id) || 0);
}

async function loadBusinessSettings(api, businessId) {
  return api(`/business-settings?business_id=${businessId}`);
}

function setupMasters(viewEl) {
  bindMaster(viewEl, "section-enabled", "[data-section-enabled]");
  bindMaster(viewEl, "entity-enabled", "[data-entity-enabled]");
  bindMaster(viewEl, "field-enabled", "[data-field-enabled]");
  bindMaster(viewEl, "field-required", "[data-field-required]");
  bindMaster(viewEl, "field-form", "[data-field-form]");
  bindMaster(viewEl, "field-list", "[data-field-list]");
  bindMaster(viewEl, "field-filters", "[data-field-filters]");
  bindMaster(viewEl, "field-card", "[data-field-card]");
}

function saveState(viewEl, businessId, entityKey) {
  viewEl.setAttribute("data-business-id", String(businessId || ""));
  viewEl.setAttribute("data-entity", String(entityKey || ""));
  if (businessId) {
    localStorage.setItem("settings_business_target_id", String(businessId));
  }
}

export async function render(ctx) {
  const { api, page, state, viewEl } = ctx;
  const lang = langOf();

  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  if (String(state?.me?.role || "") !== "super_admin") {
    viewEl.innerHTML = noAccessHtml(text(lang, "noAccess"));
    return;
  }

  let businesses;
  try {
    const resp = await api("/gekto/businesses");
    businesses = resp.items || [];
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const businessId = chooseBusinessId(viewEl, businesses);
  const selectedBusiness = businesses.find(item => Number(item.id) === Number(businessId)) || null;

  if (!selectedBusiness) {
    viewEl.innerHTML = errorHtml(text(lang, "businessRequired"));
    return;
  }

  let settingsResp;
  try {
    settingsResp = await loadBusinessSettings(api, businessId);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const sections = sortSections(settingsResp.sections || [], lang);
  const entities = sortEntities(settingsResp.entities || [], lang);
  const allFields = settingsResp.fields || [];

  const selectedEntity = viewEl.getAttribute("data-entity") || entities[0]?.entity_key || "";
  const fields = allFields.filter(item => item.entity_key === selectedEntity);
  const fieldsByKey = new Map(fields.map(item => [String(item.field_key), item]));

  saveState(viewEl, businessId, selectedEntity);

  viewEl.innerHTML = `
    <div class="biz-settings-page">
      <div id="settings_business_msg" class="small text-success mb-2"></div>

      <div class="card biz-settings-hero mb-3">
        <div class="card-body">
          <div class="biz-settings-hero-row">
            <div class="biz-settings-business-block">
              <label class="form-label mb-1">${esc(text(lang, "business"))}</label>
              <select id="settings_business_select" class="form-select">
                ${businesses.map(item => `
                  <option value="${item.id}" ${Number(item.id) === Number(businessId) ? "selected" : ""}>
                    #${item.id} - ${esc(item.name || "")}
                  </option>
                `).join("")}
              </select>
            </div>
            <button class="btn btn-outline-secondary" id="settings_business_reload">${esc(text(lang, "reload"))}</button>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header biz-settings-card-head">
          <div class="fw-semibold">${esc(text(lang, "sections"))}</div>
          <button class="btn btn-sm btn-primary" id="settings_business_save_sections">${esc(text(lang, "saveSections"))}</button>
        </div>
        <div class="card-body table-wrap">${sectionsTableHtml(sections, lang)}</div>
      </div>

      <div class="card mb-3">
        <div class="card-header biz-settings-card-head">
          <div class="fw-semibold">${esc(text(lang, "entities"))}</div>
          <button class="btn btn-sm btn-primary" id="settings_business_save_entities">${esc(text(lang, "saveEntities"))}</button>
        </div>
        <div class="card-body table-wrap">${entitiesTableHtml(entities, lang)}</div>
      </div>

      <div class="card">
        <div class="card-header biz-settings-card-head biz-settings-fields-head">
          <div class="fw-semibold">${esc(text(lang, "fields"))}</div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <select class="form-select form-select-sm biz-entity-select" id="settings_business_entity_select">
              ${entities.map(item => `
                <option value="${esc(item.entity_key)}" ${item.entity_key === selectedEntity ? "selected" : ""}>
                  ${esc(trLabel(item.label, lang) || item.entity_key)}
                </option>
              `).join("")}
            </select>
            <button class="btn btn-sm btn-primary" id="settings_business_save_fields">${esc(text(lang, "saveFields"))}</button>
          </div>
        </div>
        <div class="card-body table-wrap">${fieldsTableHtml(fields, lang)}</div>
      </div>
    </div>
  `;

  setupMasters(viewEl);

  const msgEl = document.getElementById("settings_business_msg");
  const showSaved = () => {
    msgEl.textContent = text(lang, "allSaved");
    clearTimeout(viewEl.__settingsBizMsgTimer);
    viewEl.__settingsBizMsgTimer = setTimeout(() => {
      msgEl.textContent = "";
    }, 1800);
  };

  document.getElementById("settings_business_select").addEventListener("change", (ev) => {
    const nextBusinessId = Number(ev.target.value || 0);
    saveState(viewEl, nextBusinessId, "");
    queueRerender(viewEl, "__settingsBizRenderTimer", () => render(ctx), 0);
  });

  document.getElementById("settings_business_reload").addEventListener("click", () => {
    queueRerender(viewEl, "__settingsBizRenderTimer", () => render(ctx), 0);
  });

  document.getElementById("settings_business_entity_select").addEventListener("change", (ev) => {
    saveState(viewEl, businessId, ev.target.value || "");
    queueRerender(viewEl, "__settingsBizRenderTimer", () => render(ctx), 0);
  });

  document.getElementById("settings_business_save_sections").addEventListener("click", async () => {
    const items = collectSectionPayload(viewEl);
    await api("/business-settings/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId, items })
    });
    showSaved();
  });

  document.getElementById("settings_business_save_entities").addEventListener("click", async () => {
    const items = collectEntityPayload(viewEl);
    await api("/business-settings/entities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId, items })
    });
    showSaved();
  });

  document.getElementById("settings_business_save_fields").addEventListener("click", async () => {
    if (!selectedEntity) return;
    const items = collectFieldPayload(viewEl, selectedEntity, fieldsByKey, lang);
    await api("/business-settings/fields", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId, items })
    });
    showSaved();
  });
}
