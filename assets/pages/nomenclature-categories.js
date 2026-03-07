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
    title: "Номенклатура: Категории",
    subtitle: "Категории для структуры товарного каталога",
    search: "Поиск",
    create: "Добавить категорию",
    edit: "Редактировать категорию",
    noItems: "Категории не найдены",
    name: "Название",
    parent: "Родительская категория",
    status: "Статус",
    actions: "Действия",
    active: "Активна",
    inactive: "Неактивна",
    save: "Сохранить",
    update: "Изменить",
    requiredName: "Укажите название категории",
    duplicateName: "Категория с таким названием уже существует",
    invalidParent: "Выбран некорректный родитель",
    parentCycle: "Нельзя вложить категорию в саму себя или в потомка",
    topLevel: "Без родителя"
  },
  uz: {
    title: "Nomenklatura: Kategoriyalar",
    subtitle: "Tovar katalogi tuzilmasi uchun kategoriyalar",
    search: "Qidiruv",
    create: "Kategoriya qo'shish",
    edit: "Kategoriyani tahrirlash",
    noItems: "Kategoriyalar topilmadi",
    name: "Nomi",
    parent: "Yuqori kategoriya",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    save: "Saqlash",
    update: "Yangilash",
    requiredName: "Kategoriya nomini kiriting",
    duplicateName: "Bunday nomdagi kategoriya allaqachon mavjud",
    invalidParent: "Noto'g'ri yuqori kategoriya tanlandi",
    parentCycle: "Kategoriyani o'ziga yoki avlodiga ulab bo'lmaydi",
    topLevel: "Yuqori daraja"
  },
  en: {
    title: "Nomenclature: Categories",
    subtitle: "Categories for product catalog structure",
    search: "Search",
    create: "Add category",
    edit: "Edit category",
    noItems: "No categories found",
    name: "Name",
    parent: "Parent category",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    save: "Save",
    update: "Update",
    requiredName: "Category name is required",
    duplicateName: "Category with this name already exists",
    invalidParent: "Invalid parent category selected",
    parentCycle: "You cannot assign a category to itself or its descendant",
    topLevel: "Top level"
  }
};

function text(lang, key) {
  return pick(UI, lang, key);
}

function normalizeItem(item) {
  return {
    id: Number(item?.id || 0),
    parent_id: item?.parent_id ? Number(item.parent_id) : null,
    name: String(item?.name || ""),
    is_active: Number(item?.is_active || 0)
  };
}

function filterItems(items, q) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  return items.filter(item => (
    String(item.name || "").toLowerCase().includes(needle)
  ));
}

function getDescendantIds(items, rootId) {
  const byParent = new Map();
  for (const item of items) {
    const key = item.parent_id === null ? "null" : String(item.parent_id);
    const list = byParent.get(key) || [];
    list.push(item.id);
    byParent.set(key, list);
  }

  const seen = new Set();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop();
    const children = byParent.get(String(current)) || [];
    for (const childId of children) {
      if (!seen.has(childId)) {
        seen.add(childId);
        stack.push(childId);
      }
    }
  }
  return seen;
}

function mapSaveError(lang, error) {
  const msg = String(error?.message || error || "");
  if (msg === "Required: name" || msg === "name cannot be empty") return text(lang, "requiredName");
  if (msg === "Name already exists") return text(lang, "duplicateName");
  if (msg === "parent_not_found" || msg === "parent_wrong_business" || msg === "parent_id must be number") return text(lang, "invalidParent");
  if (msg === "parent_cycle" || msg === "parent_id cannot be self") return text(lang, "parentCycle");
  return msg;
}

function parentOptionsHtml(lang, items, currentId, selectedParentId) {
  const blocked = currentId ? getDescendantIds(items, currentId) : new Set();
  if (currentId) blocked.add(currentId);

  const options = items
    .filter(item => !blocked.has(item.id))
    .map(item => `<option value="${item.id}" ${Number(selectedParentId) === Number(item.id) ? "selected" : ""}>${esc(item.name)}</option>`)
    .join("");

  return `
    <option value="">${esc(text(lang, "topLevel"))}</option>
    ${options}
  `;
}

