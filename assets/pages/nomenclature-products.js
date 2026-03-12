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
  stripDisabledFields,
  ynBadge
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Номенклатура: Товары",
    subtitle: "Каталог товаров для продаж и складских операций",
    search: "Поиск",
    create: "Добавить товар",
    edit: "Редактировать товар",
    noItems: "Товары не найдены",
    actions: "Действия",
    save: "Сохранить",
    update: "Изменить",
    active: "Активен",
    inactive: "Неактивен",
    discontinued: "Снят с продажи",
    archived: "Архив",
    yes: "Да",
    no: "Нет",
    mainBlock: "Основное",
    commercialBlock: "Коммерческие",
    technicalBlock: "Технические",
    advancedOpen: "Показать технические поля",
    advancedClose: "Скрыть технические поля",
    topLevel: "Без категории",
    noSubcategory: "Без подкатегории",
    noUnit: "Не выбрано",
    noType: "Не выбрано",
    noSupplier: "Не выбран",
    noLookup: "Не выбрано",
    requiredName: "Укажите наименование товара",
    invalidCategory: "Выбрана некорректная категория",
    invalidSubcategory: "Выбрана некорректная подкатегория",
    selectLeafCategory: "Выберите конечную категорию без вложенных подкатегорий",
    invalidUnit: "Выбрана некорректная единица измерения",
    invalidProductType: "Выбран некорректный тип товара",
    invalidSupplier: "Выбран некорректный поставщик",
    invalidLookup: "Выбрано некорректное значение справочника",
    invalidSimCount: "Количество SIM должно быть целым числом (0, 1, 2...)",
    invalidLeadTime: "Срок поставки должен быть целым числом дней",
    duplicateCode: "Товар с таким кодом уже существует",
    duplicateSku: "Товар с таким SKU уже существует",
    duplicateBarcode: "Товар с таким штрихкодом уже существует",
    duplicateExtraBarcode: "Товар с таким доп. штрихкодом уже существует"
  },
  uz: {
    title: "Nomenklatura: Tovarlar",
    subtitle: "Sotuv va ombor operatsiyalari uchun tovarlar katalogi",
    search: "Qidiruv",
    create: "Tovar qo'shish",
    edit: "Tovarni tahrirlash",
    noItems: "Tovarlar topilmadi",
    actions: "Amallar",
    save: "Saqlash",
    update: "Yangilash",
    active: "Faol",
    inactive: "Faol emas",
    discontinued: "Sotuvdan olingan",
    archived: "Arxiv",
    yes: "Ha",
    no: "Yo'q",
    mainBlock: "Asosiy",
    commercialBlock: "Tijorat",
    technicalBlock: "Texnik",
    advancedOpen: "Texnik maydonlarni ko'rsatish",
    advancedClose: "Texnik maydonlarni yashirish",
    topLevel: "Kategoriyasiz",
    noSubcategory: "Quyi kategoriyasiz",
    noUnit: "Tanlanmagan",
    noType: "Tanlanmagan",
    noSupplier: "Tanlanmagan",
    noLookup: "Tanlanmagan",
    requiredName: "Tovar nomini kiriting",
    invalidCategory: "Noto'g'ri kategoriya tanlandi",
    invalidSubcategory: "Noto'g'ri quyi kategoriya tanlandi",
    selectLeafCategory: "Ichki bo'limsiz yakuniy kategoriya tanlang",
    invalidUnit: "Noto'g'ri o'lchov birligi tanlandi",
    invalidProductType: "Noto'g'ri tovar turi tanlandi",
    invalidSupplier: "Noto'g'ri ta'minotchi tanlandi",
    invalidLookup: "Ma'lumotnomadan noto'g'ri qiymat tanlandi",
    invalidSimCount: "SIM soni butun son bo'lishi kerak (0, 1, 2...)",
    invalidLeadTime: "Yetkazish muddati kunlarda butun son bo'lishi kerak",
    duplicateCode: "Bunday kodli tovar allaqachon mavjud",
    duplicateSku: "Bunday SKUli tovar allaqachon mavjud",
    duplicateBarcode: "Bunday shtrixkodli tovar allaqachon mavjud",
    duplicateExtraBarcode: "Bunday qo'shimcha shtrixkodli tovar allaqachon mavjud"
  },
  en: {
    title: "Nomenclature: Products",
    subtitle: "Products catalog for sales and warehouse operations",
    search: "Search",
    create: "Add product",
    edit: "Edit product",
    noItems: "No products found",
    actions: "Actions",
    save: "Save",
    update: "Update",
    active: "Active",
    inactive: "Inactive",
    discontinued: "Discontinued",
    archived: "Archived",
    yes: "Yes",
    no: "No",
    mainBlock: "Main",
    commercialBlock: "Commercial",
    technicalBlock: "Technical",
    advancedOpen: "Show technical fields",
    advancedClose: "Hide technical fields",
    topLevel: "No category",
    noSubcategory: "No subcategory",
    noUnit: "Not selected",
    noType: "Not selected",
    noSupplier: "Not selected",
    noLookup: "Not selected",
    requiredName: "Product name is required",
    invalidCategory: "Invalid category selected",
    invalidSubcategory: "Invalid subcategory selected",
    selectLeafCategory: "Select a final category without nested subcategories",
    invalidUnit: "Invalid unit selected",
    invalidProductType: "Invalid product type selected",
    invalidSupplier: "Invalid supplier selected",
    invalidLookup: "Invalid dictionary value selected",
    invalidSimCount: "SIM count must be an integer (0, 1, 2...)",
    invalidLeadTime: "Lead time must be an integer number of days",
    duplicateCode: "Product code already exists",
    duplicateSku: "Product SKU already exists",
    duplicateBarcode: "Product barcode already exists",
    duplicateExtraBarcode: "Product extra barcode already exists"
  }
};

