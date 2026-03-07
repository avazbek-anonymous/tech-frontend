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
  stripDisabledFields,
  ynBadge
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки: Склады",
    subtitle: "Склады по филиалам и склад по умолчанию",
    noAccess: "Раздел складов доступен только владельцу бизнеса",
    search: "Поиск",
    create: "Создать склад",
    edit: "Редактировать склад",
    noItems: "Склады не найдены",
    noFilials: "Сначала создайте хотя бы один филиал",
    filial: "Филиал",
    allFilials: "Все филиалы",
    name: "Название",
    code: "Код",
    address: "Адрес",
    comment: "Комментарий",
    sellable: "Для продаж",
    isDefault: "По умолчанию",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    yes: "Да",
    no: "Нет",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название склада",
    requiredFilial: "Выберите филиал"
  },
  uz: {
    title: "Sozlamalar: Omborlar",
    subtitle: "Filiallar bo'yicha omborlar va standart ombor",
    noAccess: "Omborlar bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    create: "Ombor yaratish",
    edit: "Omborni tahrirlash",
    noItems: "Omborlar topilmadi",
    noFilials: "Avval kamida bitta filial yarating",
    filial: "Filial",
    allFilials: "Barcha filiallar",
    name: "Nomi",
    code: "Kod",
    address: "Manzil",
    comment: "Izoh",
    sellable: "Savdo uchun",
    isDefault: "Standart",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    yes: "Ha",
    no: "Yo'q",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Ombor nomini kiriting",
    requiredFilial: "Filialni tanlang"
  },
  en: {
    title: "Settings: Warehouses",
    subtitle: "Warehouses by branch and default warehouse",
    noAccess: "Warehouses settings are available only to the business owner",
    search: "Search",
    create: "Create warehouse",
    edit: "Edit warehouse",
    noItems: "No warehouses found",
    noFilials: "Create at least one branch first",
    filial: "Branch",
    allFilials: "All branches",
    name: "Name",
    code: "Code",
    address: "Address",
    comment: "Comment",
    sellable: "Sellable",
    isDefault: "Default",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    save: "Save",
    update: "Update",
    requiredName: "Warehouse name is required",
    requiredFilial: "Select a branch"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    filial_id: Number(item?.filial_id || 0),
    name: String(item?.name || ""),
    code: String(item?.code || ""),
    address: String(item?.address || ""),
    comment: String(item?.comment || ""),
    sellable: Number(item?.sellable ?? 1),
    is_default: Number(item?.is_default || 0),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q, filialId, filterableFields) {
  const needle = String(q || "").trim().toLowerCase();
  const keys = (filterableFields || []).length ? filterableFields : ["name"];
  return items.filter(item => {
    if (filialId && Number(item.filial_id) !== Number(filialId)) return false;
    if (!needle) return true;
    return keys.some(key => String(item?.[key] || "").toLowerCase().includes(needle));
  });
}

