const ROLES = ["super_admin", "gekto_viewer", "business_owner", "branch_manager", "sales", "warehouse", "cashier", "analyst"];

function e(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function fg(label, control) {
  return `<div class="mb-3"><label class="form-label">${label}</label>${control}</div>`;
}

function userFormHtml(businesses, item = {}, scope = "gekto") {
  const isCreate = !item.id;
  const role = item.role || (scope === "gekto" ? "gekto_viewer" : "business_owner");
  const businessId = item.business_id ?? "";
  const roleOptions = (scope === "gekto" ? ["super_admin", "gekto_viewer"] : ROLES.filter(x => !["super_admin", "gekto_viewer"].includes(x)))
    .map(v => `<option value="${v}" ${role === v ? "selected" : ""}>${v}</option>`).join("");
  return `
    <div class="row">
      <div class="col-md-6">${fg("Full name", `<input name="full_name" class="form-control" value="${e(item.full_name)}">`)}</div>
      <div class="col-md-6">${fg("Login", `<input name="email" class="form-control" value="${e(item.email)}">`)}</div>
      <div class="col-md-6">${fg("Phone", `<input name="phone" class="form-control" value="${e(item.phone)}">`)}</div>
      <div class="col-md-6">${fg("Role", `<select name="role" class="form-select">${roleOptions}</select>`)}</div>
      ${scope === "businesses" ? `<div class="col-md-6">${fg("Business", `<select name="business_id" class="form-select">${(businesses || []).map(b => `<option value="${b.id}" ${Number(businessId) === Number(b.id) ? "selected" : ""}>${e(b.name)}</option>`).join("")}</select>`)}</div>` : ""}
      ${isCreate ? `<div class="col-md-6">${fg("Password", `<input name="password" type="password" class="form-control">`)}</div>` : ""}
      ${!isCreate ? `<div class="col-md-6">${fg("New password (optional)", `<input name="new_password" type="password" class="form-control">`)}</div>` : ""}
      <div class="col-md-6">${fg("Active", `<select name="is_active" class="form-select"><option value="1" ${Number(item.is_active ?? 1) === 1 ? "selected" : ""}>1</option><option value="0" ${Number(item.is_active ?? 1) === 0 ? "selected" : ""}>0</option></select>`)}</div>
    </div>`;
}

function readForm(root, scope) {
  const g = (n) => root.querySelector(`[name="${n}"]`);
  return {
    full_name: g("full_name").value.trim(),
    email: g("email").value.trim(),
    phone: g("phone").value.trim(),
    role: g("role").value,
    business_id: scope === "businesses" ? Number(g("business_id").value) : null,
    password: g("password") ? g("password").value : null,
    new_password: g("new_password") ? g("new_password").value : "",
    is_active: Number(g("is_active").value)
  };
}

function statusBadge(isActive, t) {
  if (Number(isActive) === 1) {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">${e(t("active"))}</span>`;
  }
  return `<span class="badge text-bg-secondary">${e(t("blocked"))}</span>`;
}

function formatLastLogin(ts) {
  return ts ? new Date(ts * 1000).toLocaleString() : "-";
}

function desktopTableHtml(items, scope, canWrite, t, esc) {
  return `
    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr>
          <th>${t("fullName")}</th><th>${t("email")}</th><th>${t("phone")}</th><th>${t("role")}</th>
          ${scope === "businesses" ? `<th>${t("business")}</th><th>${t("lastLogin")}</th>` : ""}
          <th>${t("status")}</th>${canWrite ? `<th>${t("action")}</th>` : ""}
        </tr></thead>
        <tbody>${items.map(u => `<tr>
          <td>${esc(u.full_name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone || "")}</td><td>${esc(u.role)}</td>
          ${scope === "businesses" ? `<td>${esc(u.business_name || "")}</td><td>${esc(formatLastLogin(u.last_login_at))}</td>` : ""}
          <td>${statusBadge(u.is_active, t)}</td>
          ${canWrite ? `<td><button class="btn btn-sm btn-outline-primary" data-edit="${u.id}">${t("edit")}</button></td>` : ""}
        </tr>`).join("")}</tbody>
      </table>
    </div></div>`;
}

function mobileCardsHtml(items, scope, canWrite, t, esc) {
  return `
    <div class="d-lg-none">
      ${items.map(u => `
        <div class="card mb-2 shadow-sm">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div>
                <div class="fw-semibold">${esc(u.full_name)}</div>
                <div class="text-muted small">${esc(u.email)}</div>
              </div>
              ${statusBadge(u.is_active, t)}
            </div>
            <div class="small text-muted mt-2">${t("phone")}: ${esc(u.phone || "-")}</div>
            <div class="small text-muted">${t("role")}: ${esc(u.role)}</div>
            ${scope === "businesses" ? `<div class="small text-muted">${t("business")}: ${esc(u.business_name || "-")}</div>` : ""}
            ${scope === "businesses" ? `<div class="small text-muted">${t("lastLogin")}: ${esc(formatLastLogin(u.last_login_at))}</div>` : ""}
            ${canWrite ? `<div class="d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${u.id}">${t("edit")}</button></div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>`;
}

export async function render(ctx) {
  const { page, t, api, esc, viewEl, state, accessFor, openModal } = ctx;
  page("users");
  const canWrite = accessFor(state.me.role).users.write;

  const scope = viewEl.getAttribute("data-scope") || "gekto";
  const q = viewEl.getAttribute("data-q") || "";
  const [users, businesses] = await Promise.all([
    api(`/gekto/users?scope=${scope}${q ? `&q=${encodeURIComponent(q)}` : ""}`),
    api("/gekto/businesses")
  ]);
  const items = users.items || [];

  viewEl.innerHTML = `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-6 col-md-2 d-grid"><button id="tab_gekto" class="btn ${scope === "gekto" ? "btn-secondary" : "btn-outline-secondary"}">Gekto</button></div>
        <div class="col-6 col-md-2 d-grid"><button id="tab_biz" class="btn ${scope === "businesses" ? "btn-secondary" : "btn-outline-secondary"}">Businesses</button></div>
        <div class="col-12 col-md-5"><label class="form-label">Search</label><input id="u_q" class="form-control" value="${esc(q)}"></div>
        ${canWrite ? `<div class="col-12 col-md-2 d-grid"><button id="u_create" class="btn btn-primary">${t("create")}</button></div>` : ""}
      </div>
    </div></div>
    ${desktopTableHtml(items, scope, canWrite, t, esc)}
    ${mobileCardsHtml(items, scope, canWrite, t, esc)}`;

  document.getElementById("tab_gekto").onclick = () => {
    viewEl.setAttribute("data-scope", "gekto");
    render(ctx);
  };
  document.getElementById("tab_biz").onclick = () => {
    viewEl.setAttribute("data-scope", "businesses");
    render(ctx);
  };
  const qEl = document.getElementById("u_q");
  qEl.addEventListener("input", () => {
    const next = qEl.value.trim();
    if (next.length !== 0 && next.length < 3) return;
    viewEl.setAttribute("data-q", next);
    clearTimeout(viewEl.__fltTimer);
    viewEl.__fltTimer = setTimeout(() => render(ctx), 220);
  });

  if (!canWrite) return;

  document.getElementById("u_create").onclick = () => openModal({
    title: t("create"),
    bodyHtml: userFormHtml(businesses.items || [], {}, scope),
    onSave: async (modalEl) => {
      const payload = readForm(modalEl, scope);
      await api("/gekto/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
          role: payload.role,
          business_id: scope === "businesses" ? payload.business_id : null,
          is_active: payload.is_active
        })
      });
      await render(ctx);
    }
  });

  document.querySelectorAll("[data-edit]").forEach(btn => btn.onclick = () => {
    const id = Number(btn.dataset.edit);
    const item = items.find(x => x.id === id);
    if (!item) return;
    openModal({
      title: t("edit"),
      bodyHtml: userFormHtml(businesses.items || [], item, scope),
      onSave: async (modalEl) => {
        const payload = readForm(modalEl, scope);
        await api("/gekto/users/" + id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: payload.full_name,
            email: payload.email,
            phone: payload.phone,
            role: payload.role,
            business_id: scope === "businesses" ? payload.business_id : null,
            is_active: payload.is_active
          })
        });
        if (payload.new_password && payload.new_password.length >= 8) {
          await api("/gekto/users/" + id + "/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: payload.new_password })
          });
        }
        await render(ctx);
      }
    });
  });
}
