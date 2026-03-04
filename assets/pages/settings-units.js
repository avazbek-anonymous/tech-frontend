import {
  activeBadge,
  emptyHtml,
  errorHtml,
  esc,
  langOf,
  noAccessHtml,
  pick,
  queueRerender
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки: Ед. изм.",
    subtitle: "Единицы измерения для номенклатуры и документов",
    noAccess: "Раздел единиц измерения доступен только владельцу бизнеса",
    search: "Поиск",
    create: "Создать единицу",
    edit: "Редактировать единицу",
    noItems: "Единицы не найдены",
    name: "Название",
    code: "Код",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название единицы"
  },
  uz: {
    title: "Sozlamalar: O'lchov birliklari",
    subtitle: "Nomenklatura va hujjatlar uchun o'lchov birliklari",
    noAccess: "O'lchov birliklari bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    create: "Birlik yaratish",
    edit: "Birlikni tahrirlash",
    noItems: "Birliklar topilmadi",
    name: "Nomi",
    code: "Kod",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Birlik nomini kiriting"
  },
  en: {
    title: "Settings: Units",
    subtitle: "Measurement units for products and documents",
    noAccess: "Units settings are available only to the business owner",
    search: "Search",
    create: "Create unit",
    edit: "Edit unit",
    noItems: "No units found",
    name: "Name",
    code: "Code",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    save: "Save",
    update: "Update",
    requiredName: "Unit name is required"
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
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  return items.filter(item => [item.name, item.code].some(v => String(v || "").toLowerCase().includes(needle)));
}

function modalHtml(lang, item) {
  return `
    <div class="row g-3">
      <div class="col-md-8">
        <label class="form-label">${esc(text(lang, "name"))}</label>
        <input class="form-control" name="name" value="${esc(item?.name || "")}">
      </div>
      <div class="col-md-4">
        <label class="form-label">${esc(text(lang, "code"))}</label>
        <input class="form-control" name="code" value="${esc(item?.code || "")}">
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
    name: modalEl.querySelector("[name='name']").value.trim(),
    code: modalEl.querySelector("[name='code']").value.trim() || null,
    is_active: modalEl.querySelector("[name='is_active']").checked ? 1 : 0
  };
}

function tableHtml(items, lang) {
  const labels = { active: text(lang, "active"), inactive: text(lang, "inactive") };
  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width:72px">ID</th>
              <th>${esc(text(lang, "name"))}</th>
              <th style="width:180px">${esc(text(lang, "code"))}</th>
              <th style="width:110px">${esc(text(lang, "status"))}</th>
              <th style="width:160px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.id}</td>
                <td class="fw-semibold">${esc(item.name)}</td>
                <td>${esc(item.code || "-")}</td>
                <td>${activeBadge(item.is_active, labels)}</td>
                <td>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" data-edit-unit="${item.id}">${esc(text(lang, "update"))}</button>
                    <button class="btn btn-sm btn-outline-secondary" data-toggle-unit="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
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
                <div class="fw-semibold">${esc(item.name)}</div>
                <div class="text-muted small">${esc(item.code || "-")}</div>
              </div>
              ${activeBadge(item.is_active, labels)}
            </div>
            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-primary" data-edit-unit="${item.id}">${esc(text(lang, "update"))}</button>
              <button class="btn btn-sm btn-outline-secondary" data-toggle-unit="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
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
      if (!payload.name) throw new Error(text(lang, "requiredName"));

      if (isCreate) {
        await api("/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/units/${item.id}`, {
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

  let unitsResp;
  try {
    unitsResp = await api("/units");
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (unitsResp.items || []).map(normalizeItem);
  const items = filterItems(allItems, q);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-8 col-lg-9">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="settings_units_q" class="form-control" value="${esc(q)}">
          </div>
          <div class="col-12 col-md-4 col-lg-3 d-grid">
            <button id="settings_units_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
          </div>
        </div>
      </div>
    </div>

    ${items.length ? tableHtml(items, lang) : emptyHtml(text(lang, "noItems"))}
  `;

  const qEl = document.getElementById("settings_units_q");
  qEl.addEventListener("input", () => {
    viewEl.setAttribute("data-q", qEl.value.trim());
    queueRerender(viewEl, "__settingsUnitsTimer", () => render(ctx), 180);
  });

  document.getElementById("settings_units_create").addEventListener("click", () => openEntityModal(ctx, null));

  document.querySelectorAll("[data-edit-unit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editUnit);
      const item = allItems.find(entry => entry.id === id);
      if (item) openEntityModal(ctx, item);
    });
  });

  document.querySelectorAll("[data-toggle-unit]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.toggleUnit);
      const next = Number(btn.dataset.next);
      await api(`/units/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next })
      });
      await render(ctx);
    });
  });
}
