const TARIFFS = ["monthly", "3m", "6m", "12m", "24m"];
const STATUSES = ["active", "blocked"];
const PAYMENT_METHODS = ["\u041d\u0430 \u043a\u0430\u0440\u0442\u0443", "\u041d\u0430\u043b\u0438\u0447\u043d\u044b\u0435", "\u041f\u0435\u0440\u0435\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u0435", "Visa (\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435)"];

function e(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function formGroup(label, control) {
  return `<div class="mb-3"><label class="form-label">${label}</label>${control}</div>`;
}

function businessStatusBadge(status, t) {
  const value = String(status || "").toLowerCase();
  if (value === "active") {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">${e(t("active"))}</span>`;
  }
  if (value === "blocked") {
    return `<span class="badge text-bg-secondary">${e(t("blocked"))}</span>`;
  }
  return `<span class="badge text-bg-light border">${e(status || "-")}</span>`;
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
      <div class="col-md-6">${formGroup("Payment method", `<select class="form-select" name="payment_method"><option value=""></option>${PAYMENT_METHODS.map(v => `<option value="${e(v)}" ${item.payment_method === v ? "selected" : ""}>${e(v)}</option>`).join("")}</select>`)}</div>
      <div class="col-md-3">${formGroup("INN (optional)", `<input class="form-control" name="inn" value="${e(item.inn)}">`)}</div>
      <div class="col-md-3">${formGroup("Status", `<select class="form-select" name="status">${STATUSES.map(v => `<option value="${v}" ${item.status === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
    </div>`;
}

function tariffFormHtml(item = {}) {
  return `
    <div class="row">
      <div class="col-md-4">${formGroup("Tariff", `<select class="form-select" name="tariff_plan">${TARIFFS.map(v => `<option value="${v}" ${item.tariff_plan === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}</div>
      <div class="col-md-4">${formGroup("Price per filial", `<input type="number" min="0" class="form-control" name="tariff_price_per_filial" value="${Number(item.tariff_price_per_filial ?? 0)}">`)}</div>
      <div class="col-md-4">${formGroup("Filials", `<input type="number" min="0" class="form-control" name="filials_count" value="${Number(item.filials_count ?? 1)}">`)}</div>
      <div class="col-md-4">${formGroup("Start date", `<input type="date" class="form-control" name="subscription_start_date" value="${item.subscription_start_date || ""}">`)}</div>
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

function readTariffForm(root) {
  const g = (n) => root.querySelector(`[name="${n}"]`);
  return {
    tariff_plan: g("tariff_plan").value,
    tariff_price_per_filial: Number(g("tariff_price_per_filial").value || 0),
    filials_count: Number(g("filials_count").value || 0),
    subscription_start_date: g("subscription_start_date").value || null
  };
}

function desktopTableHtml(items, canWrite, t, fmt, esc) {
  return `
    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr>
          <th>${t("name")}</th><th>${t("owner")}</th><th>Owner phone</th><th>${t("admin")}</th><th>Admin phone</th>
          <th>${t("filials")}</th><th>${t("tariff")}</th><th>${t("tariffPrice")}</th><th>${t("startDate")}</th><th>Payment method</th><th>INN</th><th>${t("status")}</th>
          ${canWrite ? `<th>${t("action")}</th>` : ""}
        </tr></thead>
        <tbody>
        ${items.map(x => `<tr>
          <td>${esc(x.name)}</td><td>${esc(x.owner_full_name || "")}</td><td>${esc(x.owner_phone || "")}</td><td>${esc(x.admin_full_name || "")}</td><td>${esc(x.admin_phone || "")}</td>
          <td>${fmt(x.filials_count)}</td><td>${esc(x.tariff_plan)}</td><td>${fmt(x.tariff_price_per_filial)}</td><td>${esc(x.subscription_start_date || "")}</td><td>${esc(x.payment_method || "")}</td><td>${esc(x.inn || "")}</td><td>${businessStatusBadge(x.status, t)}</td>
          ${canWrite ? `<td><div class="d-flex gap-2 flex-wrap"><button class="btn btn-sm btn-outline-primary" data-edit="${x.id}">${t("edit")}</button><button class="btn btn-sm btn-outline-secondary" data-tariff="${x.id}">Tariff</button></div></td>` : ""}
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
              <div>
                <div class="fw-semibold">${esc(x.name)}</div>
                <div class="text-muted small">${t("owner")}: ${esc(x.owner_full_name || "-")}</div>
              </div>
              ${businessStatusBadge(x.status, t)}
            </div>
            <div class="small text-muted mt-2">Owner phone: ${esc(x.owner_phone || "-")}</div>
            <div class="small text-muted">${t("admin")}: ${esc(x.admin_full_name || "-")}</div>
            <div class="small text-muted">Admin phone: ${esc(x.admin_phone || "-")}</div>
            <div class="small text-muted">${t("filials")}: ${fmt(x.filials_count)}</div>
            <div class="small text-muted">${t("tariff")}: ${esc(x.tariff_plan || "-")}</div>
            <div class="small text-muted">${t("tariffPrice")}: ${fmt(x.tariff_price_per_filial)}</div>
            <div class="small text-muted">${t("startDate")}: ${esc(x.subscription_start_date || "-")}</div>
            <div class="small text-muted">Payment method: ${esc(x.payment_method || "-")}</div>
            <div class="small text-muted">INN: ${esc(x.inn || "-")}</div>
            ${canWrite ? `<div class="d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${x.id}">${t("edit")}</button><button class="btn btn-sm btn-outline-secondary" data-tariff="${x.id}">Tariff</button></div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>`;
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
        <div class="col-12 col-md-4"><label class="form-label">Search</label><input id="f_q" class="form-control" value="${esc(q)}"></div>
        <div class="col-6 col-md-2"><label class="form-label">${t("status")}</label><select id="f_status" class="form-select"><option value="">All</option>${STATUSES.map(v => `<option value="${v}" ${status === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div class="col-6 col-md-2"><label class="form-label">${t("tariff")}</label><select id="f_tariff" class="form-select"><option value="">All</option>${TARIFFS.map(v => `<option value="${v}" ${tariff === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        ${canWrite ? `<div class="col-12 col-md-2 d-grid"><button id="b_create" class="btn btn-primary">${t("create")}</button></div>` : `<div class="col-12 col-md-2"></div>`}
      </div>
    </div></div>
    ${desktopTableHtml(items, canWrite, t, fmt, esc)}
    ${mobileCardsHtml(items, canWrite, t, fmt, esc)}`;

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
    bodyHtml: businessFormHtml({ tariff_plan: "monthly", status: "active", payment_method: PAYMENT_METHODS[0] }),
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
      title: t("edit"),
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

  document.querySelectorAll("[data-tariff]").forEach(btn => btn.onclick = () => {
    const id = Number(btn.dataset.tariff);
    const item = items.find(x => x.id === id);
    if (!item) return;
    openModal({
      title: "Tariff",
      bodyHtml: tariffFormHtml(item),
      onSave: async (modalEl) => {
        await api("/gekto/businesses/" + id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readTariffForm(modalEl))
        });
        await render(ctx);
      }
    });
  });
}
