export async function render(ctx) {
  const { page, t, monthNow, api, fmt, esc, viewEl } = ctx;
  page("calendar");

  const month = viewEl.getAttribute("data-month") || monthNow();
  const q = viewEl.getAttribute("data-q") || "";
  const data = await api("/gekto/payment-calendar?month=" + month);
  let items = data.items || [];
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(x => String(x.business_name || "").toLowerCase().includes(ql));
  }

  viewEl.innerHTML = `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-3"><label class="form-label">${t("month")}</label><input id="c_month" type="month" class="form-control" value="${month}"></div>
        <div class="col-md-6"><label class="form-label">Search business</label><input id="c_q" class="form-control" value="${esc(q)}"></div>
      </div>
    </div></div>
    <div class="card"><div class="card-header"><h3 class="card-title">${month}</h3></div>
      <div class="card-body table-wrap">
        <table class="table table-sm table-bordered">
          <thead><tr><th>${t("business")}</th><th>${t("startDate")}</th><th>${t("tariff")}</th><th>${t("tariffPrice")}</th><th>${t("filials")}</th><th>${t("due")}</th><th>${t("paid")}</th><th>${t("prepayment")}</th><th>${t("debt")}</th></tr></thead>
          <tbody>${items.map(x => `<tr><td>${esc(x.business_name)}</td><td>${esc(x.subscription_start_date || "")}</td><td>${esc(x.tariff_plan)}</td><td>${fmt(x.tariff_price_per_filial)}</td><td>${fmt(x.filials_count)}</td><td>${fmt(x.month_due)}</td><td>${fmt(x.paid_this_month)}</td><td>${fmt(x.prepayment)}</td><td>${fmt(x.debt)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`;

  document.getElementById("c_month").addEventListener("change", () => {
    viewEl.setAttribute("data-month", document.getElementById("c_month").value || monthNow());
    clearTimeout(viewEl.__fltTimer);
    viewEl.__fltTimer = setTimeout(() => render(ctx), 180);
  });
  const qEl = document.getElementById("c_q");
  qEl.addEventListener("input", () => {
    const next = qEl.value.trim();
    if (next.length !== 0 && next.length < 3) return;
    viewEl.setAttribute("data-q", next);
    clearTimeout(viewEl.__fltTimer);
    viewEl.__fltTimer = setTimeout(() => render(ctx), 220);
  });
}
