import { activeBadge, bindPager, boolSelect, fg, pagerHtml, queueRender, safeNumber, sectionTitle, tr } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderField(field, item = {}) {
  const value = item[field.name];
  if (field.type === "select") {
    const options = Array.isArray(field.options) ? field.options : [];
    return fg(field.label, `
      <select name="${field.name}" class="form-select">
        ${options.map((option) => {
          const optionValue = String(option?.value ?? "");
          const optionLabel = String(option?.label ?? optionValue);
          const selectedValue = String(value ?? field.defaultValue ?? "");
          return `<option value="${esc(optionValue)}" ${selectedValue === optionValue ? "selected" : ""}>${esc(optionLabel)}</option>`;
        }).join("")}
      </select>
    `);
  }
  if (field.type === "bool") {
    return fg(field.label, boolSelect(field.name, Number(value ?? field.defaultValue ?? 1)));
  }
  if (field.type === "number") {
    return fg(field.label, `<input name="${field.name}" type="number" class="form-control" value="${safeNumber(value, field.defaultValue ?? 0)}">`);
  }
  return fg(field.label, `<input name="${field.name}" class="form-control" value="${esc(value ?? field.defaultValue ?? "")}">`);
}

function readField(root, field) {
  const el = root.querySelector(`[name="${field.name}"]`);
  if (!el) return field.defaultValue ?? null;
  if (field.type === "select") {
    if (field.valueType === "number") return Number(el.value || field.defaultValue || 0);
    return el.value;
  }
  if (field.type === "bool" || field.type === "number") return Number(el.value || field.defaultValue || 0);
  return el.value.trim();
}

function filterInputId(name) {
  return `simple_filter_${name}`;
}

function filterQueryParam(filter) {
  return filter.queryParam || filter.name;
}

function renderToolbarFilter(filter, value) {
  const inputId = filterInputId(filter.name);
  const label = filter.label || filter.name;
  if (filter.type === "select") {
    const options = Array.isArray(filter.options) ? filter.options : [];
    const optionHtml = options.map((option) => {
      const optValue = String(option?.value ?? "");
      const optLabel = String(option?.label ?? optValue);
      return `<option value="${esc(optValue)}" ${String(value ?? "") === optValue ? "selected" : ""}>${esc(optLabel)}</option>`;
    }).join("");
    return `
      <div class="entity-toolbar-item entity-toolbar-filter">
        <label class="form-label" for="${inputId}">${esc(label)}</label>
        <select class="form-select" id="${inputId}">${optionHtml}</select>
      </div>
    `;
  }

  return `
    <div class="entity-toolbar-item entity-toolbar-filter">
      <label class="form-label" for="${inputId}">${esc(label)}</label>
      <input class="form-control" id="${inputId}" value="${esc(value ?? "")}">
    </div>
  `;
}

function readToolbarFilter(viewEl, filter) {
  const el = viewEl.querySelector(`#${filterInputId(filter.name)}`);
  if (!el) return filter.defaultValue ?? "";
  return String(el.value ?? "").trim();
}

