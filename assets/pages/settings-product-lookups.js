import {
  activeBadge,
  emptyHtml,
  errorHtml,
  esc,
  isEmptyFieldValue,
  langOf,
  loadEntityFieldAccess,
  noAccessHtml,
  pick,
  queueRerender,
  stripDisabledFields
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки: Реквизиты товаров",
    subtitle: "Справочники для статуса, состояния, бренда, производителя и стран",
    noAccess: "Раздел реквизитов товаров доступен только владельцу бизнеса",
    search: "Поиск",
    kindFilter: "Тип реквизита",
    allKinds: "Все типы",
    create: "Добавить значение",
    edit: "Редактировать значение",
    noItems: "Значения справочника не найдены",
    kind: "Тип",
    nameRu: "Наименование (RU)",
    nameUz: "Наименование (UZ)",
    nameEn: "Наименование (EN)",
    sortOrder: "Порядок",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    save: "Сохранить",
    update: "Изменить",
    requiredKind: "Выберите тип реквизита",
    requiredNameRu: "Укажите наименование на русском языке"
  },
  uz: {
    title: "Sozlamalar: Tovar rekvizitlari",
    subtitle: "Holat, holati, brend, ishlab chiqaruvchi va mamlakatlar uchun ma'lumotnomalar",
    noAccess: "Tovar rekvizitlari bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    kindFilter: "Rekvizit turi",
    allKinds: "Barcha turlar",
    create: "Qiymat qo'shish",
    edit: "Qiymatni tahrirlash",
    noItems: "Ma'lumotnoma qiymatlari topilmadi",
    kind: "Turi",
    nameRu: "Nomi (RU)",
    nameUz: "Nomi (UZ)",
    nameEn: "Nomi (EN)",
    sortOrder: "Tartib",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    save: "Saqlash",
    update: "Yangilash",
    requiredKind: "Rekvizit turini tanlang",
    requiredNameRu: "Rus tilidagi nomni kiriting"
  },
  en: {
    title: "Settings: Product attributes",
    subtitle: "Dictionaries for status, condition, brand, manufacturer and countries",
    noAccess: "Product attributes settings are available only to the business owner",
    search: "Search",
    kindFilter: "Attribute type",
    allKinds: "All types",
    create: "Add value",
    edit: "Edit value",
    noItems: "No dictionary values found",
    kind: "Type",
    nameRu: "Name (RU)",
    nameUz: "Name (UZ)",
    nameEn: "Name (EN)",
    sortOrder: "Sort order",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    save: "Save",
    update: "Update",
    requiredKind: "Select an attribute type",
    requiredNameRu: "Name in Russian is required"
  }
};

const LOOKUP_KIND_ORDER = [
  "country_manufacture",
  "product_status",
  "product_condition",
  "manufacturer",
  "country_brand",
  "brand",
  "device_type"
];

