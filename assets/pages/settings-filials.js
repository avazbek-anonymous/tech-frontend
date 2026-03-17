import { renderSimpleEntity, activeBadge, esc } from "./simple-entity.js";

export async function render(ctx) {
  return renderSimpleEntity(ctx, {
    endpoint: "/filials",
    fields: [
      { name: "name", label: "Название", type: "text" },
      { name: "is_active", label: "Активный", type: "bool", defaultValue: 1 },
    ],
    defaults: { is_active: 1 },
    columns: [
      { name: "name", label: "Название" },
      { name: "is_active", label: "Статус", render: (item) => activeBadge(item.is_active) },
    ],
    mobile: (item) => `
      <div class="fw-semibold">${esc(item.name)}</div>
      <div class="small text-muted mt-2">${activeBadge(item.is_active)}</div>
    `,
    canWrite: ({ accessFor, state }) => accessFor(state.me.role).settings_filials.write
  });
}
