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
    title: "Настройки: Филиалы",
    subtitle: "Список филиалов, контакты и значения по умолчанию",
    noAccess: "Раздел филиалов доступен только владельцу бизнеса",
    search: "Поиск",
    create: "Создать филиал",
    edit: "Редактировать филиал",
    noItems: "Филиалы не найдены",
    name: "Название",
    code: "Код",
    phone: "Телефон",
    address: "Адрес",
    comment: "Комментарий",
    timezone: "Часовой пояс",
    currency: "Валюта",
    isDefault: "По умолчанию",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    yes: "Да",
    no: "Нет",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название филиала"
  },
  uz: {
    title: "Sozlamalar: Filiallar",
    subtitle: "Filiallar ro'yxati, kontaktlar va standart qiymatlar",
    noAccess: "Filiallar bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    create: "Filial yaratish",
    edit: "Filialni tahrirlash",
    noItems: "Filiallar topilmadi",
    name: "Nomi",
    code: "Kod",
    phone: "Telefon",
    address: "Manzil",
    comment: "Izoh",
    timezone: "Vaqt mintaqasi",
    currency: "Valyuta",
    isDefault: "Standart",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    yes: "Ha",
    no: "Yo'q",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Filial nomini kiriting"
  },
  en: {
    title: "Settings: Branches",
    subtitle: "Branch list, contacts, and default values",
    noAccess: "Branches settings are available only to the business owner",
    search: "Search",
    create: "Create branch",
    edit: "Edit branch",
    noItems: "No branches found",
    name: "Name",
    code: "Code",
    phone: "Phone",
    address: "Address",
    comment: "Comment",
    timezone: "Time zone",
    currency: "Currency",
    isDefault: "Default",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    save: "Save",
    update: "Update",
    requiredName: "Branch name is required"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    name: String(item?.name || ""),
    code: String(item?.code || ""),
    phone: String(item?.phone || ""),
    address: String(item?.address || ""),
    comment: String(item?.comment || ""),
    timezone: String(item?.timezone || "Asia/Tashkent"),
    currency: String(item?.currency || "UZS"),
    is_default: Number(item?.is_default || 0),
    is_active: Number(item?.is_active || 0)
  };
}

