import { renderSimpleEntity, activeBadge, esc } from "./simple-entity.js";

export async function render(ctx) {
  return renderSimpleEntity(ctx, {
    endpoint: "/currencies",
    fields: [
      { name: "name", label: "Название", type: "text" },
      { name: "symbol", label: "Символ", type: "text" },
      { name: "sort_order", label: "Порядок", type: "number", defaultValue: 100 },
      { name: "is_default", label: "По умолчанию", type: "bool", defaultValue: 0 },
      { name: "is_active", label: "Активный", type: "bool", defaultValue: 1 },
    ],
    defaults: { sort_order: 100, is_default: 0, is_active: 1 },
    columns: [
      { name: "name", label: "Название" },
      { name: "symbol", label: "Символ", render: (item) => esc(item.symbol || "") },
      { name: "is_default", label: "По умолчанию", render: (item) => Number(item.is_default) === 1 ? '<span class="badge text-bg-primary">Да</span>' : '<span class="text-muted">Нет</span>' },
      { name: "sort_order", label: "Порядок" },
      { name: "is_active", label: "Статус", render: (item) => activeBadge(item.is_active) },
    ],
    mobile: (item) => `
      <div class="fw-semibold">${esc(item.name)}</div>
      <div class="small text-muted mt-2">Символ: ${esc(item.symbol || "-")}</div>
      <div class="small text-muted">По умолчанию: ${Number(item.is_default) === 1 ? "Да" : "Нет"}</div>
      <div class="small text-muted">Порядок: ${item.sort_order}</div>
      <div class="small text-muted">${activeBadge(item.is_active)}</div>
    `,
    canWrite: ({ accessFor, state }) => accessFor(state.me.role).dictionaries_currencies.write
  });
}
