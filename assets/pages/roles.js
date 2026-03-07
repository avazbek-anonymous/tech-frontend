import {
  isEmptyFieldValue,
  langOf,
  loadEntityFieldAccess,
  stripDisabledFields
} from "./settings-utils.js";

const ROLE_ACTIONS = [
  { code: "read", label: { ru: "Смотреть", uz: "Ko'rish", en: "View" } },
  { code: "add", label: { ru: "Создать", uz: "Yaratish", en: "Create" } },
  { code: "change", label: { ru: "Редактировать", uz: "Tahrirlash", en: "Edit" } },
  { code: "disable", label: { ru: "Деактивировать", uz: "Faolsizlantirish", en: "Deactivate" } }
];

const UI = {
  ru: {
    title: "Роли",
    subtitle: "Роли сотрудников и доступы по разделам",
    search: "Поиск",
    status: "Статус",
    allStatuses: "Все",
    active: "Актив",
    inactive: "Неактив",
    createRole: "Создать роль",
    editRole: "Редактировать роль",
    roleName: "Название роли",
    groupName: "Группа",
    positionName: "Должность",
    roleStatus: "Статус роли",
    permissions: "Права по разделам",
    section: "Раздел",
    actions: "Действия",
    noRoles: "Роли не найдены",
    noAccess: "Нет доступа к разделу ролей",
    requiredName: "Укажите название роли",
    save: "Сохранить",
    cancel: "Отмена",
    update: "Изменить"
  },
  uz: {
    title: "Rollar",
    subtitle: "Xodim rollari va bo'limlar bo'yicha ruxsatlar",
    search: "Qidiruv",
    status: "Holat",
    allStatuses: "Barchasi",
    active: "Faol",
    inactive: "Faol emas",
    createRole: "Rol yaratish",
    editRole: "Rolni tahrirlash",
    roleName: "Rol nomi",
    groupName: "Guruh",
    positionName: "Lavozim",
    roleStatus: "Rol holati",
    permissions: "Bo'limlar bo'yicha ruxsatlar",
    section: "Bo'lim",
    actions: "Amallar",
    noRoles: "Rollar topilmadi",
    noAccess: "Rollar bo'limiga ruxsat yo'q",
    requiredName: "Rol nomini kiriting",
    save: "Saqlash",
    cancel: "Bekor qilish",
    update: "Yangilash"
  },
  en: {
    title: "Roles",
    subtitle: "Staff roles and section permissions",
    search: "Search",
    status: "Status",
    allStatuses: "All",
    active: "Active",
    inactive: "Inactive",
    createRole: "Create role",
    editRole: "Edit role",
    roleName: "Role name",
    groupName: "Group",
    positionName: "Position",
    roleStatus: "Role status",
    permissions: "Section permissions",
    section: "Section",
    actions: "Actions",
    noRoles: "No roles found",
    noAccess: "No access to roles section",
    requiredName: "Role name is required",
    save: "Save",
    cancel: "Cancel",
    update: "Update"
  }
};

function text(lang, key) {
  const dict = UI[lang] || UI.ru;
  return dict[key] || UI.ru[key] || key;
}

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labelFromI18n(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru || value.en || "";
}

function sectionLabel(section, lang) {
  return labelFromI18n(section?.label, lang) || section?.key || section?.id || "";
}

function groupLabel(section, lang) {
  return labelFromI18n(section?.group, lang);
}

function normalizeRole(item) {
  return {
    id: Number(item?.id || 0),
    name: String(item?.name || ""),
    group_name: String(item?.group_name || ""),
    position_name: String(item?.position_name || ""),
    is_active: Number(item?.is_active || 0),
    created_at: Number(item?.created_at || 0),
    updated_at: Number(item?.updated_at || 0)
  };
}

function roleStatusBadge(role, lang) {
  if (Number(role.is_active) === 1) {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">${esc(text(lang, "active"))}</span>`;
  }
  return `<span class="badge text-bg-secondary">${esc(text(lang, "inactive"))}</span>`;
}

function modulePermissionsList(state, currentSectionId, lang) {
  const out = [];
  const used = new Set();

  for (const section of state.sections || []) {
    if (!section?.id || section.id === currentSectionId || used.has(section.id)) continue;

    const isRoot = section.id.endsWith("_root");
    if (isRoot) {
      const hasChildren = (state.sections || []).some(s => s.groupId === section.groupId && s.id !== section.id);
      if (hasChildren) continue;
    }

    used.add(section.id);
    out.push({
      id: section.id,
      label: sectionLabel(section, lang),
      group: groupLabel(section, lang)
    });
  }
  return out;
}

