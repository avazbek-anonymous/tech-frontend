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
    name: "Название",
    category: "Категория",
    unit: "Ед.изм",
    vatRate: "НДС, %",
    priceRetail: "Розница",
    priceWholesale: "Опт",
    serial: "Серийный учет",
    imei: "IMEI учет",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    yes: "Да",
    no: "Нет",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название товара",
    invalidCategory: "Выбрана некорректная категория",
    invalidUnit: "Выбрана некорректная единица измерения",
    topLevel: "Без категории"
  },
  uz: {
    title: "Nomenklatura: Tovarlar",
    subtitle: "Sotuv va ombor operatsiyalari uchun tovarlar katalogi",
    search: "Qidiruv",
    create: "Tovar qo'shish",
    edit: "Tovarni tahrirlash",
    noItems: "Tovarlar topilmadi",
    name: "Nomi",
    category: "Kategoriya",
    unit: "O'lchov",
    vatRate: "QQS, %",
    priceRetail: "Chakana",
    priceWholesale: "Ulgurji",
    serial: "Seriya hisobi",
    imei: "IMEI hisobi",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    yes: "Ha",
    no: "Yo'q",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Tovar nomini kiriting",
    invalidCategory: "Noto'g'ri kategoriya tanlandi",
    invalidUnit: "Noto'g'ri o'lchov birligi tanlandi",
    topLevel: "Kategoriyasiz"
  },
  en: {
    title: "Nomenclature: Products",
    subtitle: "Products catalog for sales and warehouse operations",
    search: "Search",
    create: "Add product",
    edit: "Edit product",
    noItems: "No products found",
    name: "Name",
    category: "Category",
    unit: "Unit",
    vatRate: "VAT, %",
    priceRetail: "Retail",
    priceWholesale: "Wholesale",
    serial: "Serial tracking",
    imei: "IMEI tracking",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    save: "Save",
    update: "Update",
    requiredName: "Product name is required",
    invalidCategory: "Invalid category selected",
    invalidUnit: "Invalid unit selected",
    topLevel: "No category"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function formatNumber(lang, value) {
  const locale = lang === "uz" ? "uz-UZ" : (lang === "en" ? "en-US" : "ru-RU");
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value || 0));
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    category_id: item?.category_id ? Number(item.category_id) : null,
    unit_id: item?.unit_id ? Number(item.unit_id) : null,
    name: String(item?.name || ""),
    category_name: String(item?.category_name || ""),
    unit_name: String(item?.unit_name || ""),
    sku: String(item?.sku || ""),
    barcode: String(item?.barcode || ""),
    vat_rate: Number(item?.vat_rate || 0),
    price_retail: Number(item?.price_retail || 0),
    price_wholesale: Number(item?.price_wholesale || 0),
    track_serial: Number(item?.track_serial || 0),
    track_imei: Number(item?.track_imei || 0),
    is_active: Number(item?.is_active || 0)
  };
}

function normalizeCategory(item) {
  return {
    id: Number(item?.id || 0),
    name: String(item?.name || "")
  };
}

function normalizeUnit(item) {
  return {
    id: Number(item?.id || 0),
    name: String(item?.name || "")
  };
}

function filterItems(items, q, filterableFields) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  const fields = (filterableFields || []).length
    ? filterableFields
    : ["name", "category_name", "unit_name", "sku", "barcode"];
  return items.filter(item => fields.some((key) => String(item?.[key] || "").toLowerCase().includes(needle)));
}

function mapSaveError(lang, error) {
  const msg = String(error?.message || error || "");
  if (msg === "Required: name" || msg === "name cannot be empty") return text(lang, "requiredName");
  if (msg === "category_not_found" || msg === "category_wrong_business" || msg === "category_id must be number") return text(lang, "invalidCategory");
  if (msg === "unit_not_found" || msg === "unit_wrong_business" || msg === "unit_id must be number") return text(lang, "invalidUnit");
  return msg;
}

function categoryOptionsHtml(lang, categories, selectedId) {
  return `
    <option value="">${esc(text(lang, "topLevel"))}</option>
    ${categories.map(cat => `<option value="${cat.id}" ${Number(selectedId) === Number(cat.id) ? "selected" : ""}>${esc(cat.name)}</option>`).join("")}
  `;
}

function unitOptionsHtml(units, selectedId) {
  return `
    <option value=""></option>
    ${units.map(unit => `<option value="${unit.id}" ${Number(selectedId) === Number(unit.id) ? "selected" : ""}>${esc(unit.name)}</option>`).join("")}
  `;
}

