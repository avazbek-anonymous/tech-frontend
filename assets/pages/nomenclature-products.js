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
    requiredName: "Укажите наименование товара",
    invalidCategory: "Выбрана некорректная категория",
    invalidSubcategory: "Выбрана некорректная подкатегория",
    selectLeafCategory: "Выберите конечную категорию без вложенных подкатегорий",
    invalidUnit: "Выбрана некорректная единица измерения",
    invalidProductType: "Выбран некорректный тип товара",
    invalidSupplier: "Выбран некорректный поставщик",
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
    requiredName: "Tovar nomini kiriting",
    invalidCategory: "Noto'g'ri kategoriya tanlandi",
    invalidSubcategory: "Noto'g'ri quyi kategoriya tanlandi",
    selectLeafCategory: "Ichki bo'limsiz yakuniy kategoriya tanlang",
    invalidUnit: "Noto'g'ri o'lchov birligi tanlandi",
    invalidProductType: "Noto'g'ri tovar turi tanlandi",
    invalidSupplier: "Noto'g'ri ta'minotchi tanlandi",
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
    requiredName: "Product name is required",
    invalidCategory: "Invalid category selected",
    invalidSubcategory: "Invalid subcategory selected",
    selectLeafCategory: "Select a final category without nested subcategories",
    invalidUnit: "Invalid unit selected",
    invalidProductType: "Invalid product type selected",
    invalidSupplier: "Invalid supplier selected",
    duplicateCode: "Product code already exists",
    duplicateSku: "Product SKU already exists",
    duplicateBarcode: "Product barcode already exists",
    duplicateExtraBarcode: "Product extra barcode already exists"
  }
};

const TEXT_KEYS = [
  "name", "full_name", "code", "article", "sku", "barcode", "extra_barcode",
  "brand", "model", "series", "device_type", "manufacturer", "country_manufacture",
  "country_brand", "description", "image_url", "warranty", "exchange_return_term",
  "serial_number", "imei_1", "imei_2", "mac_address", "batch_number", "production_date",
  "product_condition", "warranty_start_date", "warranty_end_date",
  "color", "memory_capacity", "ram", "cpu", "gpu", "screen_size", "screen_resolution",
  "screen_type", "refresh_rate", "battery_capacity", "operating_system", "network_standard",
  "wifi", "bluetooth", "main_camera", "front_camera", "ports", "package_contents", "weight", "dimensions"
];

const NUM_KEYS = [
  "vat_rate", "price_retail", "price_wholesale", "purchase_price_default",
  "min_sale_price", "recommended_sale_price", "min_stock", "max_stock"
];

const BOOL_KEYS = [
  "track_serial", "track_imei", "track_imei2", "track_batches", "is_commission",
  "complete_set", "warranty_activated", "esim_support", "nfc"
];

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

function formatNumber(lang, value) {
  const locale = lang === "uz" ? "uz-UZ" : (lang === "en" ? "en-US" : "ru-RU");
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value || 0));
}