const TEXT_KEYS = [
  "name", "full_name", "code", "article", "sku", "barcode", "extra_barcode",
  "model", "series", "description", "image_url", "warranty", "exchange_return_term",
  "serial_number", "imei_1", "imei_2", "mac_address", "batch_number", "production_date",
  "warranty_start_date", "warranty_end_date",
  "color", "memory_capacity", "ram", "cpu", "gpu", "screen_size", "screen_resolution",
  "screen_type", "refresh_rate", "battery_capacity", "operating_system", "network_standard",
  "wifi", "bluetooth", "main_camera", "front_camera", "ports", "package_contents", "weight", "dimensions"
];

const NUM_KEYS = [
  "min_stock", "max_stock"
];

const BOOL_KEYS = [
  "track_serial", "track_imei", "track_imei2", "track_batches", "is_commission",
  "complete_set", "warranty_activated", "esim_support", "nfc"
];

const LOOKUP_FIELD_MAP = {
  brand_id: "brand",
  device_type_id: "device_type",
  manufacturer_id: "manufacturer",
  country_manufacture_id: "country_manufacture",
  country_brand_id: "country_brand",
  product_status_id: "product_status",
  product_condition_id: "product_condition"
};

const TECHNICAL_KEYS = [
  "color",
  "memory_capacity",
  "ram",
  "cpu",
  "gpu",
  "screen_size",
  "screen_resolution",
  "screen_type",
  "refresh_rate",
  "battery_capacity",
  "operating_system",
  "sim_count",
  "esim_support",
  "network_standard",
  "wifi",
  "bluetooth",
  "nfc",
  "main_camera",
  "front_camera",
  "ports",
  "package_contents",
  "weight",
  "dimensions"
];

function text(lang, key) {
  return pick(UI, lang, key);
}

function visible(fields, key, mode = "form") {
  if (mode === "list") return fields.showInList(key);
  if (mode === "filters") return fields.showInFilters(key);
  if (mode === "card") return fields.showInCard(key);
  return fields.showInForm(key);
}

function fieldLabel(fields, lang, key, fallback = "") {
  return esc(fields.label(key, lang, fallback || key));
}

function optionHtml(value, selected, label) {
  return `<option value="${esc(value)}" ${String(selected ?? "") === String(value ?? "") ? "selected" : ""}>${esc(label)}</option>`;
}

function normalizeItem(item) {
  const out = {
    id: Number(item?.id || 0),
    category_id: item?.category_id ? Number(item.category_id) : null,
    subcategory_id: item?.subcategory_id ? Number(item.subcategory_id) : null,
    unit_id: item?.unit_id ? Number(item.unit_id) : null,
    product_type_id: item?.product_type_id ? Number(item.product_type_id) : null,
    supplier_id: item?.supplier_id ? Number(item.supplier_id) : null,
    brand_id: item?.brand_id ? Number(item.brand_id) : null,
    device_type_id: item?.device_type_id ? Number(item.device_type_id) : null,
    manufacturer_id: item?.manufacturer_id ? Number(item.manufacturer_id) : null,
    country_manufacture_id: item?.country_manufacture_id ? Number(item.country_manufacture_id) : null,
    country_brand_id: item?.country_brand_id ? Number(item.country_brand_id) : null,
    product_status_id: item?.product_status_id ? Number(item.product_status_id) : null,
    product_condition_id: item?.product_condition_id ? Number(item.product_condition_id) : null,
    product_status: String(item?.product_status || ""),
    is_active: Number(item?.is_active || 0),
    sim_count: item?.sim_count === null || item?.sim_count === undefined || item?.sim_count === "" ? null : Number(item?.sim_count),
    lead_time_days: Number(item?.lead_time_days || 0),
    min_stock: Number(item?.min_stock || 0),
    max_stock: Number(item?.max_stock || 0)
  };

  for (const key of TEXT_KEYS) out[key] = String(item?.[key] || "");
  for (const key of BOOL_KEYS) out[key] = Number(item?.[key] || 0);

  out.category_name = String(item?.category_name || "");
  out.subcategory_name = String(item?.subcategory_name || "");
  out.unit_name = String(item?.unit_name || "");
  out.product_type_name = String(item?.product_type_name || "");
  out.supplier_name = String(item?.supplier_name || "");
  out.brand_name = String(item?.brand_name || item?.brand || "");
  out.device_type_name = String(item?.device_type_name || item?.device_type || "");
  out.manufacturer_name = String(item?.manufacturer_name || item?.manufacturer || "");
  out.country_manufacture_name = String(item?.country_manufacture_name || item?.country_manufacture || "");
  out.country_brand_name = String(item?.country_brand_name || item?.country_brand || "");
  out.product_status_name = String(item?.product_status_name || item?.product_status || "");
  out.product_condition_name = String(item?.product_condition_name || item?.product_condition || "");

  return out;
}

