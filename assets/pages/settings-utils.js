export function langOf() {
  return document.documentElement.lang || "ru";
}

export function pick(dict, lang, key) {
  const set = dict[lang] || dict.ru || {};
  return set[key] || (dict.ru && dict.ru[key]) || key;
}

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function ynBadge(value, labels) {
  if (value) {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">${esc(labels.yes)}</span>`;
  }
  return `<span class="badge text-bg-secondary">${esc(labels.no)}</span>`;
}

export function activeBadge(value, labels) {
  if (Number(value) === 1) {
    return `<span class="badge text-bg-success-subtle border border-success-subtle">${esc(labels.active)}</span>`;
  }
  return `<span class="badge text-bg-secondary">${esc(labels.inactive)}</span>`;
}

export function noAccessHtml(text) {
  return `<div class="alert alert-warning mb-0">${esc(text)}</div>`;
}

export function errorHtml(text) {
  return `<div class="alert alert-danger mb-0">${esc(text)}</div>`;
}

export function emptyHtml(text) {
  return `<div class="alert alert-light border mb-0">${esc(text)}</div>`;
}

export function formatTs(ts, lang) {
  if (!ts) return "-";
  const locale = lang === "uz" ? "uz-UZ" : (lang === "en" ? "en-US" : "ru-RU");
  return new Date(Number(ts) * 1000).toLocaleString(locale);
}

export function queueRerender(viewEl, key, fn, delay = 180) {
  clearTimeout(viewEl[key]);
  viewEl[key] = setTimeout(fn, delay);
}

export function sectionTitle(section, lang) {
  if (!section) return "";
  if (typeof section.label === "string") return section.label;
  if (section.label && typeof section.label === "object") {
    return section.label[lang] || section.label.ru || section.label.en || section.id || "";
  }
  return section.key || section.id || "";
}
