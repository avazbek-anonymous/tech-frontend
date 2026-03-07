import {
  esc,
  errorHtml,
  langOf,
  noAccessHtml,
  pick
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки: Бизнес",
    subtitle: "Включение разделов, сущностей и реквизитов для конкретного бизнеса",
    noAccess: "Раздел доступен только владельцу бизнеса",
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
    comments: "Комментарии (RU / UZ / EN)",
    dictionary: "Справочник",
    document: "Документ",
    saveSections: "Сохранить разделы",
    saveEntities: "Сохранить сущности",
    saveFields: "Сохранить реквизиты",
    selectEntity: "Выберите сущность",
    allSaved: "Изменения сохранены"
  },
  uz: {
    title: "Sozlamalar: Biznes",
    subtitle: "Muayyan biznes uchun bo'limlar, obyektlar va rekvizitlarni boshqarish",
    noAccess: "Bo'lim faqat biznes egasi uchun ochiq",
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
    comments: "Izohlar (RU / UZ / EN)",
    dictionary: "Ma'lumotnoma",
    document: "Hujjat",
    saveSections: "Bo'limlarni saqlash",
    saveEntities: "Obyektlarni saqlash",
    saveFields: "Rekvizitlarni saqlash",
    selectEntity: "Obyektni tanlang",
    allSaved: "O'zgarishlar saqlandi"
  },
  en: {
    title: "Settings: Business",
    subtitle: "Configure sections, entities, and fields for a specific business",
    noAccess: "Section is available only to business owner",
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
    comments: "Comments (RU / UZ / EN)",
    dictionary: "Dictionary",
    document: "Document",
    saveSections: "Save sections",
    saveEntities: "Save entities",
    saveFields: "Save fields",
    selectEntity: "Select entity",
    allSaved: "Changes saved"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function trLabel(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru || value.en || "";
}

function sectionRowsHtml(sections, lang) {
  return sections.map(item => `
    <tr>
      <td class="small text-muted">${esc(trLabel(item.group_label, lang) || "-")}</td>
      <td>${esc(trLabel(item.label, lang) || item.section_id)}</td>
      <td class="text-center">
        <input class="form-check-input" type="checkbox" data-section-enabled="${esc(item.section_id)}" ${Number(item.is_enabled) === 1 ? "checked" : ""} ${Number(item.locked) === 1 ? "disabled" : ""}>
      </td>
    </tr>
  `).join("");
}

function entityRowsHtml(entities, lang) {
  return entities.map(item => `
    <tr>
      <td>${esc(trLabel(item.label, lang) || item.entity_key)}</td>
      <td class="small text-muted">${esc(item.entity_type === "document" ? text(lang, "document") : text(lang, "dictionary"))}</td>
      <td class="text-center">
        <input class="form-check-input" type="checkbox" data-entity-enabled="${esc(item.entity_key)}" ${Number(item.is_enabled) === 1 ? "checked" : ""}>
      </td>
    </tr>
  `).join("");
}

function fieldRowsHtml(fields, lang) {
  return fields.map(item => `
    <tr data-field-row="${esc(item.field_key)}">
      <td>
        <div class="fw-semibold">${esc(trLabel(item.label, lang) || item.field_key)}</div>
        <div class="small text-muted">${esc(item.field_key)}</div>
      </td>
      <td class="text-center"><input class="form-check-input" type="checkbox" data-field-enabled ${Number(item.is_enabled) === 1 ? "checked" : ""}></td>
      <td class="text-center"><input class="form-check-input" type="checkbox" data-field-required ${Number(item.is_required) === 1 ? "checked" : ""}></td>
      <td class="text-center"><input class="form-check-input" type="checkbox" data-field-form ${Number(item.show_in_form) === 1 ? "checked" : ""}></td>
      <td class="text-center"><input class="form-check-input" type="checkbox" data-field-list ${Number(item.show_in_list) === 1 ? "checked" : ""}></td>
      <td class="text-center"><input class="form-check-input" type="checkbox" data-field-filters ${Number(item.show_in_filters) === 1 ? "checked" : ""}></td>
      <td class="text-center"><input class="form-check-input" type="checkbox" data-field-card ${Number(item.show_in_card) === 1 ? "checked" : ""}></td>
      <td style="min-width:340px">
        <div class="d-grid gap-1">
          <input class="form-control form-control-sm" data-comment-ru value="${esc(item.comment_ru || "")}" placeholder="RU">
          <input class="form-control form-control-sm" data-comment-uz value="${esc(item.comment_uz || "")}" placeholder="UZ">
          <input class="form-control form-control-sm" data-comment-en value="${esc(item.comment_en || "")}" placeholder="EN">
        </div>
      </td>
    </tr>
  `).join("");
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

function collectFieldPayload(viewEl, entityKey) {
  return Array.from(viewEl.querySelectorAll("[data-field-row]")).map(row => ({
    entity_key: entityKey,
    field_key: String(row.dataset.fieldRow || ""),
    is_enabled: row.querySelector("[data-field-enabled]")?.checked ? 1 : 0,
    is_required: row.querySelector("[data-field-required]")?.checked ? 1 : 0,
    show_in_form: row.querySelector("[data-field-form]")?.checked ? 1 : 0,
    show_in_list: row.querySelector("[data-field-list]")?.checked ? 1 : 0,
    show_in_filters: row.querySelector("[data-field-filters]")?.checked ? 1 : 0,
    show_in_card: row.querySelector("[data-field-card]")?.checked ? 1 : 0,
    comment_ru: row.querySelector("[data-comment-ru]")?.value || "",
    comment_uz: row.querySelector("[data-comment-uz]")?.value || "",
    comment_en: row.querySelector("[data-comment-en]")?.value || ""
  }));
}

export async function render(ctx) {
  const { api, page, state, viewEl } = ctx;
  const lang = langOf();

  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  if (String(state?.me?.role || "") !== "business_owner") {
    viewEl.innerHTML = noAccessHtml(text(lang, "noAccess"));
    return;
  }

  let resp;
  try {
    resp = await api("/business-settings");
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const sections = (resp.sections || []).slice().sort((a, b) => {
    const ga = trLabel(a.group_label, lang);
    const gb = trLabel(b.group_label, lang);
    if (ga !== gb) return ga.localeCompare(gb);
    return trLabel(a.label, lang).localeCompare(trLabel(b.label, lang));
  });

  const entities = (resp.entities || []).slice().sort((a, b) => {
    if (a.entity_type !== b.entity_type) return a.entity_type.localeCompare(b.entity_type);
    return trLabel(a.label, lang).localeCompare(trLabel(b.label, lang));
  });

  const allFields = resp.fields || [];
  const selectedEntity = viewEl.getAttribute("data-entity") || entities[0]?.entity_key || "";
  const entityFields = allFields.filter(item => item.entity_key === selectedEntity);

  viewEl.innerHTML = `
    <div id="settings_business_msg" class="small text-success mb-2"></div>

    <div class="card mb-3">
      <div class="card-header d-flex align-items-center justify-content-between gap-2">
        <div class="fw-semibold">${esc(text(lang, "sections"))}</div>
        <button class="btn btn-sm btn-primary" id="settings_business_save_sections">${esc(text(lang, "saveSections"))}</button>
      </div>
      <div class="card-body table-wrap">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>${esc(text(lang, "group"))}</th>
              <th>${esc(text(lang, "section"))}</th>
              <th class="text-center" style="width:120px">${esc(text(lang, "enabled"))}</th>
            </tr>
          </thead>
          <tbody>${sectionRowsHtml(sections, lang)}</tbody>
        </table>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-header d-flex align-items-center justify-content-between gap-2">
        <div class="fw-semibold">${esc(text(lang, "entities"))}</div>
        <button class="btn btn-sm btn-primary" id="settings_business_save_entities">${esc(text(lang, "saveEntities"))}</button>
      </div>
      <div class="card-body table-wrap">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>${esc(text(lang, "object"))}</th>
              <th style="width:160px">${esc(text(lang, "objectType"))}</th>
              <th class="text-center" style="width:120px">${esc(text(lang, "enabled"))}</th>
            </tr>
          </thead>
          <tbody>${entityRowsHtml(entities, lang)}</tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div class="fw-semibold">${esc(text(lang, "fields"))}</div>
        <div class="d-flex align-items-center gap-2">
          <select class="form-select form-select-sm" id="settings_business_entity_select">
            ${entities.map(item => `
              <option value="${esc(item.entity_key)}" ${item.entity_key === selectedEntity ? "selected" : ""}>
                ${esc(trLabel(item.label, lang) || item.entity_key)}
              </option>
            `).join("")}
          </select>
          <button class="btn btn-sm btn-primary" id="settings_business_save_fields">${esc(text(lang, "saveFields"))}</button>
        </div>
      </div>
      <div class="card-body table-wrap">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>${esc(text(lang, "field"))}</th>
              <th class="text-center">${esc(text(lang, "enabled"))}</th>
              <th class="text-center">${esc(text(lang, "required"))}</th>
              <th class="text-center">${esc(text(lang, "form"))}</th>
              <th class="text-center">${esc(text(lang, "list"))}</th>
              <th class="text-center">${esc(text(lang, "filters"))}</th>
              <th class="text-center">${esc(text(lang, "card"))}</th>
              <th>${esc(text(lang, "comments"))}</th>
            </tr>
          </thead>
          <tbody>${fieldRowsHtml(entityFields, lang)}</tbody>
        </table>
      </div>
    </div>
  `;

  const msgEl = document.getElementById("settings_business_msg");

  const showSaved = () => {
    msgEl.textContent = text(lang, "allSaved");
    clearTimeout(viewEl.__settingsBizMsgTimer);
    viewEl.__settingsBizMsgTimer = setTimeout(() => {
      msgEl.textContent = "";
    }, 1800);
  };

  document.getElementById("settings_business_entity_select").addEventListener("change", (ev) => {
    viewEl.setAttribute("data-entity", ev.target.value);
    render(ctx);
  });

  document.getElementById("settings_business_save_sections").addEventListener("click", async () => {
    const items = collectSectionPayload(viewEl);
    await api("/business-settings/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    showSaved();
  });

  document.getElementById("settings_business_save_entities").addEventListener("click", async () => {
    const items = collectEntityPayload(viewEl);
    await api("/business-settings/entities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    showSaved();
  });

  document.getElementById("settings_business_save_fields").addEventListener("click", async () => {
    if (!selectedEntity) return;
    const items = collectFieldPayload(viewEl, selectedEntity);
    await api("/business-settings/fields", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    showSaved();
  });
}
