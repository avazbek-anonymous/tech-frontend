import {
  activeBadge,
  emptyHtml,
  errorHtml,
  esc,
  formatTs,
  langOf,
  noAccessHtml,
  pick,
  queueRerender
} from "./settings-utils.js";

const UI = {
  ru: {
    title: "Настройки: Пользователи",
    subtitle: "Сотрудники бизнеса, роли и доступ к филиалам",
    noAccess: "Раздел пользователей доступен только владельцу бизнеса",
    search: "Поиск",
    createUser: "Создать пользователя",
    editUser: "Редактировать пользователя",
    noItems: "Пользователи не найдены",
    fullName: "ФИО",
    email: "Логин",
    systemRole: "Системная роль",
    permissionRole: "Роль доступа",
    filials: "Филиалы",
    allFilials: "Доступ ко всем филиалам",
    lastLogin: "Последний вход",
    status: "Статус",
    actions: "Действия",
    active: "Активен",
    inactive: "Неактивен",
    save: "Сохранить",
    update: "Изменить",
    password: "Пароль",
    passwordNew: "Новый пароль",
    resetPassword: "Сбросить пароль",
    fullNameRequired: "Укажите ФИО",
    emailRequired: "Укажите логин",
    passwordMin: "Пароль должен быть не короче 8 символов",
    roleRequired: "Для сотрудника нужно выбрать роль доступа",
    filialRequired: "Выберите хотя бы один филиал",
    business_owner: "Владелец бизнеса",
    branch_manager: "Менеджер филиала",
    sales: "Продажи",
    warehouse: "Склад",
    cashier: "Кассир",
    analyst: "Аналитик",
    noRole: "Без роли",
    noFilials: "Все филиалы"
  },
  uz: {
    title: "Sozlamalar: Foydalanuvchilar",
    subtitle: "Biznes xodimlari, rollar va filiallarga kirish",
    noAccess: "Foydalanuvchilar bo'limi faqat biznes egasi uchun ochiq",
    search: "Qidiruv",
    createUser: "Foydalanuvchi yaratish",
    editUser: "Foydalanuvchini tahrirlash",
    noItems: "Foydalanuvchilar topilmadi",
    fullName: "F.I.Sh.",
    email: "Login",
    systemRole: "Tizim roli",
    permissionRole: "Ruxsat roli",
    filials: "Filiallar",
    allFilials: "Barcha filiallarga kirish",
    lastLogin: "Oxirgi kirish",
    status: "Holat",
    actions: "Amallar",
    active: "Faol",
    inactive: "Faol emas",
    save: "Saqlash",
    update: "Yangilash",
    password: "Parol",
    passwordNew: "Yangi parol",
    resetPassword: "Parolni almashtirish",
    fullNameRequired: "F.I.Sh. kiriting",
    emailRequired: "Login kiriting",
    passwordMin: "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
    roleRequired: "Xodim uchun ruxsat roli tanlanishi kerak",
    filialRequired: "Kamida bitta filial tanlang",
    business_owner: "Biznes egasi",
    branch_manager: "Filial menejeri",
    sales: "Savdo",
    warehouse: "Ombor",
    cashier: "Kassir",
    analyst: "Analitik",
    noRole: "Rolsiz",
    noFilials: "Barcha filiallar"
  },
  en: {
    title: "Settings: Users",
    subtitle: "Business staff, roles, and branch access",
    noAccess: "Users settings are available only to the business owner",
    search: "Search",
    createUser: "Create user",
    editUser: "Edit user",
    noItems: "No users found",
    fullName: "Full name",
    email: "Login",
    systemRole: "System role",
    permissionRole: "Permission role",
    filials: "Branches",
    allFilials: "Access to all branches",
    lastLogin: "Last login",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    save: "Save",
    update: "Update",
    password: "Password",
    passwordNew: "New password",
    resetPassword: "Reset password",
    fullNameRequired: "Full name is required",
    emailRequired: "Login is required",
    passwordMin: "Password must be at least 8 characters",
    roleRequired: "Select a permission role for the employee",
    filialRequired: "Select at least one branch",
    business_owner: "Business owner",
    branch_manager: "Branch manager",
    sales: "Sales",
    warehouse: "Warehouse",
    cashier: "Cashier",
    analyst: "Analyst",
    noRole: "No role",
    noFilials: "All branches"
  }
};

const ROLE_ORDER = ["business_owner", "branch_manager", "sales", "warehouse", "cashier", "analyst"];

function text(lang, key) {
  return pick(UI, lang, key);
}

function normalizeUser(item) {
  return {
    id: Number(item?.id || 0),
    email: String(item?.email || ""),
    full_name: String(item?.full_name || ""),
    role: String(item?.role || "branch_manager"),
    role_id: item?.role_id ? Number(item.role_id) : null,
    can_all_filials: Number(item?.can_all_filials || 0),
    is_active: Number(item?.is_active || 0),
    last_login_at: Number(item?.last_login_at || 0)
  };
}