function permissionGridHtml(modules, selected, lang) {
  const sectionsHtml = modules.map(mod => {
    const actionCells = ROLE_ACTIONS.map(a => {
      const key = `${mod.id}.${a.code}`;
      return `<td class="text-center">
        <input type="checkbox" class="form-check-input" data-perm="${esc(key)}" ${selected.has(key) ? "checked" : ""}>
      </td>`;
    }).join("");

    return `<tr>
      <td>
        <div class="fw-semibold">${esc(mod.label)}</div>
        <div class="text-muted small">${esc(mod.group || "")}</div>
      </td>
      ${actionCells}
    </tr>`;
  }).join("");

  return `
    <div class="roles-perm-wrap border rounded-3 p-2">
      <div class="table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead class="table-light sticky-top">
            <tr>
              <th>${esc(text(lang, "section"))}</th>
              ${ROLE_ACTIONS.map(a => `<th class="text-center">${esc(labelFromI18n(a.label, lang))}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${sectionsHtml}</tbody>
        </table>
      </div>
    </div>
  `;
}

function roleModalHtml(role, modules, selectedPerms, lang, fields) {
  return `
    <div class="row g-3">
      ${fields.showInForm("name") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "roleName"))}</label>
          <input class="form-control" name="name" value="${esc(role.name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("group_name") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "groupName"))}</label>
          <input class="form-control" name="group_name" value="${esc(role.group_name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("position_name") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "positionName"))}</label>
          <input class="form-control" name="position_name" value="${esc(role.position_name || "")}">
        </div>
      ` : ""}
      ${fields.showInForm("is_active") ? `
        <div class="col-md-4">
          <label class="form-label">${esc(text(lang, "roleStatus"))}</label>
          <select class="form-select" name="is_active">
            <option value="1" ${Number(role.is_active ?? 1) === 1 ? "selected" : ""}>${esc(text(lang, "active"))}</option>
            <option value="0" ${Number(role.is_active ?? 1) === 0 ? "selected" : ""}>${esc(text(lang, "inactive"))}</option>
          </select>
        </div>
      ` : ""}
      <div class="col-12">
        <label class="form-label fw-semibold">${esc(text(lang, "permissions"))}</label>
        ${permissionGridHtml(modules, selectedPerms, lang)}
      </div>
    </div>
  `;
}

function readRoleForm(modalEl) {
  const byName = (name) => modalEl.querySelector(`[name="${name}"]`);
  const readText = (name) => String(byName(name)?.value || "").trim();
  const permissions = [];

  modalEl.querySelectorAll("[data-perm]").forEach(el => {
    if (el.checked) permissions.push(String(el.dataset.perm || ""));
  });

  return {
    name: readText("name"),
    group_name: readText("group_name") || null,
    position_name: readText("position_name") || null,
    is_active: Number(byName("is_active")?.value || 1),
    permissions: permissions.filter(Boolean)
  };
}

function filteredItems(items, q, status, filterableFields) {
  const qx = String(q || "").toLowerCase();
  const fields = (filterableFields || []).length ? filterableFields : ["name", "group_name", "position_name"];
  return items.filter(item => {
    if (status !== "all" && Number(item.is_active) !== Number(status)) return false;
    if (!qx) return true;
    return fields.some((key) => String(item?.[key] || "").toLowerCase().includes(qx));
  });
}

function desktopTableHtml(items, lang, fields) {
  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              ${fields.showInList("name") ? `<th>${esc(text(lang, "roleName"))}</th>` : ""}
              ${fields.showInList("group_name") ? `<th>${esc(text(lang, "groupName"))}</th>` : ""}
              ${fields.showInList("position_name") ? `<th>${esc(text(lang, "positionName"))}</th>` : ""}
              ${fields.showInList("is_active") ? `<th style="width:120px">${esc(text(lang, "status"))}</th>` : ""}
              <th style="width:120px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(role => `
              <tr>
                ${fields.showInList("name") ? `<td class="fw-semibold">${esc(role.name)}</td>` : ""}
                ${fields.showInList("group_name") ? `<td>${esc(role.group_name || "-")}</td>` : ""}
                ${fields.showInList("position_name") ? `<td>${esc(role.position_name || "-")}</td>` : ""}
                ${fields.showInList("is_active") ? `<td>${roleStatusBadge(role, lang)}</td>` : ""}
                <td>
                  <button class="btn btn-sm btn-outline-primary" data-edit-role="${role.id}">${esc(text(lang, "update"))}</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function mobileCardsHtml(items, lang, fields) {
  return `
    <div class="d-lg-none">
      ${items.map(role => `
        <div class="card mb-2 shadow-sm">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                ${fields.showInCard("name") ? `<div class="fw-semibold">${esc(role.name)}</div>` : ""}
              </div>
              ${fields.showInCard("is_active") ? roleStatusBadge(role, lang) : ""}
            </div>
            ${fields.showInCard("group_name") ? `<div class="small text-muted mt-2">${esc(text(lang, "groupName"))}: ${esc(role.group_name || "-")}</div>` : ""}
            ${fields.showInCard("position_name") ? `<div class="small text-muted">${esc(text(lang, "positionName"))}: ${esc(role.position_name || "-")}</div>` : ""}
            <button class="btn btn-sm btn-outline-primary mt-3" data-edit-role="${role.id}">${esc(text(lang, "update"))}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

async function openRoleModal(ctx, role, modules, lang, fields) {
  const { api, openModal } = ctx;
  const isCreate = !role?.id;
  let selected = new Set();

  if (!isCreate) {
    const permsResp = await api(`/roles/${role.id}/permissions`);
    selected = new Set(permsResp.permissions || []);
  }

  openModal({
    title: isCreate ? text(lang, "createRole") : text(lang, "editRole"),
    saveText: text(lang, "save"),
    bodyHtml: roleModalHtml(role || { is_active: 1 }, modules, selected, lang, fields),
    onSave: async (modalEl) => {
      const payload = readRoleForm(modalEl);
      const roleBody = stripDisabledFields({
        name: payload.name,
        group_name: payload.group_name,
        position_name: payload.position_name,
        is_active: payload.is_active
      }, fields);
      if (fields.isRequired("name") && isEmptyFieldValue(roleBody.name)) throw new Error(text(lang, "requiredName"));

      let roleId = role?.id || null;

      if (isCreate) {
        const created = await api("/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roleBody)
        });
        roleId = created?.item?.id;
      } else {
        await api(`/roles/${roleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roleBody)
        });
      }

      await api(`/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: payload.permissions })
      });

      await render(ctx);
    }
  });
}

