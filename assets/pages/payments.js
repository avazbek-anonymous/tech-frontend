export async function render(ctx) {
  const { page, t, api, fmt, esc, viewEl, state, accessFor } = ctx;
  page("payments");
  const canWrite = accessFor(state.me.role).payments.write;
  const data = await api("/gekto/payments");
  const businesses = await api("/gekto/businesses");
  viewEl.innerHTML = `
    ${canWrite ? `<div class="card mb-3"><div class="card-body"><div class="row g-2">
      <div class="col-md-3"><select id="p_business" class="form-select">${(businesses.items || []).map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></div>
      <div class="col-md-2"><input id="p_date" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="col-md-2"><input id="p_amount" type="number" min="0" value="0" class="form-control" placeholder="${t("amount")}"></div>
      <div class="col-md-2"><select id="p_status" class="form-select"><option value="draft">${t("draft")}</option><option value="posted">${t("posted")}</option></select></div>
      <div class="col-md-3 d-grid"><button class="btn btn-primary" id="p_create">${t("create")}</button></div>
    </div></div></div>` : ""}
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>ID</th><th>${t("business")}</th><th>Date</th><th>${t("amount")}</th><th>${t("tariff")}</th><th>${t("status")}</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
        ${(data.items || []).map(x => `<tr>
          <td>${x.id}</td><td>${esc(x.business_name)}</td><td>${esc(x.payment_date)}</td><td>${fmt(x.amount)}</td><td>${esc(x.tariff_plan)}</td><td>${esc(x.status)}</td>
          ${canWrite ? `<td><button class="btn btn-xs btn-outline-primary" data-post="${x.id}">${t("posted")}</button></td>` : ""}
        </tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;
  if (canWrite) {
    document.getElementById("p_create").onclick = async () => {
      await api("/gekto/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: Number(document.getElementById("p_business").value),
          payment_date: document.getElementById("p_date").value,
          amount: Number(document.getElementById("p_amount").value || 0),
          tariff_plan: "monthly",
          status: document.getElementById("p_status").value
        })
      });
      render(ctx);
    };
    document.querySelectorAll("[data-post]").forEach(btn => btn.onclick = async () => {
      const id = Number(btn.dataset.post);
      await api("/gekto/payments/" + id, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "posted" })
      });
      render(ctx);
    });
  }
}