function roleLabel(lang, role) {
  return text(lang, role) || role;
}

function roleOptionsHtml(lang, value) {
  return ROLE_ORDER.map(role => (
    `<option value="${role}" ${role === value ? "selected" : ""}>${esc(roleLabel(lang, role))}</option>`
  )).join("");
}

function permissionRoleOptionsHtml(lang, roles, value) {
  return [
    `<option value="">${esc(text(lang, "noRole"))}</option>`,
    ...roles.map(role => (
      `<option value="${role.id}" ${Number(value) === Number(role.id) ? "selected" : ""}>${esc(role.name)}</option>`
    ))
  ].join("");
}

function filialChecksHtml(filials, selectedIds) {
  const selected = new Set((selectedIds || []).map(Number));
  return filials.map(filial => (
    `<label class="form-check d-flex align-items-center gap-2 mb-2">
      <input class="form-check-input" type="checkbox" value="${filial.id}" data-filial ${selected.has(Number(filial.id)) ? "checked" : ""}>
      <span>${esc(filial.name)}</span>
    </label>`
  )).join("");
}

function userModalHtml(lang, user, roles, filials, selectedFilials, isCreate) {
  const currentRole = user?.role || "branch_manager";
  return `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "fullName"))}</label>
        <input class="form-control" name="full_name" value="${esc(user?.full_name || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "email"))}</label>
        <input class="form-control" name="email" value="${esc(user?.email || "")}" ${isCreate ? "" : "disabled"}>
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "systemRole"))}</label>
        <select class="form-select" name="role">
          ${roleOptionsHtml(lang, currentRole)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "permissionRole"))}</label>
        <select class="form-select" name="role_id">
          ${permissionRoleOptionsHtml(lang, roles, user?.role_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(isCreate ? text(lang, "password") : text(lang, "passwordNew"))}</label>
        <input class="form-control" name="password" type="password" placeholder="${isCreate ? "" : "Optional"}">
      </div>
      <div class="col-md-6">
        <label class="form-label">${esc(text(lang, "status"))}</label>
        <select class="form-select" name="is_active">
          <option value="1" ${Number(user?.is_active ?? 1) === 1 ? "selected" : ""}>${esc(text(lang, "active"))}</option>
          <option value="0" ${Number(user?.is_active ?? 1) === 0 ? "selected" : ""}>${esc(text(lang, "inactive"))}</option>
        </select>
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" name="can_all_filials" ${Number(user?.can_all_filials || 0) === 1 ? "checked" : ""}>
          <label class="form-check-label">${esc(text(lang, "allFilials"))}</label>
        </div>
      </div>
      <div class="col-12" data-filials-wrap>
        <label class="form-label">${esc(text(lang, "filials"))}</label>
        <div class="border rounded-3 p-3">
          ${filials.length ? filialChecksHtml(filials, selectedFilials) : `<div class="text-muted small mb-0">-</div>`}
        </div>
      </div>
    </div>
  `;
}

function readUserForm(modalEl) {
  const checked = Array.from(modalEl.querySelectorAll("[data-filial]:checked")).map(el => Number(el.value));
  return {
    full_name: modalEl.querySelector("[name='full_name']").value.trim(),
    email: modalEl.querySelector("[name='email']").value.trim(),
    role: modalEl.querySelector("[name='role']").value,
    role_id: modalEl.querySelector("[name='role_id']").value ? Number(modalEl.querySelector("[name='role_id']").value) : null,
    password: modalEl.querySelector("[name='password']").value,
    is_active: Number(modalEl.querySelector("[name='is_active']").value || 1),
    can_all_filials: modalEl.querySelector("[name='can_all_filials']").checked ? 1 : 0,
    filial_ids: checked
  };
}

function syncFilialsState(modalEl, role) {
  const allEl = modalEl.querySelector("[name='can_all_filials']");
  const wrap = modalEl.querySelector("[data-filials-wrap]");
  if (!allEl || !wrap) return;

  const disabled = role === "business_owner" || allEl.checked;
  wrap.style.opacity = disabled ? "0.55" : "1";
  wrap.querySelectorAll("[data-filial]").forEach(el => {
    el.disabled = disabled;
  });
}

function filteredItems(items, roles, q) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle) return items;
  return items.filter(item => {
    const roleName = roles.find(role => Number(role.id) === Number(item.role_id))?.name || "";
    return [item.email, item.full_name, item.role, roleName].some(v => String(v || "").toLowerCase().includes(needle));
  });
}