function normalizeCategory(item) {
  return {
    id: Number(item?.id || 0),
    parent_id: item?.parent_id ? Number(item.parent_id) : null,
    name: String(item?.name || "")
  };
}

function normalizeSimple(item) {
  return {
    id: Number(item?.id || 0),
    name: String(item?.full_name || item?.name || "")
  };
}

function normalizeLookup(item) {
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

function lookupLabel(item, lang) {
  if (!item) return "";
  if (lang === "uz") return String(item.name_uz || item.name_ru || item.name_en || "").trim();
  if (lang === "en") return String(item.name_en || item.name_ru || item.name_uz || "").trim();
  return String(item.name_ru || item.name_uz || item.name_en || "").trim();
}

function groupedLookupsByKind(items) {
  const map = {};
  Object.values(LOOKUP_FIELD_MAP).forEach((kind) => {
    map[kind] = [];
  });
  for (const item of items) {
    if (!map[item.kind]) continue;
    if (Number(item.is_active || 0) !== 1) continue;
    map[item.kind].push(item);
  }
  for (const kind of Object.keys(map)) {
    map[kind].sort((a, b) => {
      const ao = Number(a.sort_order || 0);
      const bo = Number(b.sort_order || 0);
      if (ao !== bo) return ao - bo;
      return String(a.name_ru || "").localeCompare(String(b.name_ru || ""), undefined, { sensitivity: "base" });
    });
  }
  return map;
}

function sortByName(items) {
  return [...items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));
}

function buildCategoryMaps(categories) {
  const byId = new Map();
  const byParent = new Map();
  for (const row of categories) {
    byId.set(row.id, row);
    const parent = row.parent_id || null;
    const list = byParent.get(parent) || [];
    list.push(row);
    byParent.set(parent, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));
  }
  const leaves = [];
  for (const row of byId.values()) {
    const children = byParent.get(row.id) || [];
    if (!children.length) leaves.push(row);
  }
  return { byId, byParent, roots: byParent.get(null) || [], leaves };
}

function leafCategoryId(item) {
  const categoryId = item?.category_id ? Number(item.category_id) : null;
  const subcategoryId = item?.subcategory_id ? Number(item.subcategory_id) : null;
  return subcategoryId || categoryId || null;
}

function categoryPathByLeafId(maps, leafId) {
  const id = leafId ? Number(leafId) : null;
  if (!id) return "";
  const parts = [];
  const seen = new Set();
  let cur = maps.byId.get(id) || null;
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.push(String(cur.name || "").trim());
    const parentId = cur.parent_id ? Number(cur.parent_id) : null;
    cur = parentId ? (maps.byId.get(parentId) || null) : null;
  }
  return parts.reverse().filter(Boolean).join(" / ");
}

function categoryPath(item, lang) {
  return String(item?.category_path || "").trim() || text(lang, "topLevel");
}

function statusBadgeHtml(lang, statusValue, isActive) {
  const label = String(statusValue || "").trim() || (Number(isActive || 0) === 1 ? text(lang, "active") : text(lang, "inactive"));
  if (Number(isActive || 0) === 1) {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">${esc(label)}</span>`;
  }
  return `<span class="badge text-bg-secondary">${esc(label)}</span>`;
}

function leafCategoryOptionsHtml(lang, maps, selectedId) {
  const options = maps.leaves
    .map((row) => ({
      id: row.id,
      path: categoryPathByLeafId(maps, row.id)
    }))
    .sort((a, b) => String(a.path || "").localeCompare(String(b.path || ""), undefined, { sensitivity: "base" }));

  return `
    <option value="">${esc(text(lang, "topLevel"))}</option>
    ${options.map((row) => optionHtml(row.id, selectedId, row.path || row.id)).join("")}
  `;
}

function simpleOptionsHtml(list, selectedId, emptyText) {
  return `
    <option value="">${esc(emptyText)}</option>
    ${sortByName(list).map((row) => optionHtml(row.id, selectedId, row.name)).join("")}
  `;
}

function lookupOptionsHtml(lang, list, selectedId, emptyText) {
  const values = Array.isArray(list) ? list : [];
  return `
    <option value="">${esc(emptyText)}</option>
    ${values.map((row) => optionHtml(row.id, selectedId, lookupLabel(row, lang) || row.id)).join("")}
  `;
}

function textInput(fields, lang, key, value, col = "col-md-4") {
  if (!visible(fields, key, "form")) return "";
  return `
    <div class="${col}">
      <label class="form-label">${fieldLabel(fields, lang, key)}</label>
      <input class="form-control" name="${esc(key)}" value="${esc(value ?? "")}">
    </div>
  `;
}