function modalHtml(lang, item, filials, fields) {
  return `
    <div class="row g-3">
      ${fields.showInForm("filial_id") ? `
        <div class="col-12">
          <label class="form-label">${esc(text(lang, "filial"))}</label>
          <select class="form-select" name="filial_id">
            <option value="">-</option>
            ${filials.map(filial => `<option value="${filial.id}" ${Number(item?.filial_id || 0) === Number(filial.id) ? "selected" : ""}>${esc(filial.name)}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      ${fields.showInForm("name") ? `
        <div class="col-md-8">
          <label class="form-label">${esc(text(lang, "name"))}</label>
          <input class="form-control" name="name" value="${esc(item?.name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("code") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "code"))}</label>
          <input class="form-control" name="code" value="${esc(item?.code || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("address") ? `
        <div class="col-12">
          <label class="form-label">${esc(text(lang, "address"))}</label>
          <input class="form-control" name="address" value="${esc(item?.address || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("comment") ? `
        <div class="col-12">
          <label class="form-label">${esc(text(lang, "comment"))}</label>
          <textarea class="form-control" name="comment" rows="2">${esc(item?.comment || "")}</textarea>
        </div>
      ` : ""}
      ${fields.showInForm("sellable") ? `
        <div class="col-md-4">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" name="sellable" ${Number(item?.sellable ?? 1) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "sellable"))}</label>
          </div>
        </div>
      ` : ""}
      ${fields.showInForm("is_default") ? `
        <div class="col-md-4">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" name="is_default" ${Number(item?.is_default || 0) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "isDefault"))}</label>
          </div>
        </div>
      ` : ""}
      ${fields.showInForm("is_active") ? `
        <div class="col-md-4">
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
  return {
    filial_id: Number(byName("filial_id")?.value || 0),
    name: readText("name"),
    code: readText("code") || null,
    address: readText("address") || null,
    comment: readText("comment") || null,
    sellable: byName("sellable")?.checked ? 1 : 0,
    is_default: byName("is_default")?.checked ? 1 : 0,
    is_active: byName("is_active")?.checked ? 1 : 0
  };
}

function tableHtml(items, filials, lang, fields) {
  const filialById = new Map(filials.map(item => [Number(item.id), item.name]));
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
              ${fields.showInList("filial_id") ? `<th style="width:180px">${esc(text(lang, "filial"))}</th>` : ""}
              ${fields.showInList("name") ? `<th>${esc(text(lang, "name"))}</th>` : ""}
              ${fields.showInList("code") ? `<th style="width:110px">${esc(text(lang, "code"))}</th>` : ""}
              ${fields.showInList("sellable") ? `<th style="width:110px">${esc(text(lang, "sellable"))}</th>` : ""}
              ${fields.showInList("is_default") ? `<th style="width:110px">${esc(text(lang, "isDefault"))}</th>` : ""}
              ${fields.showInList("is_active") ? `<th style="width:110px">${esc(text(lang, "status"))}</th>` : ""}
              <th style="width:160px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                ${fields.showInList("filial_id") ? `<td>${esc(filialById.get(Number(item.filial_id)) || "-")}</td>` : ""}
                ${fields.showInList("name") ? `
                  <td>
                    <div class="fw-semibold">${esc(item.name)}</div>
                    ${fields.showInCard("address") ? `<div class="text-muted small">${esc(item.address || "-")}</div>` : ""}
                  </td>
                ` : ""}
                ${fields.showInList("code") ? `<td>${esc(item.code || "-")}</td>` : ""}
                ${fields.showInList("sellable") ? `<td>${ynBadge(item.sellable, labels)}</td>` : ""}
                ${fields.showInList("is_default") ? `<td>${ynBadge(item.is_default, labels)}</td>` : ""}
                ${fields.showInList("is_active") ? `<td>${activeBadge(item.is_active, labels)}</td>` : ""}
                <td>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" data-edit-warehouse="${item.id}">${esc(text(lang, "update"))}</button>
                    ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-warehouse="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="d-lg-none">
      ${items.map(item => `
        <div class="card mb-2 shadow-sm">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                ${fields.showInCard("name") ? `<div class="fw-semibold">${esc(item.name)}</div>` : ""}
                ${fields.showInCard("filial_id") ? `<div class="text-muted small">${esc(filialById.get(Number(item.filial_id)) || "-")}</div>` : ""}
              </div>
              ${fields.showInCard("is_active") ? activeBadge(item.is_active, labels) : ""}
            </div>
            ${fields.showInCard("code") ? `<div class="small text-muted mt-2">${esc(text(lang, "code"))}: ${esc(item.code || "-")}</div>` : ""}
            ${fields.showInCard("sellable") ? `<div class="small text-muted">${esc(text(lang, "sellable"))}: ${item.sellable ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>` : ""}
            ${fields.showInCard("is_default") ? `<div class="small text-muted">${esc(text(lang, "isDefault"))}: ${item.is_default ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>` : ""}
            ${fields.showInCard("address") ? `<div class="small text-muted">${esc(text(lang, "address"))}: ${esc(item.address || "-")}</div>` : ""}
            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-primary" data-edit-warehouse="${item.id}">${esc(text(lang, "update"))}</button>
              ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-warehouse="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

async function openEntityModal(ctx, item, filials, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item, filials, fields),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl), fields);
      if (fields.isRequired("filial_id") && !payload.filial_id) throw new Error(text(lang, "requiredFilial"));
      if (fields.isRequired("name") && isEmptyFieldValue(payload.name)) throw new Error(text(lang, "requiredName"));

      if (isCreate) {
        await api("/warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/warehouses/${item.id}`, {
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
  const filialFilter = viewEl.getAttribute("data-filial") || "";

  let warehousesResp;
  let filialsResp;
  let fields;
  try {
    [warehousesResp, filialsResp, fields] = await Promise.all([
      api("/warehouses"),
      api("/filials"),
      loadEntityFieldAccess(api, "warehouses")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const showFilialFilter = fields.showInFilters("filial_id");
  const showSearch = ["name", "code", "address", "comment"].some((key) => fields.showInFilters(key));
  const filterableFields = ["name", "code", "address", "comment"].filter((key) => fields.showInFilters(key));
  const filials = (filialsResp.items || []).filter(item => Number(item.is_active) === 1);
  const allItems = (warehousesResp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q, showFilialFilter ? filialFilter : "", filterableFields);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          ${showFilialFilter ? `
            <div class="col-12 col-md-4">
              <label class="form-label">${esc(text(lang, "filial"))}</label>
              <select id="settings_warehouses_filial" class="form-select">
                <option value="">${esc(text(lang, "allFilials"))}</option>
                ${filials.map(filial => `<option value="${filial.id}" ${String(filial.id) === String(filialFilter) ? "selected" : ""}>${esc(filial.name)}</option>`).join("")}
              </select>
            </div>
          ` : ""}
          ${showSearch ? `
            <div class="col-12 col-md-5">
              <label class="form-label">${esc(text(lang, "search"))}</label>
              <input id="settings_warehouses_q" class="form-control" value="${esc(q)}">
            </div>
          ` : ""}
          <div class="col-12 col-md-3 d-grid">
            <button id="settings_warehouses_create" class="btn btn-primary" ${filials.length ? "" : "disabled"}>${esc(text(lang, "create"))}</button>
          </div>
        </div>
        ${filials.length ? "" : `<div class="alert alert-warning mt-3 mb-0">${esc(text(lang, "noFilials"))}</div>`}
      </div>
    </div>

    ${items.length ? tableHtml(items, filials, lang, fields) : emptyHtml(text(lang, "noItems"))}
  `;

  if (showFilialFilter) {
    document.getElementById("settings_warehouses_filial").addEventListener("change", (event) => {
      viewEl.setAttribute("data-filial", event.target.value);
      render(ctx);
    });
  } else {
    viewEl.setAttribute("data-filial", "");
  }

  if (showSearch) {
    const qEl = document.getElementById("settings_warehouses_q");
    qEl.addEventListener("input", () => {
      viewEl.setAttribute("data-q", qEl.value.trim());
      queueRerender(viewEl, "__settingsWarehousesTimer", () => render(ctx), 180);
    });
  } else {
    viewEl.setAttribute("data-q", "");
  }

  document.getElementById("settings_warehouses_create").addEventListener("click", () => {
    openEntityModal(ctx, filialFilter ? { filial_id: Number(filialFilter) } : null, filials, fields);
  });

  document.querySelectorAll("[data-edit-warehouse]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editWarehouse);
      const item = allItems.find(entry => entry.id === id);
      if (item) openEntityModal(ctx, item, filials, fields);
    });
  });

  if (fields.isEnabled("is_active")) {
    document.querySelectorAll("[data-toggle-warehouse]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.toggleWarehouse);
        const next = Number(btn.dataset.next);
        await api(`/warehouses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: next })
        });
        await render(ctx);
      });
    });
  }
}
