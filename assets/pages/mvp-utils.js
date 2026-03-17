function currentLang() {
  return document.documentElement.lang || "ru";
}

export function tr(map) {
  const lang = currentLang();
  return map[lang] || map.ru || map.en || "";
}

export function sectionTitle(section, lang = currentLang()) {
  if (!section) return "";
  if (typeof section.label === "string") return section.label;
  if (section.label && typeof section.label === "object") {
    return section.label[lang] || section.label.ru || section.label.en || section.id || "";
  }
  return section.key || section.id || "";
}

export function fg(label, control) {
  return `<div class="mb-3"><label class="form-label">${label}</label>${control}</div>`;
}

export function boolSelect(name, value = 1, trueLabel = null, falseLabel = null) {
  const yes = trueLabel || tr({ ru: "Да", uz: "Ha", en: "Yes" });
  const no = falseLabel || tr({ ru: "Нет", uz: "Yo'q", en: "No" });
  return `<select name="${name}" class="form-select">
    <option value="1" ${Number(value) === 1 ? "selected" : ""}>${yes}</option>
    <option value="0" ${Number(value) === 0 ? "selected" : ""}>${no}</option>
  </select>`;
}

export function activeBadge(value) {
  return Number(value) === 1
    ? `<span class="badge text-bg-success-subtle border border-success-subtle">${tr({ ru: "Активный", uz: "Faol", en: "Active" })}</span>`
    : `<span class="badge text-bg-secondary">${tr({ ru: "Неактивный", uz: "Nofaol", en: "Inactive" })}</span>`;
}

export function pagerHtml(pagination = {}) {
  const page = Number(pagination.page || 1);
  const pages = Number(pagination.pages || 1);
  const total = Number(pagination.total || 0);
  const pageSize = Number(pagination.page_size || 50);
  const prevDisabled = page <= 1 ? "disabled" : "";
  const nextDisabled = page >= pages ? "disabled" : "";

  return `
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-3">
      <div class="small text-muted">${tr({ ru: "Строк", uz: "Qatorlar", en: "Rows" })}: ${total}</div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <label class="small text-muted">${tr({ ru: "Показывать", uz: "Ko'rsatish", en: "Page size" })}</label>
        <select class="form-select form-select-sm" data-page-size style="width:auto">
          ${[50, 100, 200, 500, 1000].map((size) => `<option value="${size}" ${pageSize === size ? "selected" : ""}>${size}</option>`).join("")}
        </select>
        <button class="btn btn-sm btn-outline-secondary" data-page-nav="prev" ${prevDisabled}>${tr({ ru: "Назад", uz: "Oldingi", en: "Prev" })}</button>
        <span class="small text-muted">${tr({ ru: "Страница", uz: "Sahifa", en: "Page" })} ${page} / ${pages}</span>
        <button class="btn btn-sm btn-outline-secondary" data-page-nav="next" ${nextDisabled}>${tr({ ru: "Далее", uz: "Keyingi", en: "Next" })}</button>
      </div>
    </div>
  `;
}

export function bindPager(viewEl, pagination, onChange) {
  const sizeEl = viewEl.querySelector("[data-page-size]");
  if (sizeEl) {
    sizeEl.addEventListener("change", () => {
      onChange({ page: 1, page_size: Number(sizeEl.value || 50) });
    });
  }

  viewEl.querySelectorAll("[data-page-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.getAttribute("data-page-nav");
      const currentPage = Number(pagination?.page || 1);
      const nextPage = dir === "prev" ? currentPage - 1 : currentPage + 1;
      onChange({ page: nextPage, page_size: Number(pagination?.page_size || 50) });
    });
  });
}

export function queueRender(viewEl, key, fn, delay = 220) {
  clearTimeout(viewEl[key]);
  viewEl[key] = setTimeout(fn, delay);
}

export function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function selectOptions(items, selectedValue, placeholder = "") {
  const opts = [];
  if (placeholder) opts.push(`<option value="">${placeholder}</option>`);
  for (const item of items || []) {
    opts.push(`<option value="${item.id}" ${String(item.id) === String(selectedValue ?? "") ? "selected" : ""}>${String(item.name || "")}</option>`);
  }
  return opts.join("");
}