export async function render(ctx) {
  const { page, viewEl, state, section, api } = ctx;
  const lang = langOf();

  page(text(lang, "title"), text(lang, "subtitle"), { raw: true });

  if (!["business_owner", "super_admin"].includes(String(state?.me?.role || ""))) {
    viewEl.innerHTML = `<div class="alert alert-warning mb-0">${esc(text(lang, "noAccess"))}</div>`;
    return;
  }

  const q = viewEl.getAttribute("data-q") || "";
  const status = viewEl.getAttribute("data-status") || "all";
  const modules = modulePermissionsList(state, section?.id || "", lang);

  let rolesResp;
  let fields;
  try {
    [rolesResp, fields] = await Promise.all([
      api("/roles"),
      loadEntityFieldAccess(api, "roles")
    ]);
  } catch (e) {
    viewEl.innerHTML = `<div class="alert alert-danger mb-0">${esc(String(e?.message || e))}</div>`;
    return;
  }

  const allRoles = (rolesResp.items || []).map(normalizeRole);
  const showSearch = ["name", "group_name", "position_name"].some((key) => fields.showInFilters(key));
  const filterableFields = ["name", "group_name", "position_name"].filter((key) => fields.showInFilters(key));
  const items = filteredItems(allRoles, q, status, filterableFields);

  viewEl.innerHTML = `
    <div class="card mb-3 roles-toolbar">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          ${showSearch ? `
            <div class="col-12 col-md-6 col-lg-5">
              <label class="form-label">${esc(text(lang, "search"))}</label>
              <input id="roles_q" class="form-control" value="${esc(q)}">
            </div>
          ` : ""}
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label">${esc(text(lang, "status"))}</label>
            <select id="roles_status" class="form-select">
              <option value="all" ${status === "all" ? "selected" : ""}>${esc(text(lang, "allStatuses"))}</option>
              <option value="1" ${status === "1" ? "selected" : ""}>${esc(text(lang, "active"))}</option>
              <option value="0" ${status === "0" ? "selected" : ""}>${esc(text(lang, "inactive"))}</option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-4 d-grid">
            <button id="roles_create" class="btn btn-primary">${esc(text(lang, "createRole"))}</button>
          </div>
        </div>
      </div>
    </div>

    ${items.length ? desktopTableHtml(items, lang, fields) : `<div class="alert alert-light border mb-2">${esc(text(lang, "noRoles"))}</div>`}
    ${items.length ? mobileCardsHtml(items, lang, fields) : ""}
  `;

  const queueRender = () => {
    clearTimeout(viewEl.__rolesTimer);
    viewEl.__rolesTimer = setTimeout(() => render(ctx), 180);
  };

  if (showSearch) {
    const qEl = document.getElementById("roles_q");
    qEl.addEventListener("input", () => {
      viewEl.setAttribute("data-q", qEl.value.trim());
      queueRender();
    });
  } else {
    viewEl.setAttribute("data-q", "");
  }

  document.getElementById("roles_status").addEventListener("change", () => {
    viewEl.setAttribute("data-status", document.getElementById("roles_status").value);
    queueRender();
  });

  document.getElementById("roles_create").onclick = () => openRoleModal(ctx, null, modules, lang, fields);

  document.querySelectorAll("[data-edit-role]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editRole);
      const role = allRoles.find(x => x.id === id);
      if (!role) return;
      openRoleModal(ctx, role, modules, lang, fields);
    });
  });
}
