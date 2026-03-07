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

function normBool01(v, fallback = 0) {
  if (v === 1 || v === "1" || v === true) return 1;
  if (v === 0 || v === "0" || v === false) return 0;
  return fallback;
}

function trLabel(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru || value.en || "";
}

export function createFieldAccess(items = []) {
  const byKey = new Map();

  for (const raw of Array.isArray(items) ? items : []) {
    const fieldKey = String(raw?.field_key || "").trim();
    if (!fieldKey) continue;
    byKey.set(fieldKey, {
      field_key: fieldKey,
      label: raw?.label || null,
      is_enabled: normBool01(raw?.is_enabled, 1),
      is_required: normBool01(raw?.is_required, 0),
      show_in_form: normBool01(raw?.show_in_form, 1),
      show_in_list: normBool01(raw?.show_in_list, 1),
      show_in_filters: normBool01(raw?.show_in_filters, 1),
      show_in_card: normBool01(raw?.show_in_card, 1)
    });
  }

  const get = (fieldKey) => byKey.get(String(fieldKey || "").trim()) || null;
  const isEnabled = (fieldKey) => {
    const row = get(fieldKey);
    return !row || Number(row.is_enabled) === 1;
  };
  const isRequired = (fieldKey) => {
    const row = get(fieldKey);
    return Boolean(row && Number(row.is_enabled) === 1 && Number(row.is_required) === 1);
  };

  const visibleBy = (fieldKey, flag) => {
    const row = get(fieldKey);
    if (!row) return true;
    if (Number(row.is_enabled) !== 1) return false;
    return Number(row[flag]) === 1;
  };

  return {
    byKey,
    hasRules: byKey.size > 0,
    get,
    isEnabled,
    isRequired,
    showInForm: (fieldKey) => visibleBy(fieldKey, "show_in_form"),
    showInList: (fieldKey) => visibleBy(fieldKey, "show_in_list"),
    showInFilters: (fieldKey) => visibleBy(fieldKey, "show_in_filters"),
    showInCard: (fieldKey) => visibleBy(fieldKey, "show_in_card"),
    label: (fieldKey, lang, fallback = "") => {
      const row = get(fieldKey);
      if (!row) return fallback || fieldKey;
      const value = trLabel(row.label, lang);
      return value || fallback || fieldKey;
    }
  };
}

export async function loadEntityFieldAccess(api, entityKey) {
  const safe = createFieldAccess([]);
  const key = String(entityKey || "").trim();
  if (!key || typeof api !== "function") return safe;

  try {
    const resp = await api(`/business-settings/fields/effective?entity_key=${encodeURIComponent(key)}`);
    return createFieldAccess(resp?.items || []);
  } catch {
    return safe;
  }
}

export function stripDisabledFields(payload, fieldAccess) {
  const src = payload && typeof payload === "object" ? payload : {};
  if (!fieldAccess || typeof fieldAccess.isEnabled !== "function") return { ...src };

  const out = {};
  for (const [key, value] of Object.entries(src)) {
    if (fieldAccess.isEnabled(key)) out[key] = value;
  }
  return out;
}

export function isEmptyFieldValue(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}
