export async function render(ctx) {
  const { page, t, monthNow, api, fmt, esc, viewEl, state, accessFor } = ctx;
  page("dashboard", t("dashboardHint"));
  const canWrite = accessFor(state.me.role).dashboard.write;
  const month = viewEl.getAttribute("data-month") || monthNow();
  viewEl.setAttribute("data-month", month);
  const [d, c] = await Promise.all([
    api("/gekto/dashboard?month=" + month),
    api("/gekto/payment-calendar?month=" + month)
  ]);
  viewEl.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label">${t("month")}</label>
            <input id="dash_month" type="month" class="form-control" value="${month}">
          </div>
          <div class="col-md-2 d-grid">
            <button id="dash_apply" class="btn btn-outline-primary">${t("refresh") || "Refresh"}</button>
          </div>
          <div class="col-md-4">
            <label class="form-label">${t("monthPlan")}</label>
            <input id="dash_plan" type="number" min="0" class="form-control" value="${Number(d.metrics.month_plan_total || 0)}" ${canWrite ? "" : "disabled"}>
          </div>
          ${canWrite ? `<div class="col-md-3 d-grid"><button id="dash_save_plan" class="btn btn-primary">${t("save")}</button></div>` : ""}
        </div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-xl-3"><div class="small-box text-bg-primary"><div class="inner"><h3>${fmt(d.metrics.active_businesses)}</h3><p>${t("businesses")}</p></div><i class="small-box-icon bi bi-buildings"></i></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="small-box text-bg-danger"><div class="inner"><h3>${fmt(d.metrics.overdue_businesses)}</h3><p>${t("overdueCount")}</p></div><i class="small-box-icon bi bi-exclamation-triangle"></i></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="small-box text-bg-success"><div class="inner"><h3>${fmt(d.metrics.month_paid_total)}</h3><p>${t("monthFact")}</p></div><i class="small-box-icon bi bi-cash-coin"></i></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="small-box text-bg-warning"><div class="inner"><h3>${fmt(d.metrics.month_plan_total)}</h3><p>${t("monthPlan")}</p></div><i class="small-box-icon bi bi-graph-up"></i></div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">${t("calendar")} (${month})</h3></div>
      <div class="card-body table-wrap">
        <table class="table table-sm table-bordered">
          <thead><tr><th>${t("business")}</th><th>${t("due")}</th><th>${t("paid")}</th><th>${t("prepayment")}</th><th>${t("debt")}</th></tr></thead>
          <tbody>
            ${(c.items || []).slice(0, 12).map(x => `<tr><td>${esc(x.business_name)}</td><td>${fmt(x.month_due)}</td><td>${fmt(x.paid_this_month)}</td><td>${fmt(x.prepayment)}</td><td>${fmt(x.debt)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  document.getElementById("dash_apply").onclick = () => {
    const m = document.getElementById("dash_month").value || monthNow();
    viewEl.setAttribute("data-month", m);
    render(ctx);
  };

  if (canWrite) {
    document.getElementById("dash_save_plan").onclick = async () => {
      const planValue = Number(document.getElementById("dash_plan").value || 0);
      await api("/gekto/revenue-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month_key: month, planned_amount: planValue })
      });
      render(ctx);
    };
  }
}
