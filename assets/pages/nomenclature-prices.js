import { bindPager, pagerHtml, queueRender, sectionTitle, selectOptions } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, fmt } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });
  const canWrite = accessFor(state.me.role).prices.write;

  const filters = {
    q: viewEl.dataset.q || "",
    filial_id: viewEl.dataset.filial_id || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };

  const filialsResp = await api("/filials?page=1&page_size=100");
  const filials = filialsResp.items || [];
  if (!filters.filial_id && filials[0]?.id) filters.filial_id = String(filials[0].id);

  const qs = new URLSearchParams({
    filial_id: String(filters.filial_id || ""),
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);

  const listResp = filters.filial_id
    ? await api(`/prices?${qs.toString()}`)
    : { items: [], pagination: { page: 1, pages: 1, total: 0, page_size: filters.page_size } };
  const items = listResp.items || [];
  const pagination = listResp.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-4"><label class="form-label">Поиск</label><input id="price_q" class="form-control" value="${esc(filters.q)}"></div>
        <div class="col-12 col-md-3"><label class="form-label">Филиал</label><select id="price_filial" class="form-select">${selectOptions(filials, filters.filial_id, "Выбрать")}</select></div>
        ${canWrite ? `<div class="col-12 col-md-3 d-grid"><button id="price_save" class="btn btn-primary">Сохранить цены</button></div>` : `<div class="col-12 col-md-3"></div>`}
      </div>
    </div></div>

    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead><tr><th>Товар</th><th>Категория</th><th>Ед. изм.</th><th>Остаток</th><th>Цена</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${esc(item.name)}</td>
              <td>${esc(item.category_name || "")}</td>
              <td>${esc(item.unit_name || "")}</td>
              <td>${fmt(item.stock_qty || 0)}</td>
              <td>${canWrite
                ? `<input class="form-control form-control-sm" data-price-input="${item.id}" value="${Number(item.price || 0)}">`
                : fmt(item.price || 0)
              }</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${pagerHtml(pagination)}
    </div></div>
  `;

  viewEl.querySelector("#price_q")?.addEventListener("input", (ev) => {
    viewEl.dataset.q = ev.target.value.trim();
    queueRender(viewEl, "__priceTimer", () => {
      viewEl.dataset.page = "1";
      render(ctx);
    });
  });

  viewEl.querySelector("#price_filial")?.addEventListener("change", (ev) => {
    viewEl.dataset.filial_id = ev.target.value;
    viewEl.dataset.page = "1";
    render(ctx);
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    render(ctx);
  });

  if (!canWrite) return;

  viewEl.querySelector("#price_save")?.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Сохранение...';
    try {
      const payload = items.map((item) => ({
        product_id: item.id,
        price: Number(viewEl.querySelector(`[data-price-input="${item.id}"]`)?.value || 0)
      }));
      await api("/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filial_id: Number(filters.filial_id || 0),
          items: payload
        })
      });
      await render(ctx);
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldHtml;
    }
  });
}
