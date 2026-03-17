import { bindPager, fg, pagerHtml, queueRender, sectionTitle, selectOptions } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function activeBadge(v) {
  return Number(v) === 1
    ? '<span class="badge text-bg-success-subtle border border-success-subtle">Активный</span>'
    : '<span class="badge text-bg-secondary">Неактивный</span>';
}

function formHtml(refs, item = {}, presetRole = "") {
  const selectedExtra = new Set((item.extra_roles || []).map((row) => String(row.id)));
  return `
    <div class="row">
      <div class="col-md-4">${fg("Тип лица", `<select name="person_kind" class="form-select"><option value="company" ${String(item.person_kind || "company") === "company" ? "selected" : ""}>Юр. лицо</option><option value="individual" ${String(item.person_kind || "") === "individual" ? "selected" : ""}>Физ. лицо</option></select>`)}</div>
      <div class="col-md-8">${fg("Наименование / ФИО", `<input name="name" class="form-control" value="${esc(item.name || "")}">`)}</div>
      <div class="col-md-6">${fg("ФИО владельца", `<input name="owner_full_name" class="form-control" value="${esc(item.owner_full_name || "")}">`)}</div>
      <div class="col-md-6">${fg("Телефон", `<input name="phone" class="form-control" value="${esc(item.phone || "")}" placeholder="+998 90 123 45 67">`)}</div>
      <div class="col-md-6">${fg("Город", `<select name="city_id" class="form-select">${selectOptions(refs.cities, item.city_id, "Выбрать")}</select>`)}</div>
      <div class="col-md-6">${fg("Активный", `<select name="is_active" class="form-select"><option value="1" ${Number(item.is_active ?? 1) === 1 ? "selected" : ""}>Да</option><option value="0" ${Number(item.is_active ?? 1) === 0 ? "selected" : ""}>Нет</option></select>`)}</div>
      <div class="col-md-3">${fg("Поставщик", `<select name="is_supplier" class="form-select"><option value="1" ${(presetRole === "supplier" || Number(item.is_supplier || 0) === 1) ? "selected" : ""}>Да</option><option value="0" ${(presetRole === "supplier" || Number(item.is_supplier || 0) === 1) ? "" : "selected"}>Нет</option></select>`)}</div>
      <div class="col-md-3">${fg("Клиент", `<select name="is_client" class="form-select"><option value="1" ${(presetRole === "client" || Number(item.is_client || 0) === 1) ? "selected" : ""}>Да</option><option value="0" ${(presetRole === "client" || Number(item.is_client || 0) === 1) ? "" : "selected"}>Нет</option></select>`)}</div>
      <div class="col-md-3">${fg("Сотрудник", `<select name="is_employee" class="form-select"><option value="1" ${(presetRole === "employee" || Number(item.is_employee || 0) === 1) ? "selected" : ""}>Да</option><option value="0" ${(presetRole === "employee" || Number(item.is_employee || 0) === 1) ? "" : "selected"}>Нет</option></select>`)}</div>
      <div class="col-md-3">${fg("Инспекция", `<select name="is_inspection" class="form-select"><option value="1" ${(presetRole === "inspection" || Number(item.is_inspection || 0) === 1) ? "selected" : ""}>Да</option><option value="0" ${(presetRole === "inspection" || Number(item.is_inspection || 0) === 1) ? "" : "selected"}>Нет</option></select>`)}</div>
      <div class="col-12">${fg("Прочие роли", `<select name="extra_role_ids" class="form-select" multiple size="${Math.min(8, Math.max(4, refs.extraRoles.length || 4))}">${(refs.extraRoles || []).map((role) => `<option value="${role.id}" ${selectedExtra.has(String(role.id)) ? "selected" : ""}>${esc(role.name)}</option>`).join("")}</select>`)}</div>
    </div>
  `;
}

function readForm(root) {
  const get = (name) => root.querySelector(`[name="${name}"]`);
  return {
    person_kind: get("person_kind").value,
    name: get("name").value.trim(),
    owner_full_name: get("owner_full_name").value.trim(),
    phone: get("phone").value.trim(),
    city_id: get("city_id").value ? Number(get("city_id").value) : null,
    is_supplier: Number(get("is_supplier").value || 0),
    is_client: Number(get("is_client").value || 0),
    is_employee: Number(get("is_employee").value || 0),
    is_inspection: Number(get("is_inspection").value || 0),
    is_active: Number(get("is_active").value || 1),
    extra_role_ids: Array.from(get("extra_role_ids").selectedOptions).map((opt) => Number(opt.value)),
  };
}