function modalHtml(lang, item, currencyCodes, fields) {
  const values = new Set(["UZS", item?.currency || "UZS", ...(currencyCodes || [])].filter(Boolean));
  return `
    <div class="row g-3">
      ${fields.showInForm("name") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "name"))}</label>
          <input class="form-control" name="name" value="${esc(item?.name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("code") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "code"))}</label>
          <input class="form-control" name="code" value="${esc(item?.code || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("phone") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "phone"))}</label>
          <input class="form-control" name="phone" value="${esc(item?.phone || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("currency") ? `
        <div class="col-md-6">
          <label class="form-label">${esc(text(lang, "currency"))}</label>
          <input class="form-control" name="currency" list="filial_currency_list" value="${esc(item?.currency || "UZS")}">
          <datalist id="filial_currency_list">
            ${Array.from(values).map(code => `<option value="${esc(code)}"></option>`).join("")}
          </datalist>
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
      ${fields.showInForm("timezone") ? `
        <div class="col-12">
          <label class="form-label">${esc(text(lang, "timezone"))}</label>
          <input class="form-control" name="timezone" value="${esc(item?.timezone || "Asia/Tashkent")}">
        </div>
      ` : ""}
      ${fields.showInForm("is_default") ? `
        <div class="col-md-6">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" name="is_default" ${Number(item?.is_default || 0) === 1 ? "checked" : ""}>
            <label class="form-check-label">${esc(text(lang, "isDefault"))}</label>
          </div>
        </div>
      ` : ""}
      ${fields.showInForm("is_active") ? `
        <div class="col-md-6">
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
    name: readText("name"),
    code: readText("code") || null,
    phone: readText("phone") || null,
    address: readText("address") || null,
    comment: readText("comment") || null,
    timezone: readText("timezone") || "Asia/Tashkent",
    currency: readText("currency") || "UZS",
    is_default: byName("is_default")?.checked ? 1 : 0,
    is_active: byName("is_active")?.checked ? 1 : 0
  };
}

function filterItems(items, q, filterableFields) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  const fields = (filterableFields || []).length ? filterableFields : ["name"];
  return items.filter(item => fields.some(key => String(item?.[key] || "").toLowerCase().includes(needle)));
}

function tableHtml(items, lang, fields) {
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
              ${fields.showInList("code") ? `<th style="width:120px">${esc(text(lang, "code"))}</th>` : ""}
              ${fields.showInList("phone") ? `<th style="width:150px">${esc(text(lang, "phone"))}</th>` : ""}
              ${fields.showInList("currency") ? `<th style="width:110px">${esc(text(lang, "currency"))}</th>` : ""}
              ${fields.showInList("is_default") ? `<th style="width:110px">${esc(text(lang, "isDefault"))}</th>` : ""}
              ${fields.showInList("is_active") ? `<th style="width:110px">${esc(text(lang, "status"))}</th>` : ""}
              <th style="width:160px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                ${fields.showInList("name") ? `
                  <td>
                    <div class="fw-semibold">${esc(item.name)}</div>
                    ${fields.showInCard("address") ? `<div class="text-muted small">${esc(item.address || "-")}</div>` : ""}
                  </td>
                ` : ""}
                ${fields.showInList("code") ? `<td>${esc(item.code || "-")}</td>` : ""}
                ${fields.showInList("phone") ? `<td>${esc(item.phone || "-")}</td>` : ""}
                ${fields.showInList("currency") ? `<td>${esc(item.currency || "UZS")}</td>` : ""}
                ${fields.showInList("is_default") ? `<td>${ynBadge(item.is_default, labels)}</td>` : ""}
                ${fields.showInList("is_active") ? `<td>${activeBadge(item.is_active, labels)}</td>` : ""}
                <td>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" data-edit-filial="${item.id}">${esc(text(lang, "update"))}</button>
                    ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-filial="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
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
                ${fields.showInCard("code") ? `<div class="text-muted small mt-1">${esc(text(lang, "code"))}: ${esc(item.code || "-")}</div>` : ""}
              </div>
              ${fields.showInCard("is_active") ? activeBadge(item.is_active, labels) : ""}
            </div>
            ${fields.showInCard("phone") ? `<div class="small text-muted mt-2">${esc(text(lang, "phone"))}: ${esc(item.phone || "-")}</div>` : ""}
            ${fields.showInCard("currency") ? `<div class="small text-muted">${esc(text(lang, "currency"))}: ${esc(item.currency || "UZS")}</div>` : ""}
            ${fields.showInCard("address") ? `<div class="small text-muted">${esc(text(lang, "address"))}: ${esc(item.address || "-")}</div>` : ""}
            ${fields.showInCard("is_default") ? `<div class="small text-muted">${esc(text(lang, "isDefault"))}: ${item.is_default ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>` : ""}
            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-primary" data-edit-filial="${item.id}">${esc(text(lang, "update"))}</button>
              ${fields.isEnabled("is_active") ? `<button class="btn btn-sm btn-outline-secondary" data-toggle-filial="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

async function openEntityModal(ctx, item, currencyCodes, fields) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item, currencyCodes, fields),
    onSave: async (modalEl) => {
      const payload = stripDisabledFields(readForm(modalEl), fields);
      if (fields.isRequired("name") && isEmptyFieldValue(payload.name)) {
        throw new Error(text(lang, "requiredName"));
      }

      if (isCreate) {
        await api("/filials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/filials/${item.id}`, {
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

  let filialsResp;
  let currenciesResp;
  let fields;
  try {
    [filialsResp, currenciesResp, fields] = await Promise.all([
      api("/filials"),
      api("/currencies").catch(() => ({ items: [] })),
      loadEntityFieldAccess(api, "filials")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const showSearch = ["name", "code", "phone", "address", "timezone", "currency"].some((key) => fields.showInFilters(key));
  const searchFields = ["name", "code", "phone", "address", "timezone", "currency"].filter((key) => fields.showInFilters(key));
  const currencyCodes = (currenciesResp.items || []).map(item => String(item.name || "")).filter(Boolean);
  const allItems = (filialsResp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q, searchFields);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          ${showSearch ? `
            <div class="col-12 col-md-8 col-lg-9">
              <label class="form-label">${esc(text(lang, "search"))}</label>
              <input id="settings_filials_q" class="form-control" value="${esc(q)}">
            </div>
          ` : ""}
          <div class="col-12 ${showSearch ? "col-md-4 col-lg-3" : ""} d-grid">
            <button id="settings_filials_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
          </div>
        </div>
      </div>
    </div>

    ${items.length ? tableHtml(items, lang, fields) : emptyHtml(text(lang, "noItems"))}
  `;

  if (showSearch) {
    const qEl = document.getElementById("settings_filials_q");
    qEl.addEventListener("input", () => {
      viewEl.setAttribute("data-q", qEl.value.trim());
      queueRerender(viewEl, "__settingsFilialsTimer", () => render(ctx), 180);
    });
  } else {
    viewEl.setAttribute("data-q", "");
  }

  document.getElementById("settings_filials_create").addEventListener("click", () => {
    openEntityModal(ctx, null, currencyCodes, fields);
  });

  document.querySelectorAll("[data-edit-filial]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editFilial);
      const item = allItems.find(entry => entry.id === id);
      if (item) openEntityModal(ctx, item, currencyCodes, fields);
    });
  });

  if (fields.isEnabled("is_active")) {
    document.querySelectorAll("[data-toggle-filial]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.toggleFilial);
        const next = Number(btn.dataset.next);
        await api(`/filials/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: next })
        });
        await render(ctx);
      });
    });
  }
}
