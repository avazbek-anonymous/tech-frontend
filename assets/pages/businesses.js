export async function render(ctx) {
  const { page, t, api, fmt, esc, viewEl, state, accessFor } = ctx;
  page("businesses");
  const canWrite = accessFor(state.me.role).businesses.write;
  const data = await api("/gekto/businesses");
  viewEl.innerHTML = `
    ${canWrite ? `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2">
        <div class="col-md-4"><input class="form-control" id="b_name" placeholder="${t("name")}"></div>
        <div class="col-md-3"><input class="form-control" id="b_admin" placeholder="${t("admin")}"></div>
        <div class="col-md-2"><input class="form-control" id="b_filials" type="number" min="0" value="1" placeholder="${t("filials")}"></div>
        <div class="col-md-2"><input class="form-control" id="b_price" type="number" min="0" value="0" placeholder="${t("tariffPrice")}"></div>
        <div class="col-md-1 d-grid"><button class="btn btn-primary" id="b_create">${t("create")}</button></div>
      </div>
    </div></div>` : ""}
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>ID</th><th>${t("name")}</th><th>${t("owner")}</th><th>${t("admin")}</th><th>${t("filials")}</th><th>${t("tariff")}</th><th>${t("tariffPrice")}</th><th>${t("status")}</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
        ${(data.items || []).map(x => `<tr>
          <td>${x.id}</td><td>${esc(x.name)}</td><td>${esc(x.owner_full_name || "")}</td><td>${esc(x.admin_full_name || "")}</td>
          <td>${fmt(x.filials_count)}</td><td>${esc(x.tariff_plan)}</td><td>${fmt(x.tariff_price_per_filial)}</td><td>${esc(x.status)}</td>
          ${canWrite ? `<td><button class="btn btn-xs btn-outline-primary" data-edit="${x.id}">${t("edit")}</button></td>` : ""}
        </tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;

  if (canWrite) {
    document.getElementById("b_create").onclick = async () => {
      await api("/gekto/businesses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("b_name").value.trim(),
          admin_full_name: document.getElementById("b_admin").value.trim(),
          filials_count: Number(document.getElementById("b_filials").value || 1),
          tariff_price_per_filial: Number(document.getElementById("b_price").value || 0)
        })
      });
      render(ctx);
    };
    document.querySelectorAll("[data-edit]").forEach(btn => btn.onclick = async () => {
      const id = Number(btn.dataset.edit);
      const status = prompt("status: active|blocked", "active");
      if (!status) return;
      await api("/gekto/businesses/" + id, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      render(ctx);
    });
  }
}
