export async function render(ctx) {
  const { page, t, monthNow, api, fmt, esc, viewEl } = ctx;
  page("calendar");
  const month = monthNow();
  const data = await api("/gekto/payment-calendar?month=" + month);
  viewEl.innerHTML = `
    <div class="card"><div class="card-header"><h3 class="card-title">${month}</h3></div>
    <div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>${t("business")}</th><th>${t("startDate")}</th><th>${t("tariff")}</th><th>${t("tariffPrice")}</th><th>${t("filials")}</th><th>${t("due")}</th><th>${t("paid")}</th><th>${t("prepayment")}</th><th>${t("debt")}</th></tr></thead>
        <tbody>${(data.items || []).map(x => `<tr><td>${esc(x.business_name)}</td><td>${esc(x.subscription_start_date || "")}</td><td>${esc(x.tariff_plan)}</td><td>${fmt(x.tariff_price_per_filial)}</td><td>${fmt(x.filials_count)}</td><td>${fmt(x.month_due)}</td><td>${fmt(x.paid_this_month)}</td><td>${fmt(x.prepayment)}</td><td>${fmt(x.debt)}</td></tr>`).join("")}</tbody>
      </table>
    </div></div>`;
}
