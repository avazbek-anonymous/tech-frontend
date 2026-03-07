import {
  activeBadge,
  emptyHtml,
  errorHtml,
  esc,
  langOf,
  noAccessHtml,
  pick,
  queueRerender,
  ynBadge
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки: Кассы",
    subtitle: "Кассы, терминалы и банковские счета по филиалам",
    noAccess: "Раздел касс доступен только владельцу бизнеса",
    search: "Поиск",
    create: "Создать кассу",
    edit: "Редактировать кассу",
    noItems: "Кассы не найдены",
    noFilials: "Сначала создайте хотя бы один филиал",
    filial: "Филиал",
    allFilials: "Все филиалы",
    kind: "Тип",
    allKinds: "Все типы",
    name: "Название",
    code: "Код",
    currency: "Валюта",
    comment: "Комментарий",
    isDefault: "По умолчанию",
    status: "Статус",
    actions: "Действия",
    active: "Активна",
    inactive: "Неактивна",
    yes: "Да",
    no: "Нет",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название кассы",
    requiredFilial: "Выберите филиал",
    cash: "Наличные",
    card: "Карта / терминал",
    bank: "Банк"
  },
  uz: {
    title: "Sozlamalar: Kassalar",
    subtitle: "Filiallar bo'yicha kassalar, terminallar va bank hisoblari",
    noAccess: "Kassalar bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    create: "Kassa yaratish",
    edit: "Kassani tahrirlash",
    noItems: "Kassalar topilmadi",
    noFilials: "Avval kamida bitta filial yarating",
    filial: "Filial",
    allFilials: "Barcha filiallar",
    kind: "Turi",
    allKinds: "Barcha turlar",
    name: "Nomi",
    code: "Kod",
    currency: "Valyuta",
    comment: "Izoh",
    isDefault: "Standart",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    yes: "Ha",
    no: "Yo'q",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Kassa nomini kiriting",
    requiredFilial: "Filialni tanlang",
    cash: "Naqd",
    card: "Karta / terminal",
    bank: "Bank"
  },
  en: {
    title: "Settings: Cash desks",
    subtitle: "Cash desks, terminals, and bank accounts by branch",
    noAccess: "Cash desk settings are available only to the business owner",
    search: "Search",
    create: "Create cash desk",
    edit: "Edit cash desk",
    noItems: "No cash desks found",
    noFilials: "Create at least one branch first",
    filial: "Branch",
    allFilials: "All branches",
    kind: "Kind",
    allKinds: "All kinds",
    name: "Name",
    code: "Code",
    currency: "Currency",
    comment: "Comment",
    isDefault: "Default",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    save: "Save",
    update: "Update",
    requiredName: "Cash desk name is required",
    requiredFilial: "Select a branch",
    cash: "Cash",
    card: "Card / terminal",
    bank: "Bank"
  }
};

const KINDS = ["cash", "card", "bank"];

function text(lang, key) {
  return pick(UI, lang, key);
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    filial_id: Number(item?.filial_id || 0),
    name: String(item?.name || ""),
    kind: String(item?.kind || "cash"),
    currency: String(item?.currency || "UZS"),
    comment: String(item?.comment || ""),
    is_default: Number(item?.is_default || 0),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q, filialId, kind) {
  const needle = String(q || "").trim().toLowerCase();
  return items.filter(item => {
    if (filialId && Number(item.filial_id) !== Number(filialId)) return false;
    if (kind && item.kind !== kind) return false;
    if (!needle) return true;
    return [item.name, item.currency, item.comment].some(v => String(v || "").toLowerCase().includes(needle));
  });
}

function kindLabel(lang, kind) {
  return text(lang, kind) || kind;
}