function modalHtml(lang, item, categories, units, fields) {
  return `
    <div class="row g-3">
      ${fields.showInForm("name") ? `
        <div class="col-md-8">
          <label class="form-label">${esc(text(lang, "name"))}</label>
          <input class="form-control" name="name" value="${esc(item?.name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("unit_id") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "unit"))}</label>
          <select class="form-select" name="unit_id">
            ${unitOptionsHtml(units, item?.unit_id || null)}
          </select>
        </div>
      ` : ""}
      ${fields.showInForm("category_id") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "category"))}</label>
          <select class="form-select" name="category_id">
            ${categoryOptionsHtml(lang, categories, item?.category_id || null)}
          </select>
        </div>
      ` : ""}
      ${fields.showInForm("sku") ? `
        <div class="col-md-3">
          <label class="form-label">SKU</label>
          <input class="form-control" name="sku" value="${esc(item?.sku || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("barcode") ? `
        <div class="col-md-3">
          <label class="form-label">Barcode</label>
          <input class="form-control" name="barcode" value="${esc(item?.barcode || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("vat_rate") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "vatRate"))}</label>
          <input class="form-control" name="vat_rate" type="number" min="0" step="0.01" value="${esc(item?.vat_rate ?? 0)}">
        </div>
      ` : ""}
      ${fields.showInForm("price_retail") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "priceRetail"))}</label>
          <input class="form-control" name="price_retail" type="number" min="0" step="0.01" value="${esc(item?.price_retail ?? 0)}">
        </div>
      ` : ""}
      ${fields.showInForm("price_wholesale") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "priceWholesale"))}</label>
          <input class="form-control" name="price_wholesale" type="number" min="0" step="0.01" value="${esc(item?.price_wholesale ?? 0)}">
        </div>
      ` : ""}
      ${fields.showInForm("track_serial") ? `
        <div class="col-md-6">
          <div class="form-check form-switch mt-md-4 pt-md-2">
            <input class="form-check-input" type="checkbox" role="switch" name="track_serial" ${Number(item?.track_serial || 0) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "serial"))}</label>
          </div>
        </div>
      ` : ""}
      ${fields.showInForm("track_imei") ? `
        <div class="col-md-6">
          <div class="form-check form-switch mt-md-4 pt-md-2">
            <input class="form-check-input" type="checkbox" role="switch" name="track_imei" ${Number(item?.track_imei || 0) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "imei"))}</label>
          </div>
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

function readForm(modalEl) {
  const byName = (name) => modalEl.querySelector(`[name='${name}']`);
  const readText = (name) => String(byName(name)?.value || "").trim();
  const categoryRaw = readText("category_id");
  const unitRaw = readText("unit_id");

  return {
    name: readText("name"),
    category_id: categoryRaw ? Number(categoryRaw) : null,
    unit_id: unitRaw ? Number(unitRaw) : null,
    sku: readText("sku") || null,
    barcode: readText("barcode") || null,
    vat_rate: Number(byName("vat_rate")?.value || 0),
    price_retail: Number(byName("price_retail")?.value || 0),
    price_wholesale: Number(byName("price_wholesale")?.value || 0),
    track_serial: byName("track_serial")?.checked ? 1 : 0,
    track_imei: byName("track_imei")?.checked ? 1 : 0,
    is_active: byName("is_active")?.checked ? 1 : 0
  };
}

