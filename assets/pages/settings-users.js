import { bindPager, fg, pagerHtml, queueRender, sectionTitle } from "./mvp-utils.js";

const ROLES = ["business_owner", "branch_manager", "sales", "warehouse", "cashier", "analyst"];

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function options(items, selected = []) {
  const set = new Set((selected || []).map((x) => String(x)));
  return (items || []).map((item) => `<option value="${item.id}" ${set.has(String(item.id)) ? "selected" : ""}>${esc(item.name)}</option>`).join("");
}

function badgeActive(v) {
  return Number(v) === 1
    ? '<span class="badge text-bg-success-subtle border border-success-subtle">Активный</span>'
    : '<span class="badge text-bg-secondary">Неактивный</span>';
}

function userFormHtml(filials, item = {}, isCreate = false) {
  const selectedFilials = Array.isArray(item.filial_ids) ? item.filial_ids : [];
  return `
    <div class="row">
      <div class="col-md-6">${fg("ФИО", `<input name="full_name" class="form-control" value="${esc(item.full_name || "")}">`)}</div>
      <div class="col-md-6">${fg("Login", `<input name="email" class="form-control" value="${esc(item.email || "")}">`)}</div>
      <div class="col-md-6">${fg("Телефон", `<input name="phone" class="form-control" value="${esc(item.phone || "")}">`)}</div>
      <div class="col-md-6">${fg("Роль", `<select name="role" class="form-select">${ROLES.map((role) => `<option value="${role}" ${String(item.role || "branch_manager") === role ? "selected" : ""}>${role}</option>`).join("")}</select>`)}</div>
      <div class="col-md-6">${fg("Все филиалы", `<select name="can_all_filials" class="form-select"><option value="1" ${Number(item.can_all_filials || 0) === 1 ? "selected" : ""}>Да</option><option value="0" ${Number(item.can_all_filials || 0) === 0 ? "selected" : ""}>Нет</option></select>`)}</div>
      <div class="col-md-6">${fg("Активный", `<select name="is_active" class="form-select"><option value="1" ${Number(item.is_active ?? 1) === 1 ? "selected" : ""}>Да</option><option value="0" ${Number(item.is_active ?? 1) === 0 ? "selected" : ""}>Нет</option></select>`)}</div>
      <div class="col-12">${fg("Доступные филиалы", `<select name="filial_ids" class="form-select" multiple size="${Math.min(8, Math.max(4, filials.length || 4))}">${options(filials, selectedFilials)}</select><div class="form-text">Можно выбрать несколько филиалов</div>`)}</div>
      ${isCreate ? `<div class="col-md-6">${fg("Пароль", `<input name="password" type="password" class="form-control">`)}</div>` : `<div class="col-md-6">${fg("Новый пароль", `<input name="password" type="password" class="form-control" placeholder="Оставьте пустым, если менять не нужно">`)}</div>`}
    </div>
  `;
}

function readForm(root) {
  const get = (name) => root.querySelector(`[name="${name}"]`);
  return {
    full_name: get("full_name").value.trim(),
    email: get("email").value.trim(),
    phone: get("phone").value.trim(),
    role: get("role").value,
    can_all_filials: Number(get("can_all_filials").value || 0),
    is_active: Number(get("is_active").value || 1),
    filial_ids: Array.from(get("filial_ids").selectedOptions).map((opt) => Number(opt.value)),
    password: get("password").value,
  };
}

function formatLastLogin(ts) {
  return ts ? new Date(ts * 1000).toLocaleString() : "-";
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, openModal } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });
  const canWrite = accessFor(state.me.role).settings_users.write;

  const filters = {
    q: viewEl.dataset.q || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };
  const qs = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);

  const [usersResp, filialsResp] = await Promise.all([
    api(`/users?${qs.toString()}`),
    api("/filials?page=1&page_size=100")
  ]);
  const items = usersResp.items || [];
  const pagination = usersResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const filials = filialsResp.items || [];

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="entity-toolbar-shell">
        <div class="entity-toolbar-main">
          <div class="entity-toolbar-item entity-toolbar-search">
            <label class="form-label">Поиск</label>
            <input id="users_q" class="form-control" value="${esc(filters.q)}">
          </div>
        </div>
        ${canWrite ? `<div class="entity-toolbar-actions"><button id="users_create" class="btn btn-primary entity-toolbar-btn">Создать</button></div>` : ``}
      </div>
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr><th>ФИО</th><th>Login</th><th>Телефон</th><th>Роль</th><th>Филиалы</th><th>Последний вход</th><th>Статус</th>${canWrite ? "<th>Действия</th>" : ""}</tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${esc(item.full_name)}</td>
              <td>${esc(item.email)}</td>
              <td>${esc(item.phone || "")}</td>
              <td>${esc(item.role)}</td>
              <td>${Number(item.can_all_filials) === 1 ? "Все" : esc((item.filial_ids || []).map((id) => filials.find((row) => Number(row.id) === Number(id))?.name || id).join(", "))}</td>
              <td>${esc(formatLastLogin(item.last_login_at))}</td>
              <td>${badgeActive(item.is_active)}</td>
              ${canWrite ? `<td><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></td>` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${pagerHtml(pagination)}
    </div></div>

    <div class="d-lg-none">
      ${items.map((item) => `
        <div class="card entity-mobile-card mb-2 shadow-sm">
          <div class="card-body">
            <div class="fw-semibold">${esc(item.full_name)}</div>
            <div class="small text-muted mt-2">Login: ${esc(item.email)}</div>
            <div class="small text-muted">Телефон: ${esc(item.phone || "-")}</div>
            <div class="small text-muted">Роль: ${esc(item.role)}</div>
            <div class="small text-muted">Филиалы: ${Number(item.can_all_filials) === 1 ? "Все" : esc((item.filial_ids || []).map((id) => filials.find((row) => Number(row.id) === Number(id))?.name || id).join(", ") || "-")}</div>
            <div class="small text-muted">Последний вход: ${esc(formatLastLogin(item.last_login_at))}</div>
            <div class="small text-muted">${badgeActive(item.is_active)}</div>
            ${canWrite ? `<div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></div>` : ""}
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  const qEl = viewEl.querySelector("#users_q");
  qEl?.addEventListener("input", () => {
    viewEl.dataset.q = qEl.value.trim();
    queueRender(viewEl, "__usersTimer", () => {
      viewEl.dataset.page = "1";
      render(ctx);
    });
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    render(ctx);
  });

  if (!canWrite) return;

  viewEl.querySelector("#users_create")?.addEventListener("click", () => {
    openModal({
      title: "Создать пользователя",
      bodyHtml: userFormHtml(filials, { role: "branch_manager", can_all_filials: 0, is_active: 1 }, true),
      onSave: async (modalEl) => {
        const payload = readForm(modalEl);
        await api("/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        await render(ctx);
      }
    });
  });

  viewEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = items.find((row) => Number(row.id) === Number(btn.getAttribute("data-edit")));
      if (!item) return;
      openModal({
        title: "Изменить пользователя",
        bodyHtml: userFormHtml(filials, item, false),
        onSave: async (modalEl) => {
          const payload = readForm(modalEl);
          const { password, ...patch } = payload;
          await api(`/users/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch)
          });
          if (password && password.length >= 8) {
            await api(`/users/${item.id}/password`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password })
            });
          }
          await render(ctx);
        }
      });
    });
  });
}