function roleFilterFromSection(sectionId) {
  if (sectionId.endsWith("suppliers")) return "supplier";
  if (sectionId.endsWith("clients")) return "client";
  if (sectionId.endsWith("employees")) return "employee";
  if (sectionId.endsWith("inspections")) return "inspection";
  return "other";
}

function personKindLabel(kind) {
  return kind === "individual" ? "Физ. лицо" : "Юр. лицо";
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, openModal } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });
  const canWrite = accessFor(state.me.role)[section.id].write;
  const roleFilter = roleFilterFromSection(section.id);

  const filters = {
    q: viewEl.dataset.q || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };
  const qs = new URLSearchParams({
    role: roleFilter,
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);

  const [listResp, citiesResp, extraRolesResp] = await Promise.all([
    api(`/counterparties?${qs.toString()}`),
    api("/cities"),
    api("/counterparty-extra-roles?page=1&page_size=100")
  ]);
  const items = listResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };
  const refs = {
    cities: (citiesResp.items || []).map((item) => ({ id: item.id, name: item.name })),
    extraRoles: extraRolesResp.items || []
  };

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5"><label class="form-label">Поиск</label><input id="cp_q" class="form-control" value="${esc(filters.q)}"></div>
        ${canWrite ? `<div class="col-12 col-md-3 d-grid"><button id="cp_create" class="btn btn-primary">Создать</button></div>` : `<div class="col-12 col-md-3"></div>`}
      </div>
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr><th>Наименование / ФИО</th><th>Тип</th><th>Телефон</th><th>Город</th><th>Роли</th><th>Статус</th>${canWrite ? "<th>Действия</th>" : ""}</tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${esc(item.name)}</td>
              <td>${esc(personKindLabel(item.person_kind))}</td>
              <td>${esc(item.phone || "")}</td>
              <td>${esc(item.city_name || "")}</td>
              <td>${esc([
                Number(item.is_supplier) === 1 ? "Поставщик" : "",
                Number(item.is_client) === 1 ? "Клиент" : "",
                Number(item.is_employee) === 1 ? "Сотрудник" : "",
                Number(item.is_inspection) === 1 ? "Инспекция" : "",
                ...(item.extra_roles || []).map((row) => row.name)
              ].filter(Boolean).join(", "))}</td>
              <td>${activeBadge(item.is_active)}</td>
              ${canWrite ? `<td><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></td>` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${pagerHtml(pagination)}
    </div></div>

    <div class="d-lg-none">
      ${items.map((item) => `
        <div class="card entity-mobile-card mb-2 shadow-sm">
          <div class="card-body">
            <div class="fw-semibold">${esc(item.name)}</div>
            <div class="small text-muted mt-2">Тип: ${esc(personKindLabel(item.person_kind))}</div>
            <div class="small text-muted">Телефон: ${esc(item.phone || "-")}</div>
            <div class="small text-muted">Город: ${esc(item.city_name || "-")}</div>
            <div class="small text-muted">Роли: ${esc([
              Number(item.is_supplier) === 1 ? "Поставщик" : "",
              Number(item.is_client) === 1 ? "Клиент" : "",
              Number(item.is_employee) === 1 ? "Сотрудник" : "",
              Number(item.is_inspection) === 1 ? "Инспекция" : "",
              ...(item.extra_roles || []).map((row) => row.name)
            ].filter(Boolean).join(", ") || "-")}</div>
            <div class="small text-muted">${activeBadge(item.is_active)}</div>
            ${canWrite ? `<div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button></div>` : ""}
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  viewEl.querySelector("#cp_q")?.addEventListener("input", (ev) => {
    viewEl.dataset.q = ev.target.value.trim();
    queueRender(viewEl, "__cpTimer", () => {
      viewEl.dataset.page = "1";
      render(ctx);
    });
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    render(ctx);
  });

  if (!canWrite) return;

  viewEl.querySelector("#cp_create")?.addEventListener("click", () => {
    openModal({
      title: "Создать контрагента",
      bodyHtml: formHtml(refs, { is_active: 1 }, roleFilter),
      onSave: async (modalEl) => {
        await api(`/counterparties?preset=${roleFilter}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readForm(modalEl))
        });
        await render(ctx);
      }
    });
  });

  viewEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = items.find((row) => Number(row.id) === Number(btn.getAttribute("data-edit")));
      if (!item) return;
      openModal({
        title: "Изменить контрагента",
        bodyHtml: formHtml(refs, item, roleFilter),
        onSave: async (modalEl) => {
          await api(`/counterparties/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(readForm(modalEl))
          });
          await render(ctx);
        }
      });
    });
  });
}
