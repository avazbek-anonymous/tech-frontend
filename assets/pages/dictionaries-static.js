import { sectionTitle } from "./mvp-utils.js";

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function render(ctx) {
  const { page, section, viewEl, api } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });

  const [citiesResp, phoneFormatsResp] = await Promise.all([
    api("/cities"),
    api("/phone-formats")
  ]);

  const cities = citiesResp.items || [];
  const phoneFormats = phoneFormatsResp.items || [];

  viewEl.innerHTML = `
    <div class="row g-3">
      <div class="col-12 col-xl-6">
        <div class="card h-100">
          <div class="card-body table-wrap">
            <h5 class="mb-3">Города</h5>
            <table class="table table-sm table-bordered align-middle mb-0">
              <thead><tr><th>Название</th></tr></thead>
              <tbody>
                ${cities.map((item) => `<tr><td>${esc(item.name)}</td></tr>`).join("") || '<tr><td class="text-muted">Нет данных</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-12 col-xl-6">
        <div class="card h-100">
          <div class="card-body table-wrap">
            <h5 class="mb-3">Форматы телефонов</h5>
            <table class="table table-sm table-bordered align-middle mb-0">
              <thead><tr><th>Маска</th><th>Пример</th></tr></thead>
              <tbody>
                ${phoneFormats.map((item) => `<tr><td>${esc(item.mask)}</td><td>${esc(item.example || "")}</td></tr>`).join("") || '<tr><td colspan="2" class="text-muted">Нет данных</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}