function desktopTableHtml(items, lang, canWrite, fields) {
  const labels = {
    active: text(lang, "active"),
    inactive: text(lang, "inactive"),
    yes: text(lang, "yes"),
    no: text(lang, "no")
  };

  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              ${fields.showInList("name") ? `<th>${esc(text(lang, "name"))}</th>` : ""}
              ${fields.showInList("category_id") ? `<th style="width:180px">${esc(text(lang, "category"))}</th>` : ""}
              ${fields.showInList("unit_id") ? `<th style="width:100px">${esc(text(lang, "unit"))}</th>` : ""}
              ${fields.showInList("sku") ? `<th style="width:120px">SKU</th>` : ""}
              ${fields.showInList("barcode") ? `<th style="width:130px">Barcode</th>` : ""}
              ${fields.showInList("vat_rate") ? `<th style="width:95px">${esc(text(lang, "vatRate"))}</th>` : ""}
              ${fields.showInList("price_retail") ? `<th style="width:120px">${esc(text(lang, "priceRetail"))}</th>` : ""}
              ${fields.showInList("price_wholesale") ? `<th style="width:120px">${esc(text(lang, "priceWholesale"))}</th>` : ""}
              ${fields.showInList("track_serial") ? `<th style="width:100px">${esc(text(lang, "serial"))}</th>` : ""}
              ${fields.showInList("track_imei") ? `<th style="width:95px">${esc(text(lang, "imei"))}</th>` : ""}
              ${fields.showInList("is_active") ? `<th style="width:110px">${esc(text(lang, "status"))}</th>` : ""}
              ${canWrite ? `<th style="width:160px">${esc(text(lang, "actions"))}</th>` : ""}
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                ${fields.showInList("name") ? `<td class="fw-semibold">${esc(item.name)}</td>` : ""}
                ${fields.showInList("category_id") ? `<td>${esc(item.category_name || text(lang, "topLevel"))}</td>` : ""}
                ${fields.showInList("unit_id") ? `<td>${esc(item.unit_name || "-")}</td>` : ""}
                ${fields.showInList("sku") ? `<td>${esc(item.sku || "-")}</td>` : ""}
                ${fields.showInList("barcode") ? `<td>${esc(item.barcode || "-")}</td>` : ""}
                ${fields.showInList("vat_rate") ? `<td>${esc(formatNumber(lang, item.vat_rate))}</td>` : ""}
                ${fields.showInList("price_retail") ? `<td>${esc(formatNumber(lang, item.price_retail))}</td>` : ""}
                ${fields.showInList("price_wholesale") ? `<td>${esc(formatNumber(lang, item.price_wholesale))}</td>` : ""}
                ${fields.showInList("track_serial") ? `<td>${ynBadge(item.track_serial, labels)}</td>` : ""}
                ${fields.showInList("track_imei") ? `<td>${ynBadge(item.track_imei, labels)}</td>` : ""}
                ${fields.showInList("is_active") ? `<td>${activeBadge(item.is_active, labels)}</td>` : ""}
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
  const labels = {
    active: text(lang, "active"),
    inactive: text(lang, "inactive"),
    yes: text(lang, "yes"),
    no: text(lang, "no")
  };

  return `
    <div class="d-lg-none">
      ${items.map(item => `
        <div class="card mb-2 shadow-sm entity-mobile-card">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                ${fields.showInCard("name") ? `<div class="fw-semibold">${esc(item.name)}</div>` : ""}
                ${fields.showInCard("category_id") ? `<div class="small text-muted mt-1">${esc(text(lang, "category"))}: ${esc(item.category_name || text(lang, "topLevel"))}</div>` : ""}
              </div>
              ${fields.showInCard("is_active") ? activeBadge(item.is_active, labels) : ""}
            </div>
            ${fields.showInCard("unit_id") ? `<div class="small text-muted mt-2">${esc(text(lang, "unit"))}: ${esc(item.unit_name || "-")}</div>` : ""}
            ${fields.showInCard("sku") ? `<div class="small text-muted">SKU: ${esc(item.sku || "-")}</div>` : ""}
            ${fields.showInCard("barcode") ? `<div class="small text-muted">Barcode: ${esc(item.barcode || "-")}</div>` : ""}
            ${fields.showInCard("vat_rate") ? `<div class="small text-muted">${esc(text(lang, "vatRate"))}: ${esc(formatNumber(lang, item.vat_rate))}</div>` : ""}
            ${fields.showInCard("price_retail") ? `<div class="small text-muted">${esc(text(lang, "priceRetail"))}: ${esc(formatNumber(lang, item.price_retail))}</div>` : ""}
            ${fields.showInCard("price_wholesale") ? `<div class="small text-muted">${esc(text(lang, "priceWholesale"))}: ${esc(formatNumber(lang, item.price_wholesale))}</div>` : ""}
            ${fields.showInCard("track_serial") ? `<div class="small text-muted">${esc(text(lang, "serial"))}: ${item.track_serial ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>` : ""}
            ${fields.showInCard("track_imei") ? `<div class="small text-muted">${esc(text(lang, "imei"))}: ${item.track_imei ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>` : ""}
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

async function openEntityModal(ctx, item, categories, units, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item, categories, units, fields),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl), fields);
      if (fields.isRequired("name") && isEmptyFieldValue(payload.name)) throw new Error(text(lang, "requiredName"));

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
  let fields;
  try {
    [respProducts, respCategories, respUnits, fields] = await Promise.all([
      api("/products"),
      api("/product_categories"),
      api("/units"),
      loadEntityFieldAccess(api, "products")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (respProducts.items || []).map(normalizeItem);
  const categories = (respCategories.items || []).map(normalizeCategory);
  const units = (respUnits.items || []).map(normalizeUnit);
  const showSearch = ["name", "category_name", "unit_name", "sku", "barcode"].some((key) => fields.showInFilters(key));
  const filterableFields = ["name", "category_name", "unit_name", "sku", "barcode"].filter((key) => fields.showInFilters(key));
  const items = filterItems(allItems, q, filterableFields);

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
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, categories, units, fields));
    }

    document.querySelectorAll("[data-edit-product]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editProduct);
        const item = allItems.find(entry => entry.id === id);
        if (item) openEntityModal(ctx, item, categories, units, fields);
      });
    });

    if (fields.isEnabled("is_active")) {
      document.querySelectorAll("[data-toggle-product]").forEach(btn => {
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