export async function renderSimpleEntity(ctx, cfg) {
  const { section, page, viewEl, api, openModal } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });

  const canWrite = cfg.canWrite ? cfg.canWrite(ctx) : true;
  const filtersCfg = Array.isArray(cfg.filters) ? cfg.filters : [];
  const state = {
    q: viewEl.dataset.q || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };
  for (const filter of filtersCfg) {
    state[filter.name] = viewEl.dataset[filter.name] ?? filter.defaultValue ?? "";
  }

  const qs = new URLSearchParams();
  if (state.q) qs.set("q", state.q);
  qs.set("page", String(state.page));
  qs.set("page_size", String(state.page_size));
  for (const filter of filtersCfg) {
    const value = state[filter.name];
    if (value !== undefined && value !== null && String(value) !== "") {
      qs.set(filterQueryParam(filter), String(value));
    }
  }

  const data = await api(`${cfg.endpoint}?${qs.toString()}`);
  const items = data.items || [];
  const pagination = data.pagination || { page: 1, pages: 1, total: items.length, page_size: state.page_size };

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="entity-toolbar-shell">
        <div class="entity-toolbar-main">
          <div class="entity-toolbar-item entity-toolbar-search">
            <label class="form-label" for="simple_q">${tr({ ru: "Поиск", uz: "Qidiruv", en: "Search" })}</label>
            <input class="form-control" id="simple_q" value="${esc(state.q)}">
          </div>
          ${filtersCfg.map((filter) => renderToolbarFilter(filter, state[filter.name])).join("")}
        </div>
        ${canWrite ? `
          <div class="entity-toolbar-actions">
            <button class="btn btn-primary entity-toolbar-btn" id="simple_create">${tr({ ru: "Создать", uz: "Yaratish", en: "Create" })}</button>
          </div>
        ` : ""}
      </div>
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr>
          ${cfg.columns.map((col) => `<th>${col.label}</th>`).join("")}
          ${canWrite ? `<th>${tr({ ru: "Действия", uz: "Amallar", en: "Actions" })}</th>` : ""}
        </tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              ${cfg.columns.map((col) => `<td>${col.render ? col.render(item) : esc(item[col.name])}</td>`).join("")}
              ${canWrite ? `<td><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">${tr({ ru: "Изменить", uz: "Tahrirlash", en: "Edit" })}</button></td>` : ""}
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
            ${cfg.mobile(item)}
            ${canWrite ? `<div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">${tr({ ru: "Изменить", uz: "Tahrirlash", en: "Edit" })}</button></div>` : ""}
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  const qEl = viewEl.querySelector("#simple_q");
  qEl?.addEventListener("input", () => {
    const next = qEl.value.trim();
    viewEl.dataset.q = next;
    queueRender(viewEl, "__simpleTimer", () => {
      viewEl.dataset.page = "1";
      renderSimpleEntity(ctx, cfg);
    });
  });

  for (const filter of filtersCfg) {
    const el = viewEl.querySelector(`#${filterInputId(filter.name)}`);
    if (!el) continue;
    const eventName = filter.type === "select" ? "change" : "input";
    el.addEventListener(eventName, () => {
      viewEl.dataset[filter.name] = readToolbarFilter(viewEl, filter);
      const rerender = () => {
        viewEl.dataset.page = "1";
        renderSimpleEntity(ctx, cfg);
      };
      if (eventName === "input") {
        queueRender(viewEl, `__simpleFilterTimer_${filter.name}`, rerender);
      } else {
        rerender();
      }
    });
  }

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    renderSimpleEntity(ctx, cfg);
  });

  if (!canWrite) return;

  const bodyHtml = (item = {}) => `<div class="row">${cfg.fields.map((field) => `<div class="col-md-6">${renderField(field, item)}</div>`).join("")}</div>`;
  const readForm = (root) => {
    const payload = {};
    for (const field of cfg.fields) payload[field.name] = readField(root, field);
    return payload;
  };

  viewEl.querySelector("#simple_create")?.addEventListener("click", () => {
    openModal({
      title: `${tr({ ru: "Создать", uz: "Yaratish", en: "Create" })}: ${title}`,
      bodyHtml: bodyHtml(cfg.defaults || {}),
      onSave: async (modalEl) => {
        await api(cfg.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readForm(modalEl))
        });
        await renderSimpleEntity(ctx, cfg);
      }
    });
  });

  viewEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = items.find((row) => Number(row.id) === Number(btn.getAttribute("data-edit")));
      if (!item) return;
      openModal({
        title: `${tr({ ru: "Изменить", uz: "Tahrirlash", en: "Edit" })}: ${title}`,
        bodyHtml: bodyHtml(item),
        onSave: async (modalEl) => {
          await api(`${cfg.endpoint}/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(readForm(modalEl))
          });
          await renderSimpleEntity(ctx, cfg);
        }
      });
    });
  });
}

export { activeBadge, esc };