function numberInput(fields, lang, key, value, col = "col-md-4", step = "0.01") {
  if (!visible(fields, key, "form")) return "";
  return `
    <div class="${col}">
      <label class="form-label">${fieldLabel(fields, lang, key)}</label>
      <input class="form-control" type="number" min="0" step="${esc(step)}" name="${esc(key)}" value="${esc(value ?? "")}">
    </div>
  `;
}

function dateInput(fields, lang, key, value, col = "col-md-4") {
  if (!visible(fields, key, "form")) return "";
  return `
    <div class="${col}">
      <label class="form-label">${fieldLabel(fields, lang, key)}</label>
      <input class="form-control" type="date" name="${esc(key)}" value="${esc(value ?? "")}">
    </div>
  `;
}

function boolInput(fields, lang, key, value, col = "col-md-3") {
  if (!visible(fields, key, "form")) return "";
  return `
    <div class="${col}">
      <div class="form-check form-switch mt-md-4 pt-md-2">
        <input class="form-check-input" type="checkbox" role="switch" name="${esc(key)}" ${Number(value || 0) === 1 ? "checked" : ""}>
        <label class="form-check-label">${fieldLabel(fields, lang, key)}</label>
      </div>
    </div>
  `;
}

function textAreaInput(fields, lang, key, value, col = "col-12", rows = 2) {
  if (!visible(fields, key, "form")) return "";
  return `
    <div class="${col}">
      <label class="form-label">${fieldLabel(fields, lang, key)}</label>
      <textarea class="form-control" rows="${rows}" name="${esc(key)}">${esc(value ?? "")}</textarea>
    </div>
  `;
}