function modalHtml(lang, item, filials, currencyCodes) {
  const values = new Set(["UZS", item?.currency || "UZS", ...(currencyCodes || [])].filter(Boolean));
  return `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "filial"))}</label>
        <select class="form-select" name="filial_id">
          <option value="">-</option>
          ${filials.map(filial => `<option value="${filial.id}" ${Number(item?.filial_id || 0) === Number(filial.id) ? "selected" : ""}>${esc(filial.name)}</option>`).join("")}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "kind"))}</label>
        <select class="form-select" name="kind">
          ${KINDS.map(kind => `<option value="${kind}" ${String(item?.kind || "cash") === kind ? "selected" : ""}>${esc(kindLabel(lang, kind))}</option>`).join("")}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "name"))}</label>
        <input class="form-control" name="name" value="${esc(item?.name || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "currency"))}</label>
        <input class="form-control" name="currency" list="cash_currency_list" value="${esc(item?.currency || "UZS")}">
        <datalist id="cash_currency_list">
          ${Array.from(values).map(code => `<option value="${esc(code)}"></option>`).join("")}
        </datalist>
      </div>
      <div class="col-md-6">
        <div class="form-check form-switch mt-4">
          <input class="form-check-input" type="checkbox" role="switch" name="is_default" ${Number(item?.is_default || 0) === 1 ? "checked" : ""}>
          <label class="form-check-label">${esc(text(lang, "isDefault"))}</label>
        </div>
      </div>
      <div class="col-12">
        <label class="form-label">${esc(text(lang, "comment"))}</label>
        <textarea class="form-control" name="comment" rows="2">${esc(item?.comment || "")}</textarea>
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

function readForm(modalEl) {
  return {
    filial_id: Number(modalEl.querySelector("[name='filial_id']").value || 0),
    kind: modalEl.querySelector("[name='kind']").value,
    name: modalEl.querySelector("[name='name']").value.trim(),
    currency: modalEl.querySelector("[name='currency']").value.trim() || "UZS",
    comment: modalEl.querySelector("[name='comment']").value.trim() || null,
    is_default: modalEl.querySelector("[name='is_default']").checked ? 1 : 0,
    is_active: modalEl.querySelector("[name='is_active']").checked ? 1 : 0
  };
}

function tableHtml(items, filials, lang) {
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
              <th style="width:170px">${esc(text(lang, "filial"))}</th>
              <th>${esc(text(lang, "name"))}</th>
              <th style="width:150px">${esc(text(lang, "kind"))}</th>
              <th style="width:100px">${esc(text(lang, "currency"))}</th>
              <th style="width:110px">${esc(text(lang, "isDefault"))}</th>
              <th style="width:110px">${esc(text(lang, "status"))}</th>
              <th style="width:160px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${esc(filialById.get(Number(item.filial_id)) || "-")}</td>
                <td>
                  <div class="fw-semibold">${esc(item.name)}</div>
                  <div class="text-muted small">${esc(item.comment || "-")}</div>
                </td>
                <td>${esc(kindLabel(lang, item.kind))}</td>
                <td>${esc(item.currency)}</td>
                <td>${ynBadge(item.is_default, labels)}</td>
                <td>${activeBadge(item.is_active, labels)}</td>
                <td>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" data-edit-cash="${item.id}">${esc(text(lang, "update"))}</button>
                    <button class="btn btn-sm btn-outline-secondary" data-toggle-cash="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
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
                <div class="fw-semibold">${esc(item.name)}</div>
                <div class="text-muted small">${esc(filialById.get(Number(item.filial_id)) || "-")}</div>
              </div>
              ${activeBadge(item.is_active, labels)}
            </div>
            <div class="small text-muted mt-2">${esc(text(lang, "kind"))}: ${esc(kindLabel(lang, item.kind))}</div>
            <div class="small text-muted">${esc(text(lang, "currency"))}: ${esc(item.currency)}</div>
            <div class="small text-muted">${esc(text(lang, "isDefault"))}: ${item.is_default ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>
            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-primary" data-edit-cash="${item.id}">${esc(text(lang, "update"))}</button>
              <button class="btn btn-sm btn-outline-secondary" data-toggle-cash="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

async function openEntityModal(ctx, item, filials, currencyCodes) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item, filials, currencyCodes),
    onSave: async (modalEl) => {
      const payload = readForm(modalEl);
      if (!payload.filial_id) throw new Error(text(lang, "requiredFilial"));
      if (!payload.name) throw new Error(text(lang, "requiredName"));

      if (isCreate) {
        await api("/cash-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/cash-accounts/${item.id}`, {
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
  const kindFilter = viewEl.getAttribute("data-kind") || "";

  let cashResp;
  let filialsResp;
  let currenciesResp;
  try {
    [cashResp, filialsResp, currenciesResp] = await Promise.all([
      api("/cash-accounts"),
      api("/filials"),
      api("/currencies").catch(() => ({ items: [] }))
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const filials = (filialsResp.items || []).filter(item => Number(item.is_active) === 1);
  const currencyCodes = (currenciesResp.items || []).map(item => String(item.name || "")).filter(Boolean);
  const allItems = (cashResp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q, filialFilter, kindFilter);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-3">
            <label class="form-label">${esc(text(lang, "filial"))}</label>
            <select id="settings_cash_filial" class="form-select">
              <option value="">${esc(text(lang, "allFilials"))}</option>
              ${filials.map(filial => `<option value="${filial.id}" ${String(filial.id) === String(filialFilter) ? "selected" : ""}>${esc(filial.name)}</option>`).join("")}
            </select>
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">${esc(text(lang, "kind"))}</label>
            <select id="settings_cash_kind" class="form-select">
              <option value="">${esc(text(lang, "allKinds"))}</option>
              ${KINDS.map(kind => `<option value="${kind}" ${kind === kindFilter ? "selected" : ""}>${esc(kindLabel(lang, kind))}</option>`).join("")}
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="settings_cash_q" class="form-control" value="${esc(q)}">
          </div>
          <div class="col-12 col-md-2 d-grid">
            <button id="settings_cash_create" class="btn btn-primary" ${filials.length ? "" : "disabled"}>${esc(text(lang, "create"))}</button>
          </div>
        </div>
        ${filials.length ? "" : `<div class="alert alert-warning mt-3 mb-0">${esc(text(lang, "noFilials"))}</div>`}
      </div>
    </div>

    ${items.length ? tableHtml(items, filials, lang) : emptyHtml(text(lang, "noItems"))}
  `;

  document.getElementById("settings_cash_filial").addEventListener("change", (event) => {
    viewEl.setAttribute("data-filial", event.target.value);
    render(ctx);
  });

  document.getElementById("settings_cash_kind").addEventListener("change", (event) => {
    viewEl.setAttribute("data-kind", event.target.value);
    render(ctx);
  });

  const qEl = document.getElementById("settings_cash_q");
  qEl.addEventListener("input", () => {
    viewEl.setAttribute("data-q", qEl.value.trim());
    queueRerender(viewEl, "__settingsCashTimer", () => render(ctx), 180);
  });

  document.getElementById("settings_cash_create").addEventListener("click", () => {
    const preset = {};
    if (filialFilter) preset.filial_id = Number(filialFilter);
    if (kindFilter) preset.kind = kindFilter;
    openEntityModal(ctx, preset, filials, currencyCodes);
  });

  document.querySelectorAll("[data-edit-cash]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editCash);
      const item = allItems.find(entry => entry.id === id);
      if (item) openEntityModal(ctx, item, filials, currencyCodes);
    });
  });

  document.querySelectorAll("[data-toggle-cash]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.toggleCash);
      const next = Number(btn.dataset.next);
      await api(`/cash-accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next })
      });
      await render(ctx);
    });
  });
}
