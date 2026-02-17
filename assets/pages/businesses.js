const TARIFFS = ["monthly", "3m", "6m", "12m", "24m"];
const STATUSES = ["active", "blocked"];

function e(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function formGroup(label, control) {
  return `<div class="mb-3"><label class="form-label">${label}</label>${control}</div>`;
}

function businessFormHtml(item = {}) {
  return `
    <div class="row">
      <div class="col-md-6">${formGroup("Business name", `<input class="form-control" name="name" value="${e(item.name)}">`)}</div>
      <div class="col-md-6">${formGroup("Owner full name", `<input class="form-control" name="owner_full_name" value="${e(item.owner_full_name)}">`)}</div>
      <div class="col-md-6">${formGroup("Owner phone", `<input class="form-control" name="owner_phone" value="${e(item.owner_phone)}">`)}</div>
      <div class="col-md-6">${formGroup("Admin full name", `<input class="form-control" name="admin_full_name" value="${e(item.admin_full_name)}">`)}</div>
      <div class="col-md-6">${formGroup("Admin phone", `<input class="form-control" name="admin_phone" value="${e(item.admin_phone)}">`)}</div>
      <div class="col-md-3">${formGroup("Filials", `<input type="number" min="0" class="form-control" name="filials_count" value="${Number(item.filials_count ?? 1)}">`)}</div>
      <div class="col-md-3">${formGroup("Tariff", `<select class="form-select" name="tariff_plan">${TARIFFS.map(v => `<option value="${v}" ${item.tariff_plan === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
      <div class="col-md-3">${formGroup("Price per filial", `<input type="number" min="0" class="form-control" name="tariff_price_per_filial" value="${Number(item.tariff_price_per_filial ?? 0)}">`)}</div>
      <div class="col-md-3">${formGroup("Start date", `<input type="date" class="form-control" name="subscription_start_date" value="${item.subscription_start_date || ""}">`)}</div>
      <div class="col-md-6">${formGroup("Payment method", `<input class="form-control" name="payment_method" value="${e(item.payment_method)}">`)}</div>
      <div class="col-md-3">${formGroup("INN (optional)", `<input class="form-control" name="inn" value="${e(item.inn)}">`)}</div>
      <div class="col-md-3">${formGroup("Status", `<select class="form-select" name="status">${STATUSES.map(v => `<option value="${v}" ${item.status === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
    </div>`;
}

function readBusinessForm(root) {
  const g = (n) => root.querySelector(`[name="${n}"]`);
  return {
    name: g("name").value.trim(),
    owner_full_name: g("owner_full_name").value.trim(),
    owner_phone: g("owner_phone").value.trim(),
    admin_full_name: g("admin_full_name").value.trim(),
    admin_phone: g("admin_phone").value.trim(),
    filials_count: Number(g("filials_count").value || 0),
    tariff_plan: g("tariff_plan").value,
    tariff_price_per_filial: Number(g("tariff_price_per_filial").value || 0),
    subscription_start_date: g("subscription_start_date").value || null,
    payment_method: g("payment_method").value.trim(),
    inn: g("inn").value.trim(),
    status: g("status").value
  };
}

export async function render(ctx) {
  const { page, t, api, fmt, esc, viewEl, state, accessFor, openModal } = ctx;
  page("businesses");
  const canWrite = accessFor(state.me.role).businesses.write;

  const q = viewEl.getAttribute("data-q") || "";
  const status = viewEl.getAttribute("data-status") || "";
  const tariff = viewEl.getAttribute("data-tariff") || "";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (tariff) params.set("tariff_plan", tariff);

  const data = await api("/gekto/businesses" + (params.toString() ? `?${params}` : ""));
  const items = data.items || [];

  viewEl.innerHTML = `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-4"><label class="form-label">Search</label><input id="f_q" class="form-control" value="${esc(q)}"></div>
        <div class="col-md-2"><label class="form-label">${t("status")}</label><select id="f_status" class="form-select"><option value="">All</option>${STATUSES.map(v => `<option value="${v}" ${status === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div class="col-md-2"><label class="form-label">${t("tariff")}</label><select id="f_tariff" class="form-select"><option value="">All</option>${TARIFFS.map(v => `<option value="${v}" ${tariff === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        ${canWrite ? `<div class="col-md-2 d-grid"><button id="b_create" class="btn btn-primary">${t("create")}</button></div>` : `<div class="col-md-2"></div>`}
      </div>
    </div></div>
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr>
          <th>ID</th><th>${t("name")}</th><th>${t("owner")}</th><th>Owner phone</th><th>${t("admin")}</th><th>Admin phone</th>
          <th>${t("filials")}</th><th>${t("tariff")}</th><th>${t("tariffPrice")}</th><th>${t("startDate")}</th><th>Payment method</th><th>INN</th><th>${t("status")}</th>
          ${canWrite ? `<th>${t("action")}</th>` : ""}
        </tr></thead>
        <tbody>
        ${items.map(x => `<tr>
          <td>${x.id}</td><td>${esc(x.name)}</td><td>${esc(x.owner_full_name || "")}</td><td>${esc(x.owner_phone || "")}</td><td>${esc(x.admin_full_name || "")}</td><td>${esc(x.admin_phone || "")}</td>
          <td>${fmt(x.filials_count)}</td><td>${esc(x.tariff_plan)}</td><td>${fmt(x.tariff_price_per_filial)}</td><td>${esc(x.subscription_start_date || "")}</td><td>${esc(x.payment_method || "")}</td><td>${esc(x.inn || "")}</td><td>${esc(x.status)}</td>
          ${canWrite ? `<td><button class="btn btn-xs btn-outline-primary" data-edit="${x.id}">${t("edit")}</button></td>` : ""}
        </tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;

  const queueRender = () => {
    clearTimeout(viewEl.__fltTimer);
    viewEl.__fltTimer = setTimeout(() => render(ctx), 220);
  };
  const qEl = document.getElementById("f_q");
  qEl.addEventListener("input", () => {
    const next = qEl.value.trim();
    if (next.length !== 0 && next.length < 3) return;
    viewEl.setAttribute("data-q", next);
    queueRender();
  });
  document.getElementById("f_status").addEventListener("change", () => {
    viewEl.setAttribute("data-status", document.getElementById("f_status").value);
    queueRender();
  });
  document.getElementById("f_tariff").addEventListener("change", () => {
    viewEl.setAttribute("data-tariff", document.getElementById("f_tariff").value);
    queueRender();
  });

  if (!canWrite) return;

  document.getElementById("b_create").onclick = () => openModal({
    title: t("create"),
    bodyHtml: businessFormHtml({ tariff_plan: "monthly", status: "active" }),
    onSave: async (modalEl) => {
      await api("/gekto/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readBusinessForm(modalEl))
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
      bodyHtml: businessFormHtml(item),
      onSave: async (modalEl) => {
        await api("/gekto/businesses/" + id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readBusinessForm(modalEl))
        });
        await render(ctx);
      }
    });
  });
}