function modalHtml(lang, draft, categories, units, productTypes, suppliers, lookupsByKind, fields) {
  const maps = buildCategoryMaps(categories);
  const item = { ...draft, category_id: leafCategoryId(draft) };
  const hasTechnical = TECHNICAL_KEYS.some((key) => visible(fields, key, "form"));

  return `
    <div data-product-form>
      <div class="product-form-block">
        <div class="product-form-title">${esc(text(lang, "mainBlock"))}</div>
        <div class="row g-3">
          ${textInput(fields, lang, "name", item.name, "col-md-6")}
          ${textInput(fields, lang, "full_name", item.full_name, "col-md-6")}
          ${textInput(fields, lang, "code", item.code, "col-md-3")}
          ${textInput(fields, lang, "article", item.article, "col-md-3")}
          ${textInput(fields, lang, "sku", item.sku, "col-md-3")}

          ${visible(fields, "unit_id", "form") ? `
            <div class="col-md-3">
              <label class="form-label">${fieldLabel(fields, lang, "unit_id")}</label>
              <select class="form-select" name="unit_id">
                ${simpleOptionsHtml(units, item.unit_id, text(lang, "noUnit"))}
              </select>
            </div>
          ` : ""}

          ${visible(fields, "category_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "category_id")}</label>
              <select class="form-select" name="category_id" data-product-category>
                ${leafCategoryOptionsHtml(lang, maps, item.category_id)}
              </select>
            </div>
          ` : ""}

          ${visible(fields, "product_type_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "product_type_id")}</label>
              <select class="form-select" name="product_type_id">
                ${simpleOptionsHtml(productTypes, item.product_type_id, text(lang, "noType"))}
              </select>
            </div>
          ` : ""}

          ${visible(fields, "brand_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "brand_id")}</label>
              <select class="form-select" name="brand_id">
                ${lookupOptionsHtml(lang, lookupsByKind.brand, item.brand_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}
          ${textInput(fields, lang, "model", item.model, "col-md-4")}
          ${textInput(fields, lang, "series", item.series, "col-md-4")}
          ${visible(fields, "device_type_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "device_type_id")}</label>
              <select class="form-select" name="device_type_id">
                ${lookupOptionsHtml(lang, lookupsByKind.device_type, item.device_type_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}
          ${textInput(fields, lang, "barcode", item.barcode, "col-md-4")}
          ${textInput(fields, lang, "extra_barcode", item.extra_barcode, "col-md-4")}
          ${visible(fields, "manufacturer_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "manufacturer_id")}</label>
              <select class="form-select" name="manufacturer_id">
                ${lookupOptionsHtml(lang, lookupsByKind.manufacturer, item.manufacturer_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}
          ${visible(fields, "country_manufacture_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "country_manufacture_id")}</label>
              <select class="form-select" name="country_manufacture_id">
                ${lookupOptionsHtml(lang, lookupsByKind.country_manufacture, item.country_manufacture_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}
          ${visible(fields, "country_brand_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "country_brand_id")}</label>
              <select class="form-select" name="country_brand_id">
                ${lookupOptionsHtml(lang, lookupsByKind.country_brand, item.country_brand_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}
          ${textInput(fields, lang, "image_url", item.image_url, "col-md-6")}
          ${textAreaInput(fields, lang, "description", item.description, "col-md-6", 2)}

          ${visible(fields, "product_status_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "product_status_id")}</label>
              <select class="form-select" name="product_status_id">
                ${lookupOptionsHtml(lang, lookupsByKind.product_status, item.product_status_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}

          ${boolInput(fields, lang, "is_active", Number(item.is_active ?? 1), "col-md-4")}
        </div>
      </div>

      <div class="product-form-block mt-3">
        <div class="product-form-title">${esc(text(lang, "commercialBlock"))}</div>
        <div class="row g-3">
          ${visible(fields, "supplier_id", "form") ? `
            <div class="col-md-6">
              <label class="form-label">${fieldLabel(fields, lang, "supplier_id")}</label>
              <select class="form-select" name="supplier_id">
                ${simpleOptionsHtml(suppliers, item.supplier_id, text(lang, "noSupplier"))}
              </select>
            </div>
          ` : ""}

          ${numberInput(fields, lang, "min_stock", item.min_stock, "col-md-3")}
          ${numberInput(fields, lang, "max_stock", item.max_stock, "col-md-3")}
          ${numberInput(fields, lang, "lead_time_days", item.lead_time_days, "col-md-3", "1")}
          ${textInput(fields, lang, "warranty", item.warranty, "col-md-6")}
          ${textInput(fields, lang, "exchange_return_term", item.exchange_return_term, "col-md-6")}
          ${boolInput(fields, lang, "is_commission", item.is_commission)}
          ${boolInput(fields, lang, "track_serial", item.track_serial)}
          ${boolInput(fields, lang, "track_imei", item.track_imei)}
          ${boolInput(fields, lang, "track_imei2", item.track_imei2)}
          ${boolInput(fields, lang, "track_batches", item.track_batches)}
          ${textInput(fields, lang, "serial_number", item.serial_number, "col-md-4")}
          ${textInput(fields, lang, "imei_1", item.imei_1, "col-md-4")}
          ${textInput(fields, lang, "imei_2", item.imei_2, "col-md-4")}
          ${textInput(fields, lang, "mac_address", item.mac_address, "col-md-4")}
          ${textInput(fields, lang, "batch_number", item.batch_number, "col-md-4")}
          ${dateInput(fields, lang, "production_date", item.production_date, "col-md-4")}
          ${visible(fields, "product_condition_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "product_condition_id")}</label>
              <select class="form-select" name="product_condition_id">
                ${lookupOptionsHtml(lang, lookupsByKind.product_condition, item.product_condition_id, text(lang, "noLookup"))}
              </select>
            </div>
          ` : ""}
          ${boolInput(fields, lang, "complete_set", item.complete_set, "col-md-4")}
          ${boolInput(fields, lang, "warranty_activated", item.warranty_activated, "col-md-4")}
          ${dateInput(fields, lang, "warranty_start_date", item.warranty_start_date, "col-md-4")}
          ${dateInput(fields, lang, "warranty_end_date", item.warranty_end_date, "col-md-4")}
        </div>
      </div>

      ${hasTechnical ? `
        <div class="product-advanced-toggle mt-3 pt-2 border-top">
          <button class="btn btn-link p-0 product-advanced-btn" type="button" data-product-advanced-toggle aria-expanded="false">
            <i class="bi bi-chevron-down" data-product-advanced-icon></i>
            <span data-product-advanced-label>${esc(text(lang, "advancedOpen"))}</span>
          </button>
        </div>

        <div class="product-advanced-body d-none" data-product-advanced-body>
          <div class="product-form-block mt-3">
            <div class="product-form-title">${esc(text(lang, "technicalBlock"))}</div>
            <div class="row g-3">
              ${textInput(fields, lang, "color", item.color)}
              ${textInput(fields, lang, "memory_capacity", item.memory_capacity)}
              ${textInput(fields, lang, "ram", item.ram)}
              ${textInput(fields, lang, "cpu", item.cpu)}
              ${textInput(fields, lang, "gpu", item.gpu)}
              ${textInput(fields, lang, "screen_size", item.screen_size)}
              ${textInput(fields, lang, "screen_resolution", item.screen_resolution)}
              ${textInput(fields, lang, "screen_type", item.screen_type)}
              ${textInput(fields, lang, "refresh_rate", item.refresh_rate)}
              ${textInput(fields, lang, "battery_capacity", item.battery_capacity)}
              ${textInput(fields, lang, "operating_system", item.operating_system)}
              ${numberInput(fields, lang, "sim_count", item.sim_count, "col-md-4", "1")}
              ${boolInput(fields, lang, "esim_support", item.esim_support, "col-md-4")}
              ${textInput(fields, lang, "network_standard", item.network_standard)}
              ${textInput(fields, lang, "wifi", item.wifi)}
              ${textInput(fields, lang, "bluetooth", item.bluetooth)}
              ${boolInput(fields, lang, "nfc", item.nfc, "col-md-4")}
              ${textInput(fields, lang, "main_camera", item.main_camera)}
              ${textInput(fields, lang, "front_camera", item.front_camera)}
              ${textInput(fields, lang, "ports", item.ports)}
              ${textInput(fields, lang, "weight", item.weight)}
              ${textInput(fields, lang, "dimensions", item.dimensions)}
              ${textAreaInput(fields, lang, "package_contents", item.package_contents, "col-md-12", 2)}
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function byName(modalEl, name) {
  return modalEl.querySelector(`[name='${name}']`);
}

function readText(modalEl, name, emptyAsNull = true) {
  const el = byName(modalEl, name);
  if (!el) return undefined;
  const val = String(el.value || "").trim();
  if (!val) return emptyAsNull ? null : "";
  return val;
}

function readId(modalEl, name) {
  const raw = readText(modalEl, name);
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : raw;
}

function readNumber(modalEl, name, fallback = 0, nullable = false, integer = false) {
  const el = byName(modalEl, name);
  if (!el) return undefined;
  const raw = String(el.value || "").trim();
  if (!raw) return nullable ? null : fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  if (integer) return Number.isInteger(n) ? n : raw;
  return n;
}

function readSwitch(modalEl, name) {
  const el = byName(modalEl, name);
  if (!el) return undefined;
  return el.checked ? 1 : 0;
}

function readForm(modalEl, draft = {}) {
  const payload = {
    category_id: readId(modalEl, "category_id"),
    unit_id: readId(modalEl, "unit_id"),
    product_type_id: readId(modalEl, "product_type_id"),
    supplier_id: readId(modalEl, "supplier_id"),
    brand_id: readId(modalEl, "brand_id"),
    device_type_id: readId(modalEl, "device_type_id"),
    manufacturer_id: readId(modalEl, "manufacturer_id"),
    country_manufacture_id: readId(modalEl, "country_manufacture_id"),
    country_brand_id: readId(modalEl, "country_brand_id"),
    product_status_id: readId(modalEl, "product_status_id"),
    product_condition_id: readId(modalEl, "product_condition_id"),
    is_active: readSwitch(modalEl, "is_active")
  };

  for (const key of TEXT_KEYS) {
    payload[key] = readText(modalEl, key, key !== "name" && key !== "full_name");
  }
  for (const key of NUM_KEYS) {
    payload[key] = readNumber(modalEl, key, Number(draft?.[key] ?? 0));
  }
  payload.sim_count = readNumber(modalEl, "sim_count", Number(draft?.sim_count ?? 0), true, true);
  payload.lead_time_days = readNumber(modalEl, "lead_time_days", Number(draft?.lead_time_days ?? 0), false, true);
  for (const key of BOOL_KEYS) {
    payload[key] = readSwitch(modalEl, key);
  }

  if (payload.name !== undefined) payload.name = String(payload.name || "").trim();
  if (payload.full_name !== undefined) payload.full_name = String(payload.full_name || "").trim();

  if (payload.name !== undefined && payload.full_name !== undefined) {
    if (!payload.name && payload.full_name) payload.name = payload.full_name;
    if (!payload.full_name && payload.name) payload.full_name = payload.name;
  }

  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function mapSaveError(lang, error) {
  const msg = String(error?.message || error || "");
  if (msg === "Required: name" || msg === "name cannot be empty") return text(lang, "requiredName");
  if (["category_not_found", "category_wrong_business", "category_id must be number"].includes(msg)) return text(lang, "invalidCategory");
  if (["subcategory_not_found", "subcategory_wrong_business", "subcategory_not_child", "subcategory_wrong_parent", "subcategory_id must be number"].includes(msg)) return text(lang, "invalidSubcategory");
  if (["category_not_leaf", "subcategory_not_leaf"].includes(msg)) return text(lang, "selectLeafCategory");
  if (["unit_not_found", "unit_wrong_business", "unit_id must be number"].includes(msg)) return text(lang, "invalidUnit");
  if (["product_type_not_found", "product_type_wrong_business", "product_type_id must be number"].includes(msg)) return text(lang, "invalidProductType");
  if (["supplier_not_found", "supplier_wrong_business", "supplier_not_supplier", "supplier_id must be number"].includes(msg)) return text(lang, "invalidSupplier");
  if ([
    "brand_id must be number",
    "device_type_id must be number",
    "manufacturer_id must be number",
    "country_manufacture_id must be number",
    "country_brand_id must be number",
    "product_status_id must be number",
    "product_condition_id must be number"
  ].includes(msg)) return text(lang, "invalidLookup");
  if (/(brand|device_type|manufacturer|country_manufacture|country_brand|product_status|product_condition)_(not_found|wrong_business|wrong_kind)$/.test(msg)) {
    return text(lang, "invalidLookup");
  }
  if (msg === "sim_count must be integer" || msg === "sim_count must be >= 0") return text(lang, "invalidSimCount");
  if (msg === "lead_time_days must be integer" || msg === "lead_time_days must be >= 0") return text(lang, "invalidLeadTime");
  if (msg === "Code already exists") return text(lang, "duplicateCode");
  if (msg === "SKU already exists") return text(lang, "duplicateSku");
  if (msg === "Barcode already exists") return text(lang, "duplicateBarcode");
  if (msg === "Extra barcode already exists") return text(lang, "duplicateExtraBarcode");
  return msg;
}

function filterItems(items, q, descriptors) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => descriptors.some((d) => String(item?.[d.key] || "").toLowerCase().includes(needle)));
}

function desktopTableHtml(items, lang, canWrite, fields) {
  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              ${(visible(fields, "name", "list") || visible(fields, "full_name", "list")) ? `<th>${fieldLabel(fields, lang, "name")}</th>` : ""}
              ${visible(fields, "category_id", "list") ? `<th style="width:220px">${fieldLabel(fields, lang, "category_id")}</th>` : ""}
              ${visible(fields, "unit_id", "list") ? `<th style="width:120px">${fieldLabel(fields, lang, "unit_id")}</th>` : ""}
              ${visible(fields, "supplier_id", "list") ? `<th style="width:180px">${fieldLabel(fields, lang, "supplier_id")}</th>` : ""}
              ${(visible(fields, "product_status_id", "list") || visible(fields, "is_active", "list")) ? `<th style="width:140px">${fieldLabel(fields, lang, "product_status_id", text(lang, "active"))}</th>` : ""}
              ${canWrite ? `<th style="width:160px">${esc(text(lang, "actions"))}</th>` : ""}
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                ${(visible(fields, "name", "list") || visible(fields, "full_name", "list")) ? `
                  <td>
                    <div class="fw-semibold">${esc(item.full_name || item.name || "-")}</div>
                    <div class="small text-muted d-flex flex-wrap gap-2 mt-1">
                      ${visible(fields, "code", "list") && item.code ? `<span>${fieldLabel(fields, lang, "code")}: ${esc(item.code)}</span>` : ""}
                      ${visible(fields, "article", "list") && item.article ? `<span>${fieldLabel(fields, lang, "article")}: ${esc(item.article)}</span>` : ""}
                      ${visible(fields, "sku", "list") && item.sku ? `<span>SKU: ${esc(item.sku)}</span>` : ""}
                    </div>
                  </td>
                ` : ""}
                ${visible(fields, "category_id", "list") ? `<td>${esc(categoryPath(item, lang))}</td>` : ""}
                ${visible(fields, "unit_id", "list") ? `<td>${esc(item.unit_name || text(lang, "noUnit"))}</td>` : ""}
                ${visible(fields, "supplier_id", "list") ? `<td>${esc(item.supplier_name || text(lang, "noSupplier"))}</td>` : ""}
                ${(visible(fields, "product_status_id", "list") || visible(fields, "is_active", "list")) ? `<td>${statusBadgeHtml(lang, item.product_status_name, item.is_active)}</td>` : ""}
                ${canWrite ? `
                  <td>
                    <div class="d-flex gap-2 flex-wrap">
                      <button class="btn btn-sm btn-outline-primary" data-edit-product="${item.id}">${esc(text(lang, "update"))}</button>
                      ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-product="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
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
  return `
    <div class="d-lg-none">
      ${items.map((item) => `
        <div class="card mb-2 shadow-sm entity-mobile-card">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                ${(visible(fields, "name", "card") || visible(fields, "full_name", "card")) ? `<div class="fw-semibold">${esc(item.full_name || item.name || "-")}</div>` : ""}
                ${visible(fields, "category_id", "card") ? `<div class="small text-muted mt-1">${esc(categoryPath(item, lang))}</div>` : ""}
              </div>
              ${(visible(fields, "product_status_id", "card") || visible(fields, "is_active", "card")) ? statusBadgeHtml(lang, item.product_status_name, item.is_active) : ""}
            </div>
            ${visible(fields, "track_serial", "card") ? `<div class="small text-muted">${fieldLabel(fields, lang, "track_serial")}: ${ynBadge(item.track_serial, { yes: text(lang, "yes"), no: text(lang, "no") })}</div>` : ""}
            ${canWrite ? `
              <div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3">
                <button class="btn btn-sm btn-outline-primary" data-edit-product="${item.id}">${esc(text(lang, "update"))}</button>
                ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-product="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
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

function bindModalBehavior(modalEl) {
  const root = modalEl.querySelector("[data-product-form]");
  if (!root) return;

  const lang = langOf();

  const advBtn = root.querySelector("[data-product-advanced-toggle]");
  const advBody = root.querySelector("[data-product-advanced-body]");
  const advIcon = root.querySelector("[data-product-advanced-icon]");
  const advLabel = root.querySelector("[data-product-advanced-label]");

  if (advBtn && advBody && advIcon && advLabel) {
    advBtn.addEventListener("click", () => {
      const opened = !advBody.classList.contains("d-none");
      advBody.classList.toggle("d-none", opened);
      advBtn.setAttribute("aria-expanded", opened ? "false" : "true");
      advIcon.classList.toggle("bi-chevron-down", opened);
      advIcon.classList.toggle("bi-chevron-up", !opened);
      advLabel.textContent = opened ? text(lang, "advancedOpen") : text(lang, "advancedClose");
    });
  }

}

async function openEntityModal(ctx, item, categories, units, productTypes, suppliers, lookupsByKind, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  const draft = {
    name: "",
    full_name: "",
    is_active: 1,
    complete_set: 1,
    warranty_activated: 0,
    min_stock: 0,
    max_stock: 0,
    lead_time_days: 0,
    product_status_id: null,
    product_condition_id: null,
    ...item
  };

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, draft, categories, units, productTypes, suppliers, lookupsByKind, fields),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl, draft), fields);
      if ((fields.isRequired("name") || fields.isRequired("full_name")) && isEmptyFieldValue(payload.name || payload.full_name)) {
        throw new Error(text(lang, "requiredName"));
      }
      if (!payload.name && payload.full_name) payload.name = payload.full_name;
      if (!payload.full_name && payload.name) payload.full_name = payload.name;

      try {
        if (isCreate) {
          await api("/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await api(`/products/${item.id}`, {
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
    if (modalEl) bindModalBehavior(modalEl);
  }, 0);
}

export async function render(ctx) {
  const { api, page, viewEl, section, state, accessFor } = ctx;
  const lang = langOf();

  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  const perms = accessFor(state.me.role);
  const canWrite = Boolean(perms?.[section.id]?.write);
  const q = viewEl.getAttribute("data-q") || "";

  let respProducts;
  let respCategories;
  let respUnits;
  let respProductTypes;
  let respSuppliers;
  let respLookups;
  let fields;
  try {
    [respProducts, respCategories, respUnits, respProductTypes, respSuppliers, respLookups, fields] = await Promise.all([
      api("/products"),
      api("/product_categories"),
      api("/units"),
      api("/product-types"),
      api("/counterparties?role=supplier"),
      api("/product-lookups"),
      loadEntityFieldAccess(api, "products")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const categories = (respCategories.items || []).map(normalizeCategory);
  const categoryMaps = buildCategoryMaps(categories);
  const allItems = (respProducts.items || []).map(normalizeItem).map((item) => ({
    ...item,
    category_path: categoryPathByLeafId(categoryMaps, leafCategoryId(item))
  }));
  const units = (respUnits.items || []).map(normalizeSimple);
  const productTypes = (respProductTypes.items || []).map(normalizeSimple);
  const suppliers = (respSuppliers.items || []).map(normalizeSimple);
  const lookups = (respLookups.items || []).map(normalizeLookup);
  const lookupsByKind = groupedLookupsByKind(lookups);

  const searchDescriptors = [
    { key: "name", field: "name" },
    { key: "full_name", field: "full_name" },
    { key: "code", field: "code" },
    { key: "article", field: "article" },
    { key: "sku", field: "sku" },
    { key: "barcode", field: "barcode" },
    { key: "extra_barcode", field: "extra_barcode" },
    { key: "serial_number", field: "serial_number" },
    { key: "imei_1", field: "imei_1" },
    { key: "imei_2", field: "imei_2" },
    { key: "mac_address", field: "mac_address" },
    { key: "batch_number", field: "batch_number" },
    { key: "product_condition_name", field: "product_condition_id" },
    { key: "product_status_name", field: "product_status_id" },
    { key: "brand_name", field: "brand_id" },
    { key: "device_type_name", field: "device_type_id" },
    { key: "model", field: "model" },
    { key: "manufacturer_name", field: "manufacturer_id" },
    { key: "country_manufacture_name", field: "country_manufacture_id" },
    { key: "country_brand_name", field: "country_brand_id" },
    { key: "category_path", field: "category_id" },
    { key: "unit_name", field: "unit_id" },
    { key: "supplier_name", field: "supplier_id" }
  ].filter((row) => visible(fields, row.field, "filters"));

  const showSearch = searchDescriptors.length > 0;
  const items = filterItems(allItems, q, searchDescriptors);

  viewEl.innerHTML = `
    <div class="card mb-3 entity-toolbar-card">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          ${showSearch ? `
            <div class="col-12 ${canWrite ? "col-md-8 col-lg-9" : "col-md-12"}">
              <label class="form-label">${esc(text(lang, "search"))}</label>
              <input id="nomenclature_products_q" class="form-control" value="${esc(q)}">
            </div>
          ` : ""}
          ${canWrite ? `
            <div class="col-12 col-md-4 col-lg-3 d-grid">
              <button id="nomenclature_products_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
    ${items.length ? tableHtml(items, lang, canWrite, fields) : emptyHtml(text(lang, "noItems"))}
  `;

  if (showSearch) {
    const qEl = document.getElementById("nomenclature_products_q");
    qEl.addEventListener("input", () => {
      viewEl.setAttribute("data-q", qEl.value.trim());
      queueRerender(viewEl, "__nomenclatureProductsTimer", () => render(ctx), 180);
    });
  } else {
    viewEl.setAttribute("data-q", "");
  }

  if (canWrite) {
    const createBtn = document.getElementById("nomenclature_products_create");
    if (createBtn) {
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, categories, units, productTypes, suppliers, lookupsByKind, fields));
    }

    document.querySelectorAll("[data-edit-product]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editProduct);
        const item = allItems.find((entry) => entry.id === id);
        if (item) openEntityModal(ctx, item, categories, units, productTypes, suppliers, lookupsByKind, fields);
      });
    });

    if (fields.isEnabled("is_active")) {
      document.querySelectorAll("[data-toggle-product]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = Number(btn.dataset.toggleProduct);
          const next = Number(btn.dataset.next);
          await api(`/products/${id}`, {
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
