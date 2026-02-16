export async function render(ctx) {
  const { page, t, api, esc, viewEl, state, accessFor } = ctx;
  page("users");
  const canWrite = accessFor(state.me.role).users.write;
  const users = await api("/gekto/users?scope=all");
  const businesses = await api("/gekto/businesses");
  viewEl.innerHTML = `
    ${canWrite ? `<div class="card mb-3"><div class="card-body"><div class="row g-2">
      <div class="col-md-2"><input id="u_name" class="form-control" placeholder="${t("fullName")}"></div>
      <div class="col-md-2"><input id="u_email" class="form-control" placeholder="${t("email")}"></div>
      <div class="col-md-2"><input id="u_phone" class="form-control" placeholder="${t("phone")}"></div>
      <div class="col-md-2"><input id="u_pwd" class="form-control" type="password" placeholder="password"></div>
      <div class="col-md-2"><select id="u_role" class="form-select"><option value="gekto_viewer">gekto_viewer</option><option value="super_admin">super_admin</option><option value="business_owner">business_owner</option></select></div>
      <div class="col-md-2"><select id="u_biz" class="form-select"><option value="">GEKTO</option>${(businesses.items || []).map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></div>
      <div class="col-md-12 d-grid"><button class="btn btn-primary mt-1" id="u_create">${t("create")}</button></div>
    </div></div></div>` : ""}
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>ID</th><th>${t("fullName")}</th><th>${t("email")}</th><th>${t("phone")}</th><th>${t("role")}</th><th>${t("business")}</th><th>${t("lastLogin")}</th><th>${t("status")}</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>${(users.items || []).map(u => `<tr>
          <td>${u.id}</td><td>${esc(u.full_name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone || "")}</td><td>${esc(u.role)}</td><td>${esc(u.business_name || "GEKTO")}</td><td>${u.last_login_at ? new Date(u.last_login_at * 1000).toLocaleString() : "-"}</td><td>${u.is_active ? t("active") : t("blocked")}</td>
          ${canWrite ? `<td><button class="btn btn-xs btn-outline-primary" data-toggle="${u.id}" data-next="${u.is_active ? 0 : 1}">${u.is_active ? t("blocked") : t("active")}</button></td>` : ""}
        </tr>`).join("")}</tbody>
      </table>
    </div></div>`;
  if (canWrite) {
    document.getElementById("u_create").onclick = async () => {
      const role = document.getElementById("u_role").value;
      const bizVal = document.getElementById("u_biz").value;
      await api("/gekto/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: document.getElementById("u_name").value.trim(),
          email: document.getElementById("u_email").value.trim(),
          phone: document.getElementById("u_phone").value.trim(),
          password: document.getElementById("u_pwd").value,
          role,
          business_id: bizVal ? Number(bizVal) : null
        })
      });
      render(ctx);
    };
    document.querySelectorAll("[data-toggle]").forEach(btn => btn.onclick = async () => {
      await api("/gekto/users/" + btn.dataset.toggle, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: Number(btn.dataset.next) })
      });
      render(ctx);
    });
  }
}