function modalHtml(lang, item, allItems) {
  return `
    <div class="row g-3">
      <div class="col-md-7">
        <label class="form-label">${esc(text(lang, "name"))}</label>
        <input class="form-control" name="name" value="${esc(item?.name || "")}">
      </div>
      <div class="col-md-5">
        <label class="form-label">${esc(text(lang, "parent"))}</label>
        <select class="form-select" name="parent_id">
          ${parentOptionsHtml(lang, allItems, item?.id || null, item?.parent_id || null)}
        </select>
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
  const parentRaw = modalEl.querySelector("[name='parent_id']").value;
  return {
    name: modalEl.querySelector("[name='name']").value.trim(),
    parent_id: parentRaw ? Number(parentRaw) : null,
    is_active: modalEl.querySelector("[name='is_active']").checked ? 1 : 0
  };
}

function desktopTableHtml(items, lang, parentById, canWrite) {
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
              <th style="width:220px">${esc(text(lang, "parent"))}</th>
              <th style="width:110px">${esc(text(lang, "status"))}</th>
              ${canWrite ? `<th style="width:160px">${esc(text(lang, "actions"))}</th>` : ""}
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td class="fw-semibold">${esc(item.name)}</td>
                <td>${esc(parentById.get(Number(item.parent_id)) || text(lang, "topLevel"))}</td>
                <td>${activeBadge(item.is_active, labels)}</td>
                ${canWrite ? `
                  <td>
                    <div class="d-flex gap-2 flex-wrap">
                      <button class="btn btn-sm btn-outline-primary" data-edit-category="${item.id}">${esc(text(lang, "update"))}</button>
                      <button class="btn btn-sm btn-outline-secondary" data-toggle-category="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
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

function mobileCardsHtml(items, lang, parentById, canWrite) {
  const labels = {
    active: text(lang, "active"),
    inactive: text(lang, "inactive")
  };

  return `
    <div class="d-lg-none">
      ${items.map(item => `
        <div class="card mb-2 shadow-sm">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                <div class="fw-semibold">${esc(item.name)}</div>
                <div class="small text-muted mt-1">${esc(text(lang, "parent"))}: ${esc(parentById.get(Number(item.parent_id)) || text(lang, "topLevel"))}</div>
              </div>
              ${activeBadge(item.is_active, labels)}
            </div>
            ${canWrite ? `
              <div class="d-flex gap-2 flex-wrap mt-3">
                <button class="btn btn-sm btn-outline-primary" data-edit-category="${item.id}">${esc(text(lang, "update"))}</button>
                <button class="btn btn-sm btn-outline-secondary" data-toggle-category="${item.id}" data-next="${item.is_active ? 0 : 1}">${item.is_active ? esc(text(lang, "inactive")) : esc(text(lang, "active"))}</button>
              </div>
            ` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function tableHtml(items, lang, parentById, canWrite) {
  return `${desktopTableHtml(items, lang, parentById, canWrite)}${mobileCardsHtml(items, lang, parentById, canWrite)}`;
}

async function openEntityModal(ctx, item, allItems) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !item?.id;

  openModal({
    title: isCreate ? text(lang, "create") : text(lang, "edit"),
    saveText: text(lang, "save"),
    bodyHtml: modalHtml(lang, item, allItems),
    onSave: async (modalEl) => {
      const payload = readForm(modalEl);
      if (!payload.name) throw new Error(text(lang, "requiredName"));

      try {
        if (isCreate) {
          await api("/product_categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await api(`/product_categories/${item.id}`, {
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

  let resp;
  try {
    resp = await api("/product_categories");
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const allItems = (resp.items || []).map(normalizeItem);
  const parentById = new Map(allItems.map(item => [item.id, item.name]));
  const items = filterItems(allItems, q);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 ${canWrite ? "col-md-8 col-lg-9" : "col-md-12"}">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="nomenclature_categories_q" class="form-control" value="${esc(q)}">
          </div>
          ${canWrite ? `
            <div class="col-12 col-md-4 col-lg-3 d-grid">
              <button id="nomenclature_categories_create" class="btn btn-primary">${esc(text(lang, "create"))}</button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
    ${items.length ? tableHtml(items, lang, parentById, canWrite) : emptyHtml(text(lang, "noItems"))}
  `;

  const qEl = document.getElementById("nomenclature_categories_q");
  qEl.addEventListener("input", () => {
    viewEl.setAttribute("data-q", qEl.value.trim());
    queueRerender(viewEl, "__nomenclatureCategoriesTimer", () => render(ctx), 180);
  });

  if (canWrite) {
    const createBtn = document.getElementById("nomenclature_categories_create");
    if (createBtn) {
      createBtn.addEventListener("click", () => openEntityModal(ctx, null, allItems));
    }

    document.querySelectorAll("[data-edit-category]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editCategory);
        const item = allItems.find(entry => entry.id === id);
        if (item) openEntityModal(ctx, item, allItems);
      });
    });

    document.querySelectorAll("[data-toggle-category]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.toggleCategory);
        const next = Number(btn.dataset.next);
        await api(`/product_categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: next })
        });
        await render(ctx);
      });
    });
  }
}
