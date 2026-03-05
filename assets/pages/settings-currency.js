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
    title: "Настройки: Валюта",
    subtitle: "Валюты бизнеса и курс по умолчанию",
    noAccess: "Раздел валют доступен только владельцу бизнеса",
    search: "Поиск",
    create: "Добавить валюту",
    edit: "Редактировать валюту",
    noItems: "Валюты не найдены",
    code: "Код",
    name: "Название",
    rate: "Курс",
    isDefault: "По умолчанию",
    status: "Статус",
    actions: "Действия",
    active: "Активна",
    inactive: "Неактивна",
    yes: "Да",
    no: "Нет",
    save: "Сохранить",
    update: "Изменить",
    requiredCode: "Укажите код валюты",
    requiredRate: "Курс должен быть больше нуля"
  },
  uz: {
    title: "Sozlamalar: Valyuta",
    subtitle: "Biznes valyutalari va standart kurs",
    noAccess: "Valyuta bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    create: "Valyuta qo'shish",
    edit: "Valyutani tahrirlash",
    noItems: "Valyutalar topilmadi",
    code: "Kod",
    name: "Nomi",
    rate: "Kurs",
    isDefault: "Standart",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    yes: "Ha",
    no: "Yo'q",
    save: "Saqlash",
    update: "Yangilash",
    requiredCode: "Valyuta kodini kiriting",
    requiredRate: "Kurs noldan katta bo'lishi kerak"
  },
  en: {
    title: "Settings: Currency",
    subtitle: "Business currencies and default exchange rate",
    noAccess: "Currency settings are available only to the business owner",
    search: "Search",
    create: "Add currency",
    edit: "Edit currency",
    noItems: "No currencies found",
    code: "Code",
    name: "Name",
    rate: "Rate",
    isDefault: "Default",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    yes: "Yes",
    no: "No",
    save: "Save",
    update: "Update",
    requiredCode: "Currency code is required",
    requiredRate: "Rate must be greater than zero"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function extraText(lang, key) {
  const dict = {
    ru: {
      codeHint: "3-6 \u043b\u0430\u0442\u0438\u043d\u0441\u043a\u0438\u0445 \u0431\u0443\u043a\u0432, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 USD",
      nameHint: "\u041f\u043e\u043b\u043d\u043e\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u0414\u043e\u043b\u043b\u0430\u0440 \u0421\u0428\u0410",
      codePlaceholder: "USD",
      namePlaceholder: "\u0414\u043e\u043b\u043b\u0430\u0440 \u0421\u0428\u0410",
      invalidCode: "\u041a\u043e\u0434 \u0432\u0430\u043b\u044e\u0442\u044b \u0434\u043e\u043b\u0436\u0435\u043d \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0442\u044c 3-6 \u043b\u0430\u0442\u0438\u043d\u0441\u043a\u0438\u0445 \u0431\u0443\u043a\u0432, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 USD",
      duplicateCode: "\u0412\u0430\u043b\u044e\u0442\u0430 \u0441 \u0442\u0430\u043a\u0438\u043c \u043a\u043e\u0434\u043e\u043c \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442"
    },
    uz: {
      codeHint: "3-6 ta lotin harfi, masalan USD",
      nameHint: "To'liq nomi, masalan AQSH dollari",
      codePlaceholder: "USD",
      namePlaceholder: "AQSH dollari",
      invalidCode: "Valyuta kodi 3-6 ta lotin harfidan iborat bo'lishi kerak, masalan USD",
      duplicateCode: "Bunday kodli valyuta allaqachon mavjud"
    },
    en: {
      codeHint: "3-6 latin letters, for example USD",
      nameHint: "Full name, for example US Dollar",
      codePlaceholder: "USD",
      namePlaceholder: "US Dollar",
      invalidCode: "Currency code must contain 3-6 latin letters, for example USD",
      duplicateCode: "A currency with this code already exists"
    }
  };
  return pick(dict, lang, key);
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    code: String(item?.code || ""),
    name: String(item?.name || ""),
    rate: Number(item?.rate || 0),
    is_default: Number(item?.is_default || 0),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  return items.filter(item => [item.code, item.name].some(v => String(v || "").toLowerCase().includes(needle)));
}

function isValidCode(code) {
  return /^[A-Z]{3,6}$/.test(String(code || "").trim().toUpperCase());
}

function mapSaveError(lang, error) {
  const msg = String(error?.message || error || "");
  if (msg === "code must be 3-6 latin letters") return extraText(lang, "invalidCode");
  if (msg === "Required: code" || msg === "code cannot be empty") return text(lang, "requiredCode");
  if (msg === "rate must be > 0") return text(lang, "requiredRate");
  if (msg === "Code already exists") return extraText(lang, "duplicateCode");
  return msg;
}

function modalHtml(lang, item) {
  return `
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">${esc(text(lang, "code"))}</label>
        <input
          class="form-control text-uppercase"
          name="code"
          value="${esc(item?.code || "")}"
          maxlength="6"
          placeholder="${esc(extraText(lang, "codePlaceholder"))}"
          inputmode="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false">
        <div class="form-text">${esc(extraText(lang, "codeHint"))}</div>
      </div>
      <div class="col-md-8">
        <label class="form-label">${esc(text(lang, "name"))}</label>
        <input class="form-control" name="name" value="${esc(item?.name || "")}" placeholder="${esc(extraText(lang, "namePlaceholder"))}">
        <div class="form-text">${esc(extraText(lang, "nameHint"))}</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "rate"))}</label>
        <input class="form-control" name="rate" type="number" min="0.000001" step="0.000001" value="${esc(item?.rate || 1)}">
      </div>
      <div class="col-md-6 d-flex align-items-end">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" name="is_default" ${Number(item?.is_default || 0) === 1 ? "checked" : ""}>
          <label class="form-check-label">${esc(text(lang, "isDefault"))}</label>
        </div>
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
    code: modalEl.querySelector("[name='code']").value.trim().toUpperCase(),
    name: modalEl.querySelector("[name='name']").value.trim(),
    rate: Number(modalEl.querySelector("[name='rate']").value || 0),
    is_default: modalEl.querySelector("[name='is_default']").checked ? 1 : 0,
    is_active: modalEl.querySelector("[name='is_active']").checked ? 1 : 0
  };
}

function tableHtml(items, lang) {
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
              <th style="width:72px">ID</th>
              <th style="width:120px">${esc(text(lang, "code"))}</th>
              <th>${esc(text(lang, "name"))}</th>
              <th style="width:140px">${esc(text(lang, "rate"))}</th>
              <th style="width:110px">${esc(text(lang, "isDefault"))}</th>
              <th style="width:110px">${esc(text(lang, "status"))}</th>
              <th style="width:160px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.id}</td>
                <td class="fw-semibold">${esc(item.code)}</td>
                <td>${esc(item.name)}</td>
                <td>${esc(item.rate)}</td>
                <td>${ynBadge(item.is_default, labels)}</td>
                <td>${activeBadge(item.is_active, labels)}</td>
                <td>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" data-edit-currency="${item.id}">${esc(text(lang, "update"))}</button>
                    <button class="btn btn-sm btn-outline-secondary" data-toggle-currency="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
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
                <div class="small text-muted">#${item.id}</div>
                <div class="fw-semibold">${esc(item.code)}</div>
                <div class="text-muted small">${esc(item.name)}</div>
              </div>
              ${activeBadge(item.is_active, labels)}
            </div>
            <div class="small text-muted mt-2">${esc(text(lang, "rate"))}: ${esc(item.rate)}</div>
            <div class="small text-muted">${esc(text(lang, "isDefault"))}: ${item.is_default ? esc(text(lang, "yes")) : esc(text(lang, "no"))}</div>
            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-primary" data-edit-currency="${item.id}">${esc(text(lang, "update"))}</button>
              <button class="btn btn-sm btn-outline-secondary" data-toggle-currency="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

async function openEntityModal(ctx, item) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : `${text(lang, "edit")} #${item.id}`,
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item),
    onSave: async (modalEl) => {
      const payload = readForm(modalEl);
      if (!payload.code) throw new Error(text(lang, "requiredCode"));
      if (!isValidCode(payload.code)) throw new Error(extraText(lang, "invalidCode"));
      if (!(payload.rate > 0)) throw new Error(text(lang, "requiredRate"));
      if (!payload.name) payload.name = payload.code;

      try {
        if (isCreate) {
          await api("/currencies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await api(`/currencies/${item.id}`, {
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
  const { api, page, state, viewEl } = ctx;
  const lang = langOf();

  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  if (String(state?.me?.role || "") !== "business_owner") {
    viewEl.innerHTML = noAccessHtml(text(lang, "noAccess"));
    return;
  }

  const q = viewEl.getAttribute("data-q") || "";

  let resp;
  try {
    resp = await api("/currencies");
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (resp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-8 col-lg-9">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="settings_currency_q" class="form-control" value="${esc(q)}">
          </div>
          <div class="col-12 col-md-4 col-lg-3 d-grid">
            <button id="settings_currency_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
          </div>
        </div>
      </div>
    </div>

    ${items.length ? tableHtml(items, lang) : emptyHtml(text(lang, "noItems"))}
  `;

  const qEl = document.getElementById("settings_currency_q");
  qEl.addEventListener("input", () => {
    viewEl.setAttribute("data-q", qEl.value.trim());
    queueRerender(viewEl, "__settingsCurrencyTimer", () => render(ctx), 180);
  });

  document.getElementById("settings_currency_create").addEventListener("click", () => openEntityModal(ctx, null));

  document.querySelectorAll("[data-edit-currency]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editCurrency);
      const item = allItems.find(entry => entry.id === id);
      if (item) openEntityModal(ctx, item);
    });
  });

  document.querySelectorAll("[data-toggle-currency]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.toggleCurrency);
      const next = Number(btn.dataset.next);
      await api(`/currencies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next })
      });
      await render(ctx);
    });
  });
}