function normalizeItem(item) {
  const out = {
    id: Number(item?.id || 0),
    category_id: item?.category_id ? Number(item.category_id) : null,
    subcategory_id: item?.subcategory_id ? Number(item.subcategory_id) : null,
    unit_id: item?.unit_id ? Number(item.unit_id) : null,
    product_type_id: item?.product_type_id ? Number(item.product_type_id) : null,
    supplier_id: item?.supplier_id ? Number(item.supplier_id) : null,
    product_status: String(item?.product_status || (Number(item?.is_active || 0) === 1 ? "active" : "inactive")),
    is_active: Number(item?.is_active || 0),
    sim_count: item?.sim_count === null || item?.sim_count === undefined || item?.sim_count === "" ? null : Number(item?.sim_count),
    lead_time_days: Number(item?.lead_time_days || 0),
    vat_rate: Number(item?.vat_rate || 0),
    price_retail: Number(item?.price_retail || 0),
    price_wholesale: Number(item?.price_wholesale || 0),
    purchase_price_default: Number(item?.purchase_price_default || 0),
    min_sale_price: Number(item?.min_sale_price || 0),
    recommended_sale_price: Number(item?.recommended_sale_price || 0),
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
  return { byId, byParent, roots: byParent.get(null) || [] };
}

function resolveCategoryPair(item, byId) {
  const categoryId = item?.category_id ? Number(item.category_id) : null;
  const subcategoryId = item?.subcategory_id ? Number(item.subcategory_id) : null;

  if (subcategoryId) {
    return { category_id: categoryId, subcategory_id: subcategoryId };
  }
  if (!categoryId) {
    return { category_id: null, subcategory_id: null };
  }

  const cat = byId.get(categoryId);
  if (cat && cat.parent_id) {
    return { category_id: Number(cat.parent_id), subcategory_id: categoryId };
  }

  return { category_id: categoryId, subcategory_id: null };
}

function categoryPath(item, lang) {
  if (item.subcategory_name) {
    return `${item.category_name || text(lang, "topLevel")} / ${item.subcategory_name}`;
  }
  return item.category_name || text(lang, "topLevel");
}

function statusBadgeHtml(lang, statusValue, isActive) {
  const status = String(statusValue || "").toLowerCase();
  const label = status === "discontinued"
    ? text(lang, "discontinued")
    : status === "archived"
      ? text(lang, "archived")
      : status === "inactive"
        ? text(lang, "inactive")
        : text(lang, "active");

  if (status === "discontinued") return `<span class="badge text-bg-warning-subtle border border-warning-subtle">${esc(label)}</span>`;
  if (status === "archived") return `<span class="badge text-bg-dark">${esc(label)}</span>`;
  return activeBadge(Number(isActive || 0), { active: text(lang, "active"), inactive: text(lang, "inactive") });
}

function categoryOptionsHtml(lang, maps, selectedId) {
  return `
    <option value="">${esc(text(lang, "topLevel"))}</option>
    ${sortByName(maps.roots).map((row) => optionHtml(row.id, selectedId, row.name)).join("")}
  `;
}

function subcategoryOptionsHtml(lang, maps, categoryId, selectedId) {
  const parentId = categoryId ? Number(categoryId) : null;
  return `
    <option value="">${esc(text(lang, "noSubcategory"))}</option>
    ${sortByName(maps.byParent.get(parentId) || []).map((row) => optionHtml(row.id, selectedId, row.name)).join("")}
  `;
}

function simpleOptionsHtml(list, selectedId, emptyText) {
  return `
    <option value="">${esc(emptyText)}</option>
    ${sortByName(list).map((row) => optionHtml(row.id, selectedId, row.name)).join("")}
  `;
}

function statusOptionsHtml(lang, selectedStatus, isActive) {
  const status = String(selectedStatus || "") || (Number(isActive || 0) === 1 ? "active" : "inactive");
  return [
    optionHtml("active", status, text(lang, "active")),
    optionHtml("inactive", status, text(lang, "inactive")),
    optionHtml("discontinued", status, text(lang, "discontinued")),
    optionHtml("archived", status, text(lang, "archived"))
  ].join("");
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

function modalHtml(lang, draft, categories, units, productTypes, suppliers, fields) {
  const maps = buildCategoryMaps(categories);
  const pair = resolveCategoryPair(draft, maps.byId);
  const item = { ...draft, category_id: pair.category_id, subcategory_id: pair.subcategory_id };
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
                ${categoryOptionsHtml(lang, maps, item.category_id)}
              </select>
            </div>
          ` : ""}

          ${visible(fields, "subcategory_id", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "subcategory_id")}</label>
              <select class="form-select" name="subcategory_id" data-product-subcategory>
                ${subcategoryOptionsHtml(lang, maps, item.category_id, item.subcategory_id)}
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

          ${textInput(fields, lang, "brand", item.brand, "col-md-4")}
          ${textInput(fields, lang, "model", item.model, "col-md-4")}
          ${textInput(fields, lang, "series", item.series, "col-md-4")}
          ${textInput(fields, lang, "device_type", item.device_type, "col-md-4")}
          ${textInput(fields, lang, "barcode", item.barcode, "col-md-4")}
          ${textInput(fields, lang, "extra_barcode", item.extra_barcode, "col-md-4")}
          ${textInput(fields, lang, "manufacturer", item.manufacturer, "col-md-4")}
          ${textInput(fields, lang, "country_manufacture", item.country_manufacture, "col-md-4")}
          ${textInput(fields, lang, "country_brand", item.country_brand, "col-md-4")}
          ${textInput(fields, lang, "image_url", item.image_url, "col-md-6")}
          ${textAreaInput(fields, lang, "description", item.description, "col-md-6", 2)}

          ${visible(fields, "product_status", "form") ? `
            <div class="col-md-4">
              <label class="form-label">${fieldLabel(fields, lang, "product_status")}</label>
              <select class="form-select" name="product_status">${statusOptionsHtml(lang, item.product_status, item.is_active)}</select>
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

          ${numberInput(fields, lang, "purchase_price_default", item.purchase_price_default, "col-md-3")}
          ${numberInput(fields, lang, "price_retail", item.price_retail, "col-md-3")}
          ${numberInput(fields, lang, "price_wholesale", item.price_wholesale, "col-md-3")}
          ${numberInput(fields, lang, "min_sale_price", item.min_sale_price, "col-md-3")}
          ${numberInput(fields, lang, "recommended_sale_price", item.recommended_sale_price, "col-md-3")}
          ${numberInput(fields, lang, "vat_rate", item.vat_rate, "col-md-3")}
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
          ${textInput(fields, lang, "product_condition", item.product_condition, "col-md-4")}
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
    subcategory_id: readId(modalEl, "subcategory_id"),
    unit_id: readId(modalEl, "unit_id"),
    product_type_id: readId(modalEl, "product_type_id"),
    supplier_id: readId(modalEl, "supplier_id"),
    product_status: readText(modalEl, "product_status"),
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
              ${(visible(fields, "category_id", "list") || visible(fields, "subcategory_id", "list")) ? `<th style="width:220px">${fieldLabel(fields, lang, "category_id")}</th>` : ""}
              ${visible(fields, "unit_id", "list") ? `<th style="width:120px">${fieldLabel(fields, lang, "unit_id")}</th>` : ""}
              ${visible(fields, "supplier_id", "list") ? `<th style="width:180px">${fieldLabel(fields, lang, "supplier_id")}</th>` : ""}
              ${visible(fields, "price_retail", "list") ? `<th style="width:120px">${fieldLabel(fields, lang, "price_retail")}</th>` : ""}
              ${visible(fields, "price_wholesale", "list") ? `<th style="width:120px">${fieldLabel(fields, lang, "price_wholesale")}</th>` : ""}
              ${(visible(fields, "product_status", "list") || visible(fields, "is_active", "list")) ? `<th style="width:140px">${fieldLabel(fields, lang, "product_status", text(lang, "active"))}</th>` : ""}
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
                ${(visible(fields, "category_id", "list") || visible(fields, "subcategory_id", "list")) ? `<td>${esc(categoryPath(item, lang))}</td>` : ""}
                ${visible(fields, "unit_id", "list") ? `<td>${esc(item.unit_name || text(lang, "noUnit"))}</td>` : ""}
                ${visible(fields, "supplier_id", "list") ? `<td>${esc(item.supplier_name || text(lang, "noSupplier"))}</td>` : ""}
                ${visible(fields, "price_retail", "list") ? `<td>${esc(formatNumber(lang, item.price_retail))}</td>` : ""}
                ${visible(fields, "price_wholesale", "list") ? `<td>${esc(formatNumber(lang, item.price_wholesale))}</td>` : ""}
                ${(visible(fields, "product_status", "list") || visible(fields, "is_active", "list")) ? `<td>${statusBadgeHtml(lang, item.product_status, item.is_active)}</td>` : ""}
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
                ${(visible(fields, "category_id", "card") || visible(fields, "subcategory_id", "card")) ? `<div class="small text-muted mt-1">${esc(categoryPath(item, lang))}</div>` : ""}
              </div>
              ${(visible(fields, "product_status", "card") || visible(fields, "is_active", "card")) ? statusBadgeHtml(lang, item.product_status, item.is_active) : ""}
            </div>
            ${visible(fields, "price_retail", "card") ? `<div class="small text-muted mt-2">${fieldLabel(fields, lang, "price_retail")}: ${esc(formatNumber(lang, item.price_retail))}</div>` : ""}
            ${visible(fields, "price_wholesale", "card") ? `<div class="small text-muted">${fieldLabel(fields, lang, "price_wholesale")}: ${esc(formatNumber(lang, item.price_wholesale))}</div>` : ""}
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

function bindModalBehavior(modalEl, categories) {
  const root = modalEl.querySelector("[data-product-form]");
  if (!root) return;

  const lang = langOf();
  const maps = buildCategoryMaps(categories);

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

  const categoryEl = root.querySelector("[data-product-category]");
  const subcategoryEl = root.querySelector("[data-product-subcategory]");
  if (categoryEl && subcategoryEl) {
    const syncSubcategories = () => {
      const selectedParent = categoryEl.value ? Number(categoryEl.value) : null;
      const selectedSub = subcategoryEl.value ? Number(subcategoryEl.value) : null;
      subcategoryEl.innerHTML = subcategoryOptionsHtml(lang, maps, selectedParent, selectedSub);
    };
    categoryEl.addEventListener("change", syncSubcategories);
    syncSubcategories();
  }
}

async function openEntityModal(ctx, item, categories, units, productTypes, suppliers, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  const draft = {
    name: "",
    full_name: "",
    product_status: "active",
    is_active: 1,
    complete_set: 1,
    warranty_activated: 0,
    vat_rate: 0,
    price_retail: 0,
    price_wholesale: 0,
    purchase_price_default: 0,
    min_sale_price: 0,
    recommended_sale_price: 0,
    min_stock: 0,
    max_stock: 0,
    lead_time_days: 0,
    ...item
  };

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, draft, categories, units, productTypes, suppliers, fields),
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
    if (modalEl) bindModalBehavior(modalEl, categories);
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
  let fields;
  try {
    [respProducts, respCategories, respUnits, respProductTypes, respSuppliers, fields] = await Promise.all([
      api("/products"),
      api("/product_categories"),
      api("/units"),
      api("/product-types"),
      api("/counterparties?role=supplier"),
      loadEntityFieldAccess(api, "products")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (respProducts.items || []).map(normalizeItem);
  const categories = (respCategories.items || []).map(normalizeCategory);
  const units = (respUnits.items || []).map(normalizeSimple);
  const productTypes = (respProductTypes.items || []).map(normalizeSimple);
  const suppliers = (respSuppliers.items || []).map(normalizeSimple);

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
    { key: "product_condition", field: "product_condition" },
    { key: "brand", field: "brand" },
    { key: "model", field: "model" },
    { key: "manufacturer", field: "manufacturer" },
    { key: "category_name", field: "category_id" },
    { key: "subcategory_name", field: "subcategory_id" },
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
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, categories, units, productTypes, suppliers, fields));
    }

    document.querySelectorAll("[data-edit-product]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editProduct);
        const item = allItems.find((entry) => entry.id === id);
        if (item) openEntityModal(ctx, item, categories, units, productTypes, suppliers, fields);
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
