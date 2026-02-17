const TARIFFS = ["monthly", "3m", "6m", "12m", "24m"];
const STATUSES = ["draft", "posted"];

function fg(label, control) {
  return `<div class="mb-3"><label class="form-label">${label}</label>${control}</div>`;
}

function paymentFormHtml(businesses, item = {}) {
  return `
    <div class="row">
      <div class="col-md-6">${fg("Business", `<select name="business_id" class="form-select">${(businesses || []).map(b => `<option value="${b.id}" ${Number(item.business_id) === Number(b.id) ? "selected" : ""}>${b.name}</option>`).join("")}</select>`)}</div>
      <div class="col-md-3">${fg("Date", `<input name="payment_date" type="date" class="form-control" value="${item.payment_date || new Date().toISOString().slice(0, 10)}">`)}</div>
      <div class="col-md-3">${fg("Amount", `<input name="amount" type="number" min="0" class="form-control" value="${Number(item.amount ?? 0)}">`)}</div>
      <div class="col-md-4">${fg("Tariff", `<select name="tariff_plan" class="form-select">${TARIFFS.map(v => `<option value="${v}" ${item.tariff_plan === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
      <div class="col-md-4">${fg("Status", `<select name="status" class="form-select">${STATUSES.map(v => `<option value="${v}" ${item.status === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
      <div class="col-md-4">${fg("Payment method", `<input name="payment_method" class="form-control" value="${item.payment_method || ""}">`)}</div>
      <div class="col-md-12">${fg("Comment", `<input name="comment" class="form-control" value="${item.comment || ""}">`)}</div>
    </div>`;
}

function readForm(root) {
  const g = (n) => root.querySelector(`[name="${n}"]`);
  return {
    business_id: Number(g("business_id").value),
    payment_date: g("payment_date").value,
    amount: Number(g("amount").value || 0),
    tariff_plan: g("tariff_plan").value,
    status: g("status").value,
    payment_method: g("payment_method").value.trim(),
    comment: g("comment").value.trim()
  };
}

export async function render(ctx) {
  const { page, t, api, fmt, esc, viewEl, state, accessFor, openModal } = ctx;
  page("payments");
  const canWrite = accessFor(state.me.role).payments.write;

  const fBusiness = viewEl.getAttribute("data-business_id") || "";
  const fStatus = viewEl.getAttribute("data-status") || "";
  const fFrom = viewEl.getAttribute("data-date_from") || "";
  const fTo = viewEl.getAttribute("data-date_to") || "";

  const businesses = await api("/gekto/businesses");
  const params = new URLSearchParams();
  if (fBusiness) params.set("business_id", fBusiness);
  if (fStatus) params.set("status", fStatus);
  if (fFrom) params.set("date_from", fFrom);
  if (fTo) params.set("date_to", fTo);
  const data = await api("/gekto/payments" + (params.toString() ? `?${params}` : ""));
  const items = data.items || [];

  viewEl.innerHTML = `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-3"><label class="form-label">${t("business")}</label><select id="f_business" class="form-select"><option value="">All</option>${(businesses.items || []).map(b => `<option value="${b.id}" ${String(b.id) === fBusiness ? "selected" : ""}>${esc(b.name)}</option>`).join("")}</select></div>
        <div class="col-md-2"><label class="form-label">${t("status")}</label><select id="f_status" class="form-select"><option value="">All</option>${STATUSES.map(v => `<option value="${v}" ${fStatus === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div class="col-md-2"><label class="form-label">Date from</label><input id="f_from" type="date" class="form-control" value="${fFrom}"></div>
        <div class="col-md-2"><label class="form-label">Date to</label><input id="f_to" type="date" class="form-control" value="${fTo}"></div>
        <div class="col-md-1 d-grid"><button id="f_apply" class="btn btn-outline-primary">Apply</button></div>
        ${canWrite ? `<div class="col-md-2 d-grid"><button id="p_create" class="btn btn-primary">${t("create")}</button></div>` : ""}
      </div>
    </div></div>
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>ID</th><th>${t("business")}</th><th>Date</th><th>${t("amount")}</th><th>${t("tariff")}</th><th>${t("status")}</th><th>Payment method</th><th>Comment</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
        ${items.map(x => `<tr>
          <td>${x.id}</td><td>${esc(x.business_name)}</td><td>${esc(x.payment_date)}</td><td>${fmt(x.amount)}</td><td>${esc(x.tariff_plan)}</td><td>${esc(x.status)}</td><td>${esc(x.payment_method || "")}</td><td>${esc(x.comment || "")}</td>
          ${canWrite ? `<td><button class="btn btn-xs btn-outline-primary me-1" data-edit="${x.id}">${t("edit")}</button>${x.status !== "posted" ? `<button class="btn btn-xs btn-outline-success" data-post="${x.id}">${t("posted")}</button>` : ""}</td>` : ""}
        </tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;

  document.getElementById("f_apply").onclick = () => {
    viewEl.setAttribute("data-business_id", document.getElementById("f_business").value);
    viewEl.setAttribute("data-status", document.getElementById("f_status").value);
    viewEl.setAttribute("data-date_from", document.getElementById("f_from").value);
    viewEl.setAttribute("data-date_to", document.getElementById("f_to").value);
    render(ctx);
  };

  if (!canWrite) return;

  document.getElementById("p_create").onclick = () => openModal({
    title: t("create"),
    bodyHtml: paymentFormHtml(businesses.items || [], { tariff_plan: "monthly", status: "draft" }),
    onSave: async (modalEl) => {
      await api("/gekto/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readForm(modalEl))
      });
      await render(ctx);
    }
  });

  document.querySelectorAll("[data-edit]").forEach(btn => btn.onclick = () => {
    const id = Number(btn.dataset.edit);
    const item = items.find(x => x.id === id);
    if (!item) return;
    openModal({
      title: `${t("edit")} #${id}`,
      bodyHtml: paymentFormHtml(businesses.items || [], item),
      onSave: async (modalEl) => {
        await api("/gekto/payments/" + id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readForm(modalEl))
        });
        await render(ctx);
      }
    });
  });

  document.querySelectorAll("[data-post]").forEach(btn => btn.onclick = async () => {
    const id = Number(btn.dataset.post);
    await api("/gekto/payments/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "posted" })
    });
    await render(ctx);
  });
}