function desktopTableHtml(items, roles, filials, lang) {
  const filialById = new Map(filials.map(item => [Number(item.id), item.name]));
  return `
    <div class="card d-none d-lg-block">
      <div class="card-body table-wrap">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width:72px">ID</th>
              <th>${esc(text(lang, "fullName"))}</th>
              <th>${esc(text(lang, "email"))}</th>
              <th style="width:160px">${esc(text(lang, "systemRole"))}</th>
              <th style="width:190px">${esc(text(lang, "permissionRole"))}</th>
              <th style="width:150px">${esc(text(lang, "filials"))}</th>
              <th style="width:170px">${esc(text(lang, "lastLogin"))}</th>
              <th style="width:110px">${esc(text(lang, "status"))}</th>
              <th style="width:190px">${esc(text(lang, "actions"))}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const assignedFilials = Number(item.can_all_filials) === 1
                ? text(lang, "noFilials")
                : (item.__filial_ids || []).map(id => filialById.get(Number(id)) || `#${id}`).join(", ");
              const permissionRole = roles.find(role => Number(role.id) === Number(item.role_id))?.name || text(lang, "noRole");
              return `
                <tr>
                  <td>${item.id}</td>
                  <td class="fw-semibold">${esc(item.full_name)}</td>
                  <td>${esc(item.email)}</td>
                  <td>${esc(roleLabel(lang, item.role))}</td>
                  <td>${esc(permissionRole)}</td>
                  <td class="small">${esc(assignedFilials || "-")}</td>
                  <td>${esc(formatTs(item.last_login_at, lang))}</td>
                  <td>${activeBadge(item.is_active, { active: text(lang, "active"), inactive: text(lang, "inactive") })}</td>
                  <td>
                    <div class="d-flex gap-2 flex-wrap">
                      <button class="btn btn-sm btn-outline-primary" data-edit-user="${item.id}">${esc(text(lang, "update"))}</button>
                      <button class="btn btn-sm btn-outline-secondary" data-pwd-user="${item.id}">${esc(text(lang, "resetPassword"))}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function mobileCardsHtml(items, roles, filials, lang) {
  const filialById = new Map(filials.map(item => [Number(item.id), item.name]));
  return `
    <div class="d-lg-none">
      ${items.map(item => {
        const permissionRole = roles.find(role => Number(role.id) === Number(item.role_id))?.name || text(lang, "noRole");
        const assignedFilials = Number(item.can_all_filials) === 1
          ? text(lang, "noFilials")
          : (item.__filial_ids || []).map(id => filialById.get(Number(id)) || `#${id}`).join(", ");
        return `
          <div class="card mb-2 shadow-sm">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between gap-2 align-items-start">
                <div>
                  <div class="small text-muted">#${item.id}</div>
                  <div class="fw-semibold">${esc(item.full_name)}</div>
                  <div class="text-muted small">${esc(item.email)}</div>
                </div>
                ${activeBadge(item.is_active, { active: text(lang, "active"), inactive: text(lang, "inactive") })}
              </div>
              <div class="small text-muted mt-2">${esc(text(lang, "systemRole"))}: ${esc(roleLabel(lang, item.role))}</div>
              <div class="small text-muted">${esc(text(lang, "permissionRole"))}: ${esc(permissionRole)}</div>
              <div class="small text-muted">${esc(text(lang, "filials"))}: ${esc(assignedFilials || "-")}</div>
              <div class="small text-muted">${esc(text(lang, "lastLogin"))}: ${esc(formatTs(item.last_login_at, lang))}</div>
              <div class="d-flex gap-2 flex-wrap mt-3">
                <button class="btn btn-sm btn-outline-primary" data-edit-user="${item.id}">${esc(text(lang, "update"))}</button>
                <button class="btn btn-sm btn-outline-secondary" data-pwd-user="${item.id}">${esc(text(lang, "resetPassword"))}</button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function openPasswordModal(ctx, user) {
  const { api, openModal } = ctx;
  const lang = langOf();

  openModal({
    title: `${text(lang, "resetPassword")} #${user.id}`,
    saveText: text(lang, "save"),
    bodyHtml: `
      <div>
        <label class="form-label">${esc(text(lang, "passwordNew"))}</label>
        <input class="form-control" name="password" type="password">
      </div>
    `,
    onSave: async (modalEl) => {
      const password = modalEl.querySelector("[name='password']").value;
      if (String(password).length < 8) throw new Error(text(lang, "passwordMin"));
      await api(`/users/${user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
    }
  });
}

async function openUserModal(ctx, user, roles, filials) {
  const { api, openModal } = ctx;
  const lang = langOf();
  const isCreate = !user?.id;
  let selectedFilials = [];

  if (!isCreate && Number(user.can_all_filials) === 0 && user.role !== "business_owner") {
    try {
      const resp = await api(`/users/${user.id}/filials`);
      selectedFilials = resp.filial_ids || [];
    } catch {}
  }

  openModal({
    title: isCreate ? text(lang, "createUser") : `${text(lang, "editUser")} #${user.id}`,
    saveText: text(lang, "save"),
    bodyHtml: userModalHtml(lang, user, roles, filials, selectedFilials, isCreate),
    onSave: async (modalEl) => {
      const payload = readUserForm(modalEl);

      if (!payload.full_name) throw new Error(text(lang, "fullNameRequired"));
      if (isCreate && !payload.email) throw new Error(text(lang, "emailRequired"));
      if (isCreate && String(payload.password).length < 8) throw new Error(text(lang, "passwordMin"));
      if (!isCreate && payload.password && String(payload.password).length < 8) throw new Error(text(lang, "passwordMin"));

      if (payload.role === "business_owner") {
        payload.role_id = null;
        payload.can_all_filials = 1;
      } else {
        if (!payload.role_id) throw new Error(text(lang, "roleRequired"));
        if (payload.can_all_filials === 0 && payload.filial_ids.length === 0) {
          throw new Error(text(lang, "filialRequired"));
        }
      }

      const userBody = {
        full_name: payload.full_name,
        role: payload.role,
        role_id: payload.role_id,
        can_all_filials: payload.can_all_filials,
        is_active: payload.is_active
      };

      let userId = user?.id || null;
      if (isCreate) {
        const created = await api("/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userBody,
            email: payload.email,
            password: payload.password
          })
        });
        userId = created?.item?.id;
      } else {
        await api(`/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userBody)
        });
      }

      if (!isCreate && payload.password) {
        await api(`/users/${userId}/password`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: payload.password })
        });
      }

      const filial_ids = (payload.role === "business_owner" || payload.can_all_filials === 1) ? [] : payload.filial_ids;
      await api(`/users/${userId}/filials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filial_ids })
      }).catch(() => {});

      await render(ctx);
    }
  });

  const modalEl = document.querySelector(".modal.show, .modal");
  if (!modalEl) return;

  const roleEl = modalEl.querySelector("[name='role']");
  const allEl = modalEl.querySelector("[name='can_all_filials']");
  const onSync = () => syncFilialsState(modalEl, roleEl.value);

  roleEl?.addEventListener("change", onSync);
  allEl?.addEventListener("change", onSync);
  onSync();
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

  let usersResp;
  let rolesResp;
  let filialsResp;
  try {
    [usersResp, rolesResp, filialsResp] = await Promise.all([
      api("/users"),
      api("/roles"),
      api("/filials")
    ]);
  } catch (e) {
    viewEl.innerHTML = errorHtml(String(e?.message || e));
    return;
  }

  const roles = (rolesResp.items || []).filter(role => Number(role.is_active) === 1);
  const filials = (filialsResp.items || []).filter(item => Number(item.is_active) === 1);
  const rawItems = (usersResp.items || []).map(normalizeUser);

  await Promise.all(rawItems.map(async (item) => {
    if (item.role === "business_owner" || Number(item.can_all_filials) === 1) {
      item.__filial_ids = [];
      return;
    }
    try {
      const resp = await api(`/users/${item.id}/filials`);
      item.__filial_ids = resp.filial_ids || [];
    } catch {
      item.__filial_ids = [];
    }
  }));

  const items = filteredItems(rawItems, roles, q);

  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-8 col-lg-9">
            <label class="form-label">${esc(text(lang, "search"))}</label>
            <input id="settings_users_q" class="form-control" value="${esc(q)}">
          </div>
          <div class="col-12 col-md-4 col-lg-3 d-grid">
            <button id="settings_users_create" class="btn btn-primary">${esc(text(lang, "createUser"))}</button>
          </div>
        </div>
      </div>
    </div>

    ${items.length ? desktopTableHtml(items, roles, filials, lang) : emptyHtml(text(lang, "noItems"))}
    ${items.length ? mobileCardsHtml(items, roles, filials, lang) : ""}
  `;

  const qEl = document.getElementById("settings_users_q");
  qEl.addEventListener("input", () => {
    viewEl.setAttribute("data-q", qEl.value.trim());
    queueRerender(viewEl, "__settingsUsersTimer", () => render(ctx), 180);
  });

  document.getElementById("settings_users_create").addEventListener("click", () => {
    openUserModal(ctx, null, roles, filials);
  });

  document.querySelectorAll("[data-edit-user]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editUser);
      const user = rawItems.find(item => item.id === id);
      if (user) openUserModal(ctx, user, roles, filials);
    });
  });

  document.querySelectorAll("[data-pwd-user]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.pwdUser);
      const user = rawItems.find(item => item.id === id);
      if (user) openPasswordModal(ctx, user);
    });
  });
}
