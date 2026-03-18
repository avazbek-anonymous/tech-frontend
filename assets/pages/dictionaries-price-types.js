import { renderSimpleEntity, activeBadge, esc } from "./simple-entity.js";

export async function render(ctx) {
  const currenciesResp = await ctx.api("/currencies?page=1&page_size=100");
  const currencies = (currenciesResp.items || []).map((item) => ({
    value: item.id,
    label: item.symbol ? `${item.name} (${item.symbol})` : item.name,
  }));

  return renderSimpleEntity(ctx, {
    endpoint: "/price-types",
    fields: [
      { name: "name", label: "Название", type: "text" },
      { name: "currency_id", label: "Валюта", type: "select", valueType: "number", options: [{ value: "", label: "Выбрать" }, ...currencies] },
      { name: "sort_order", label: "Порядок", type: "number", defaultValue: 100 },
      { name: "show_in_products", label: "Показывать в товарах", type: "bool", defaultValue: 1 },
      { name: "is_active", label: "Активный", type: "bool", defaultValue: 1 },
    ],
    defaults: { sort_order: 100, show_in_products: 1, is_active: 1 },
    columns: [
      { name: "name", label: "Название" },
      { name: "currency_name", label: "Валюта", render: (item) => esc(item.currency_symbol ? `${item.currency_name} (${item.currency_symbol})` : (item.currency_name || "")) },
      { name: "show_in_products", label: "В товарах", render: (item) => Number(item.show_in_products) === 1 ? '<span class="badge text-bg-primary">Да</span>' : '<span class="text-muted">Нет</span>' },
      { name: "sort_order", label: "Порядок" },
      { name: "is_active", label: "Статус", render: (item) => activeBadge(item.is_active) },
    ],
    mobile: (item) => `
      <div class="fw-semibold">${esc(item.name)}</div>
      <div class="small text-muted mt-2">Валюта: ${esc(item.currency_symbol ? `${item.currency_name} (${item.currency_symbol})` : (item.currency_name || "-"))}</div>
      <div class="small text-muted">В товарах: ${Number(item.show_in_products) === 1 ? "Да" : "Нет"}</div>
      <div class="small text-muted">Порядок: ${item.sort_order}</div>
      <div class="small text-muted">${activeBadge(item.is_active)}</div>
    `,
    canWrite: ({ accessFor, state }) => accessFor(state.me.role).dictionaries_price_types.write
  });
}