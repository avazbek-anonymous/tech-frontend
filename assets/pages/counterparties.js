import {
  activeBadge,
  emptyHtml,
  errorHtml,
  esc,
  langOf,
  pick,
  queueRerender
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
    duplicateName: "Контрагент с таким названием уже существует"
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
    duplicateName: "Bunday nomdagi kontragent allaqachon mavjud"
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
    duplicateName: "Counterparty with this name already exists"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function sectionKind(sectionId) {
  return sectionId === "counterparties_suppliers" ? "supplier" : "client";
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    kind: String(item?.kind || ""),
    name: String(item?.name || ""),
    contact_person: String(item?.contact_person || ""),
    phone: String(item?.phone || ""),
    email: String(item?.email || ""),
    inn: String(item?.inn || ""),
    address: String(item?.address || ""),
    comment: String(item?.comment || ""),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  return items.filter(item => (
    String(item.name || "").toLowerCase().includes(needle)
    || String(item.contact_person || "").toLowerCase().includes(needle)
    || String(item.phone || "").toLowerCase().includes(needle)
    || String(item.email || "").toLowerCase().includes(needle)
    || String(item.inn || "").toLowerCase().includes(needle)
    || String(item.address || "").toLowerCase().includes(needle)
  ));
}

function mapSaveError(lang, error) {
  const msg = String(error?.message || error || "");
  if (msg === "Required: name" || msg === "name cannot be empty") return text(lang, "requiredName");
  if (msg === "Name already exists") return text(lang, "duplicateName");
  return msg;
}

function modalHtml(lang, item) {
  return `
    <div class="row g-3">
      <div class="col-md-8">
        <label class="form-label">${esc(text(lang, "name"))}</label>
        <input class="form-control" name="name" value="${esc(item?.name || "")}">
      </div>
      <div class="col-md-4">
        <label class="form-label">${esc(text(lang, "phone"))}</label>
        <input class="form-control" name="phone" value="${esc(item?.phone || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "contactPerson"))}</label>
        <input class="form-control" name="contact_person" value="${esc(item?.contact_person || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "email"))}</label>
        <input class="form-control" name="email" value="${esc(item?.email || "")}">
      </div>
      <div class="col-md-4">
        <label class="form-label">${esc(text(lang, "inn"))}</label>
        <input class="form-control" name="inn" value="${esc(item?.inn || "")}">
      </div>
      <div class="col-md-8">
        <label class="form-label">${esc(text(lang, "address"))}</label>
        <input class="form-control" name="address" value="${esc(item?.address || "")}">
      </div>
      <div class="col-12">
        <label class="form-label">${esc(text(lang, "comment"))}</label>
        <textarea class="form-control" rows="3" name="comment">${esc(item?.comment || "")}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" name="is_active" ${Number(item?.is_active ?? 1) === 1 ? "checked" : ""}>
          <label class="form-check-label">${esc(text(lang, "active"))}</label>
        </div>
      </div>
    </div>
  `;
}

function readForm(modalEl, kind) {
  return {
    kind,
    name: modalEl.querySelector("[name='name']").value.trim(),
    contact_person: modalEl.querySelector("[name='contact_person']").value.trim(),
    phone: modalEl.querySelector("[name='phone']").value.trim(),
    email: modalEl.querySelector("[name='email']").value.trim(),
    inn: modalEl.querySelector("[name='inn']").value.trim(),
    address: modalEl.querySelector("[name='address']").value.trim(),
    comment: modalEl.querySelector("[name='comment']").value.trim(),
    is_active: modalEl.querySelector("[name='is_active']").checked ? 1 : 0
  };
}

function desktopTableHtml(items, lang, canWrite) {
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
              <th>${esc(text(lang, "name"))}</th>
              <th style="width:170px">${esc(text(lang, "contactPerson"))}</th>
              <th style="width:150px">${esc(text(lang, "phone"))}</th>
              <th style="width:230px">${esc(text(lang, "address"))}</th>
              <th style="width:110px">${esc(text(lang, "status"))}</th>
              ${canWrite ? `<th style="width:160px">${esc(text(lang, "actions"))}</th>` : ""}
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>
                  <div class="fw-semibold">${esc(item.name)}</div>
                  ${item.inn ? `<div class="small text-muted">${esc(text(lang, "inn"))}: ${esc(item.inn)}</div>` : ""}
                </td>
                <td>${esc(item.contact_person || "-")}</td>
                <td>${esc(item.phone || "-")}</td>
                <td>${esc(item.address || "-")}</td>
                <td>${activeBadge(item.is_active, labels)}</td>
                ${canWrite ? `
                  <td>
                    <div class="d-flex gap-2 flex-wrap">
                      <button class="btn btn-sm btn-outline-primary" data-edit-counterparty="${item.id}">${esc(text(lang, "update"))}</button>
                      <button class="btn btn-sm btn-outline-secondary" data-toggle-counterparty="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
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

function mobileCardsHtml(items, lang, canWrite) {
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
                <div class="fw-semibold">${esc(item.name)}</div>
                ${item.inn ? `<div class="small text-muted mt-1">${esc(text(lang, "inn"))}: ${esc(item.inn)}</div>` : ""}
              </div>
              ${activeBadge(item.is_active, labels)}
            </div>
            <div class="small text-muted mt-2">${esc(text(lang, "contactPerson"))}: ${esc(item.contact_person || "-")}</div>
            <div class="small text-muted">${esc(text(lang, "phone"))}: ${esc(item.phone || "-")}</div>
            <div class="small text-muted">${esc(text(lang, "address"))}: ${esc(item.address || "-")}</div>
            ${canWrite ? `
              <div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3">
                <button class="btn btn-sm btn-outline-primary" data-edit-counterparty="${item.id}">${esc(text(lang, "update"))}</button>
                <button class="btn btn-sm btn-outline-secondary" data-toggle-counterparty="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
              </div>
            ` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function tableHtml(items, lang, canWrite) {
  return `${desktopTableHtml(items, lang, canWrite)}${mobileCardsHtml(items, lang, canWrite)}`;
}

async function openEntityModal(ctx, item, kind) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;
  const kindIsSupplier = kind === "supplier";

  openModal({
    title: isCreate
      ? text(lang, kindIsSupplier ? "createSupplier" : "createClient")
      : text(lang, kindIsSupplier ? "editSupplier" : "editClient"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item),
    onSave: async (modalEl) => {
      const payload = readForm(modalEl, kind);
      if (!payload.name) throw new Error(text(lang, "requiredName"));

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
  try {
    resp = await api(`/counterparties?kind=${encodeURIComponent(kind)}`);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (resp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q);

  viewEl.innerHTML = `
    <div class="card mb-3 entity-toolbar-card">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 ${canWrite ? "col-md-8 col-lg-9" : "col-md-12"}">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="counterparties_q" class="form-control" value="${esc(q)}">
          </div>
          ${canWrite ? `
            <div class="col-12 col-md-4 col-lg-3 d-grid">
              <button id="counterparties_create" class="btn btn-primary">${esc(text(lang, isSupplier ? "createSupplier" : "createClient"))}</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
    ${items.length ? tableHtml(items, lang, canWrite) : emptyHtml(noItemsText)}
  `;

  const qEl = document.getElementById("counterparties_q");
  qEl.addEventListener("input", () => {
    viewEl.setAttribute("data-q", qEl.value.trim());
    queueRerender(viewEl, "__counterpartiesTimer", () => render(ctx), 180);
  });

  if (canWrite) {
    const createBtn = document.getElementById("counterparties_create");
    if (createBtn) {
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, kind));
    }

    document.querySelectorAll("[data-edit-counterparty]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editCounterparty);
        const item = allItems.find(entry => entry.id === id);
        if (item) openEntityModal(ctx, item, kind);
      });
    });

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