const LOOKUP_KIND_LABELS = {
  country_manufacture: {
    ru: "Страны производителя",
    uz: "Ishlab chiqaruvchi davlatlari",
    en: "Manufacturer countries"
  },
  product_status: {
    ru: "Статусы товара",
    uz: "Tovar statuslari",
    en: "Product statuses"
  },
  product_condition: {
    ru: "Состояние товара",
    uz: "Tovar holati",
    en: "Product condition"
  },
  manufacturer: {
    ru: "Производители",
    uz: "Ishlab chiqaruvchilar",
    en: "Manufacturers"
  },
  country_brand: {
    ru: "Страны бренда",
    uz: "Brend mamlakatlari",
    en: "Brand countries"
  },
  brand: {
    ru: "Бренды",
    uz: "Brendlar",
    en: "Brands"
  },
  device_type: {
    ru: "Типы устройств",
    uz: "Qurilma turlari",
    en: "Device types"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function kindLabel(kind, lang) {
  const value = LOOKUP_KIND_LABELS[String(kind || "")];
  if (!value) return String(kind || "");
  return value[lang] || value.ru || value.en || String(kind || "");
}

function kindOptionsHtml(lang, selectedKind, includeAll = false) {
  const options = LOOKUP_KIND_ORDER.map((kind) => {
    const selected = String(selectedKind || "") === kind;
    return `<option value="${esc(kind)}" ${selected ? "selected" : ""}>${esc(kindLabel(kind, lang))}</option>`;
  });
  if (includeAll) {
    const selectedAll = !selectedKind ? "selected" : "";
    options.unshift(`<option value="" ${selectedAll}>${esc(text(lang, "allKinds"))}</option>`);
  }
  return options.join("");
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    kind: String(item?.kind || ""),
    name_ru: String(item?.name_ru || ""),
    name_uz: String(item?.name_uz || ""),
    name_en: String(item?.name_en || ""),
    sort_order: Number(item?.sort_order || 100),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q, kind) {
  const kindNeedle = String(kind || "").trim();
  const filteredByKind = kindNeedle ? items.filter((item) => item.kind === kindNeedle) : items;

  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return filteredByKind;

  return filteredByKind.filter((item) => {
    return [
      item.name_ru,
      item.name_uz,
      item.name_en,
      kindLabel(item.kind, "ru"),
      kindLabel(item.kind, "uz"),
      kindLabel(item.kind, "en")
    ].some((value) => String(value || "").toLowerCase().includes(needle));
  });
}

function modalHtml(lang, item, fields) {
  return `
    <div class="row g-3">
      ${fields.showInForm("kind") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "kind"))}</label>
          <select class="form-select" name="kind">
            ${kindOptionsHtml(lang, item?.kind || "", false)}
          </select>
        </div>
      ` : ""}
      ${fields.showInForm("sort_order") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "sortOrder"))}</label>
          <input class="form-control" type="number" min="0" step="1" name="sort_order" value="${esc(item?.sort_order ?? 100)}">
        </div>
      ` : ""}

      ${fields.showInForm("name_ru") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "nameRu"))}</label>
          <input class="form-control" name="name_ru" value="${esc(item?.name_ru || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("name_uz") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "nameUz"))}</label>
          <input class="form-control" name="name_uz" value="${esc(item?.name_uz || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("name_en") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "nameEn"))}</label>
          <input class="form-control" name="name_en" value="${esc(item?.name_en || "")}">
        </div>
      ` : ""}

      ${fields.showInForm("is_active") ? `
        <div class="col-md-6">
          <div class="form-check form-switch mt-md-4 pt-md-2">
            <input class="form-check-input" type="checkbox" role="switch" name="is_active" ${Number(item?.is_active ?? 1) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "active"))}</label>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function readForm(modalEl) {
  const byName = (name) => modalEl.querySelector(`[name='${name}']`);
  const readText = (name, nullable = true) => {
    const val = String(byName(name)?.value || "").trim();
    if (!val) return nullable ? null : "";
    return val;
  };

  const sortRaw = String(byName("sort_order")?.value || "").trim();
  const sortVal = sortRaw === "" ? 100 : Number(sortRaw);

  return {
    kind: readText("kind"),
    name_ru: readText("name_ru"),
    name_uz: readText("name_uz"),
    name_en: readText("name_en"),
    sort_order: Number.isInteger(sortVal) && sortVal >= 0 ? sortVal : sortRaw,
    is_active: byName("is_active")?.checked ? 1 : 0
  };
}

function tableHtml(items, lang, fields) {
  return `
    <div class="card">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              ${fields.showInList("kind") ? `<th style="width:220px">${esc(text(lang, "kind"))}</th>` : ""}
              ${fields.showInList("name_ru") ? `<th>${esc(text(lang, "nameRu"))}</th>` : ""}
              ${fields.showInList("name_uz") ? `<th>${esc(text(lang, "nameUz"))}</th>` : ""}
              ${fields.showInList("name_en") ? `<th>${esc(text(lang, "nameEn"))}</th>` : ""}
              ${fields.showInList("sort_order") ? `<th style="width:120px">${esc(text(lang, "sortOrder"))}</th>` : ""}
              ${fields.showInList("is_active") ? `<th style="width:120px">${esc(text(lang, "status"))}</th>` : ""}
              <th style="width:170px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                ${fields.showInList("kind") ? `<td>${esc(kindLabel(item.kind, lang))}</td>` : ""}
                ${fields.showInList("name_ru") ? `<td class="fw-semibold">${esc(item.name_ru)}</td>` : ""}
                ${fields.showInList("name_uz") ? `<td>${esc(item.name_uz || "-")}</td>` : ""}
                ${fields.showInList("name_en") ? `<td>${esc(item.name_en || "-")}</td>` : ""}
                ${fields.showInList("sort_order") ? `<td>${esc(String(item.sort_order))}</td>` : ""}
                ${fields.showInList("is_active") ? `<td>${activeBadge(item.is_active, { active: text(lang, "active"), inactive: text(lang, "inactive") })}</td>` : ""}
                <td>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" data-edit-lookup="${item.id}">${esc(text(lang, "update"))}</button>
                    ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-lookup="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function openEntityModal(ctx, item, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item || { is_active: 1, sort_order: 100 }, fields),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl), fields);

      if (fields.isRequired("kind") && isEmptyFieldValue(payload.kind)) {
        throw new Error(text(lang, "requiredKind"));
      }
      if (fields.isRequired("name_ru") && isEmptyFieldValue(payload.name_ru)) {
        throw new Error(text(lang, "requiredNameRu"));
      }

      if (isCreate) {
        await api("/product-lookups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/product-lookups/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      await render(ctx);
    }
  });
}

