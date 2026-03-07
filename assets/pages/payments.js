const TARIFFS = ["monthly", "3m", "6m", "12m", "24m"];
const STATUSES = ["draft", "posted"];
const PAYMENT_METHODS = ["\u041d\u0430 \u043a\u0430\u0440\u0442\u0443", "\u041d\u0430\u043b\u0438\u0447\u043d\u044b\u0435", "\u041f\u0435\u0440\u0435\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u0435", "Visa (\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435)"];

function e(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function fg(label, control) {
  return `<div class="mb-3"><label class="form-label">${label}</label>${control}</div>`;
}

function paymentStatusBadge(status) {
  const value = String(status || "").toLowerCase();
  if (value === "posted") {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">posted</span>`;
  }
  if (value === "draft") {
    return `<span class="badge text-bg-secondary">draft</span>`;
  }
  return `<span class="badge text-bg-light border">${e(status || "-")}</span>`;
}

function paymentFormHtml(businesses, item = {}) {
  return `
    <div class="row">
      <div class="col-md-6">${fg("Business", `<select name="business_id" class="form-select">${(businesses || []).map(b => `<option value="${b.id}" ${Number(item.business_id) === Number(b.id) ? "selected" : ""}>${e(b.name)}</option>`).join("")}</select>`)}</div>
      <div class="col-md-3">${fg("Date", `<input name="payment_date" type="date" class="form-control" value="${item.payment_date || new Date().toISOString().slice(0, 10)}">`)}</div>
      <div class="col-md-3">${fg("Amount", `<input name="amount" type="number" min="0" class="form-control" value="${Number(item.amount ?? 0)}">`)}</div>
      <div class="col-md-4">${fg("Tariff", `<select name="tariff_plan" class="form-select">${TARIFFS.map(v => `<option value="${v}" ${item.tariff_plan === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
      <div class="col-md-4">${fg("Status", `<select name="status" class="form-select">${STATUSES.map(v => `<option value="${v}" ${item.status === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
      <div class="col-md-4">${fg("Payment method", `<select name="payment_method" class="form-select"><option value=""></option>${PAYMENT_METHODS.map(v => `<option value="${e(v)}" ${item.payment_method === v ? "selected" : ""}>${e(v)}</option>`).join("")}</select>`)}</div>
      <div class="col-md-12">${fg("Comment", `<input name="comment" class="form-control" value="${e(item.comment)}">`)}</div>
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

function desktopTableHtml(items, canWrite, t, fmt, esc) {
  return `
    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>${t("business")}</th><th>Date</th><th>${t("amount")}</th><th>${t("tariff")}</th><th>${t("status")}</th><th>Payment method</th><th>Comment</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
        ${items.map(x => `<tr>
          <td>${esc(x.business_name)}</td><td>${esc(x.payment_date)}</td><td>${fmt(x.amount)}</td><td>${esc(x.tariff_plan)}</td><td>${paymentStatusBadge(x.status)}</td><td>${esc(x.payment_method || "")}</td><td>${esc(x.comment || "")}</td>
          ${canWrite ? `<td><div class="d-flex gap-2 flex-wrap"><button class="btn btn-sm btn-outline-primary" data-edit="${x.id}">${t("edit")}</button>${x.status !== "posted" ? `<button class="btn btn-sm btn-outline-success" data-post="${x.id}">${t("posted")}</button>` : ""}</div></td>` : ""}
        </tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;
}

function mobileCardsHtml(items, canWrite, t, fmt, esc) {
  return `
    <div class="d-lg-none">
      ${items.map(x => `
        <div class="card mb-2 shadow-sm">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start">
              <div class="fw-semibold">${esc(x.business_name)}</div>
              ${paymentStatusBadge(x.status)}
            </div>
            <div class="small text-muted mt-2">Date: ${esc(x.payment_date || "-")}</div>
            <div class="small text-muted">${t("amount")}: ${fmt(x.amount)}</div>
            <div class="small text-muted">${t("tariff")}: ${esc(x.tariff_plan || "-")}</div>
            <div class="small text-muted">Payment method: ${esc(x.payment_method || "-")}</div>
            <div class="small text-muted">Comment: ${esc(x.comment || "-")}</div>
            ${canWrite ? `<div class="d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${x.id}">${t("edit")}</button>${x.status !== "posted" ? `<button class="btn btn-sm btn-outline-success" data-post="${x.id}">${t("posted")}</button>` : ""}</div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>`;
}

export async function render(ctx) {
  const { page, t, api, fmt, esc, viewEl, state, accessFor, openModal } = ctx;
  page("payments");
  const canWrite = accessFor(state.me.role).payments.write;

  const fBusiness = viewEl.getAttribute("data-business_id") || "";
  const fStatus = viewEl.getAttribute("data-status") || "";
  const fFrom = viewEl.getAttribute("data-date_from") || "";
  const fTo = viewEl.getAttribute("data-date_to") || "";

  const params = new URLSearchParams();
  if (fBusiness) params.set("business_id", fBusiness);
  if (fStatus) params.set("status", fStatus);
  if (fFrom) params.set("date_from", fFrom);
  if (fTo) params.set("date_to", fTo);
  const [businesses, data] = await Promise.all([
    api("/gekto/businesses"),
    api("/gekto/payments" + (params.toString() ? `?${params}` : ""))
  ]);
  const items = data.items || [];

  viewEl.innerHTML = `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-3"><label class="form-label">${t("business")}</label><select id="f_business" class="form-select"><option value="">All</option>${(businesses.items || []).map(b => `<option value="${b.id}" ${String(b.id) === fBusiness ? "selected" : ""}>${esc(b.name)}</option>`).join("")}</select></div>
        <div class="col-6 col-md-2"><label class="form-label">${t("status")}</label><select id="f_status" class="form-select"><option value="">All</option>${STATUSES.map(v => `<option value="${v}" ${fStatus === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div class="col-6 col-md-2"><label class="form-label">Date from</label><input id="f_from" type="date" class="form-control" value="${fFrom}"></div>
        <div class="col-6 col-md-2"><label class="form-label">Date to</label><input id="f_to" type="date" class="form-control" value="${fTo}"></div>
        ${canWrite ? `<div class="col-6 col-md-2 d-grid"><button id="p_create" class="btn btn-primary">${t("create")}</button></div>` : `<div class="col-6 col-md-2"></div>`}
      </div>
    </div></div>
    ${desktopTableHtml(items, canWrite, t, fmt, esc)}
    ${mobileCardsHtml(items, canWrite, t, fmt, esc)}`;

  const queueRender = () => {
    clearTimeout(viewEl.__fltTimer);
    viewEl.__fltTimer = setTimeout(() => render(ctx), 220);
  };
  const applyFilters = () => {
    viewEl.setAttribute("data-business_id", document.getElementById("f_business").value);
    viewEl.setAttribute("data-status", document.getElementById("f_status").value);
    viewEl.setAttribute("data-date_from", document.getElementById("f_from").value);
    viewEl.setAttribute("data-date_to", document.getElementById("f_to").value);
    queueRender();
  };
  document.getElementById("f_business").addEventListener("change", applyFilters);
  document.getElementById("f_status").addEventListener("change", applyFilters);
  document.getElementById("f_from").addEventListener("change", applyFilters);
  document.getElementById("f_to").addEventListener("change", applyFilters);

  if (!canWrite) return;

  document.getElementById("p_create").onclick = () => openModal({
    title: t("create"),
    bodyHtml: paymentFormHtml(businesses.items || [], { tariff_plan: "monthly", status: "draft", payment_method: PAYMENT_METHODS[0] }),
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
      title: t("edit"),
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
