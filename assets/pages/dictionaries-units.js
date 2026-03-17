import { renderSimpleEntity, activeBadge, esc } from "./simple-entity.js";

export async function render(ctx) {
  return renderSimpleEntity(ctx, {
    endpoint: "/units",
    fields: [
      { name: "name", label: "Название", type: "text" },
      { name: "sort_order", label: "Порядок", type: "number", defaultValue: 100 },
      { name: "is_active", label: "Активный", type: "bool", defaultValue: 1 },
    ],
    defaults: { sort_order: 100, is_active: 1 },
    columns: [
      { name: "name", label: "Название" },
      { name: "sort_order", label: "Порядок" },
      { name: "is_active", label: "Статус", render: (item) => activeBadge(item.is_active) },
    ],
    mobile: (item) => `
      <div class="fw-semibold">${esc(item.name)}</div>
      <div class="small text-muted mt-2">Порядок: ${item.sort_order}</div>
      <div class="small text-muted">${activeBadge(item.is_active)}</div>
    `,
    canWrite: ({ accessFor, state }) => accessFor(state.me.role).dictionaries_units.write
  });
}