export async function render(ctx) {
  const { api, page, state, viewEl } = ctx;
  const lang = langOf();

  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  if (String(state?.me?.role || "") !== "business_owner") {
    viewEl.innerHTML = noAccessHtml(text(lang, "noAccess"));
    return;
  }

  const q = viewEl.getAttribute("data-q") || "";
  const selectedKind = viewEl.getAttribute("data-kind") || "";

  let resp;
  let fields;
  try {
    [resp, fields] = await Promise.all([
      api("/product-lookups"),
      loadEntityFieldAccess(api, "product_lookup_values")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (resp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q, selectedKind);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-lg-4">
            <label class="form-label">${esc(text(lang, "kindFilter"))}</label>
            <select id="settings_product_lookups_kind" class="form-select">
              ${kindOptionsHtml(lang, selectedKind, true)}
            </select>
          </div>
          <div class="col-12 col-lg-5">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="settings_product_lookups_q" class="form-control" value="${esc(q)}">
          </div>
          <div class="col-12 col-lg-3 d-grid">
            <button id="settings_product_lookups_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
          </div>
        </div>
      </div>
    </div>

    ${items.length ? tableHtml(items, lang, fields) : emptyHtml(text(lang, "noItems"))}
  `;

  document.getElementById("settings_product_lookups_q").addEventListener("input", (ev) => {
    viewEl.setAttribute("data-q", String(ev.target?.value || "").trim());
    queueRerender(viewEl, "__settingsProductLookupsTimer", () => render(ctx), 180);
  });

  document.getElementById("settings_product_lookups_kind").addEventListener("change", (ev) => {
    viewEl.setAttribute("data-kind", String(ev.target?.value || "").trim());
    queueRerender(viewEl, "__settingsProductLookupsTimer", () => render(ctx), 0);
  });

  document.getElementById("settings_product_lookups_create").addEventListener("click", () => {
    openEntityModal(ctx, { is_active: 1, sort_order: 100 }, fields);
  });

  document.querySelectorAll("[data-edit-lookup]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editLookup);
      const item = allItems.find((entry) => entry.id === id);
      if (item) openEntityModal(ctx, item, fields);
    });
  });

  if (fields.isEnabled("is_active")) {
    document.querySelectorAll("[data-toggle-lookup]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.toggleLookup);
        const next = Number(btn.dataset.next);
        await api(`/product-lookups/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: next })
        });
        await render(ctx);
      });
    });
  }
}
