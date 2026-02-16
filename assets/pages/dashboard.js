export async function render(ctx) {
  const { page, t, monthNow, api, fmt, esc, viewEl } = ctx;
  page("dashboard", t("dashboardHint"));
  const month = monthNow();
  const [d, c] = await Promise.all([
    api("/gekto/dashboard?month=" + month),
    api("/gekto/payment-calendar?month=" + month)
  ]);
  viewEl.innerHTML = `
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
}
