import { activeBadge, esc } from "./simple-entity.js";
import { bindPager, pagerHtml, queueRender, sectionTitle } from "./mvp-utils.js";

function sourceLabel(item) {
  const source = String(item.rate_source || "manual").toLowerCase();
  if (String(item.code || "").toUpperCase() === "UZS") return "Фиксированный";
  if (source === "cbu") return "ЦБ";
  if (source === "bank") {
    return String(item.rate_direction || "sell").toLowerCase() === "buy" ? "Банк: покупка" : "Банк: продажа";
  }
  return "Ручной";
}

function formatRate(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n);
}

function formatTs(value) {
  const n = Number(value || 0);
  if (!(n > 0)) return "-";
  return new Date(n * 1000).toLocaleString();
}

function boolSelect(name, value) {
  return `
    <select class="form-select" name="${name}">
      <option value="1" ${Number(value || 0) === 1 ? "selected" : ""}>Да</option>
      <option value="0" ${Number(value || 0) === 0 ? "selected" : ""}>Нет</option>
    </select>
  `;
}

function currencyCreateHtml() {
  return `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Код</label>
        <input class="form-control" name="code" placeholder="Например, AED">
      </div>
      <div class="col-md-6">
        <label class="form-label">Название</label>
        <input class="form-control" name="name" placeholder="Например, AED">
      </div>
      <div class="col-md-6">
        <label class="form-label">Символ</label>
        <input class="form-control" name="symbol" placeholder="Например, د.إ">
      </div>
      <div class="col-md-6">
        <label class="form-label">Курс к UZS</label>
        <input class="form-control" type="number" min="0.0001" step="0.0001" name="rate_value" value="1">
      </div>
      <div class="col-md-6">
        <label class="form-label">Порядок</label>
        <input class="form-control" type="number" name="sort_order" value="100">
      </div>
      <div class="col-md-6">
        <label class="form-label">Активный</label>
        ${boolSelect("is_active", 1)}
      </div>
      <div class="col-12">
        <div class="alert alert-info mb-0">Пользовательские валюты работают в ручном режиме: курс задается вручную, банк и автообновление не используются.</div>
      </div>
    </div>
  `;
}

function currencySystemHtml(item = {}) {
  const code = String(item.code || "").toUpperCase();
  if (code === "UZS") {
    return `
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Код</label>
          <input class="form-control" value="${esc(code)}" readonly>
        </div>
        <div class="col-md-4">
          <label class="form-label">Название</label>
          <input class="form-control" value="${esc(item.name || code)}" readonly>
        </div>
        <div class="col-md-4">
          <label class="form-label">Курс к UZS</label>
          <input class="form-control" value="1" readonly>
        </div>
        <div class="col-12">
          <div class="alert alert-info mb-0">UZS — системная валюта. Она всегда активна, всегда основная и всегда имеет курс 1.</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Код</label>
        <input class="form-control" value="${esc(code)}" readonly>
      </div>
      <div class="col-md-4">
        <label class="form-label">Название</label>
        <input class="form-control" value="${esc(item.name || code)}" readonly>
      </div>
      <div class="col-md-4">
        <label class="form-label">Активный</label>
        ${boolSelect("is_active", Number(item.is_active || 0))}
      </div>
      <div class="col-md-4">
        <label class="form-label">Источник курса</label>
        <select class="form-select" name="rate_source">
          <option value="cbu" ${String(item.rate_source || "cbu") === "cbu" ? "selected" : ""}>ЦБ</option>
          <option value="bank" ${String(item.rate_source || "") === "bank" ? "selected" : ""}>Банк</option>
        </select>
      </div>
      <div class="col-md-4" data-direction-wrap>
        <label class="form-label">Режим банка</label>
        <select class="form-select" name="rate_direction">
          <option value="buy" ${String(item.rate_direction || "") === "buy" ? "selected" : ""}>Покупка</option>
          <option value="sell" ${String(item.rate_direction || "sell") === "sell" ? "selected" : ""}>Продажа</option>
        </select>
      </div>
      <div class="col-md-4" data-bank-wrap>
        <label class="form-label">Bank Name</label>
        <select class="form-select" name="bank_name"><option value="">Загрузка...</option></select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Текущий курс к UZS</label>
        <input class="form-control" name="rate_preview" value="${esc(formatRate(item.rate_value || 0))}" readonly>
      </div>
      <div class="col-md-4">
        <label class="form-label">Обновлен</label>
        <input class="form-control" value="${esc(formatTs(item.rate_updated_at))}" readonly>
      </div>
      <div class="col-md-4">
        <label class="form-label">Порядок</label>
        <input class="form-control" type="number" name="sort_order" value="${Number(item.sort_order || 100)}">
      </div>
      <div class="col-12">
        <div class="alert alert-info mb-0">Для системных валют курс обновляется автоматически с bank.uz. Пользователь выбирает только источник курса: ЦБ или конкретный банк.</div>
      </div>
    </div>
  `;
}

function currencyCustomHtml(item = {}) {
  return `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Код</label>
        <input class="form-control" name="code" value="${esc(item.code || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Название</label>
        <input class="form-control" name="name" value="${esc(item.name || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Символ</label>
        <input class="form-control" name="symbol" value="${esc(item.symbol || "")}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Курс к UZS</label>
        <input class="form-control" type="number" min="0.0001" step="0.0001" name="rate_value" value="${Number(item.rate_value || 1)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Порядок</label>
        <input class="form-control" type="number" name="sort_order" value="${Number(item.sort_order || 100)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Активный</label>
        ${boolSelect("is_active", Number(item.is_active || 0))}
      </div>
      <div class="col-12">
        <div class="alert alert-info mb-0">Пользовательская валюта работает вручную: курс хранится в справочнике и не обновляется с bank.uz.</div>
      </div>
    </div>
  `;
}

function readCreateForm(root) {
  return {
    code: root.querySelector("[name='code']")?.value.trim().toUpperCase() || "",
    name: root.querySelector("[name='name']")?.value.trim() || "",
    symbol: root.querySelector("[name='symbol']")?.value.trim() || "",
    rate_value: Number(root.querySelector("[name='rate_value']")?.value || 0),
    sort_order: Number(root.querySelector("[name='sort_order']")?.value || 100),
    is_active: Number(root.querySelector("[name='is_active']")?.value || 1),
  };
}

async function mountSystemCurrencyModal(ctx, modalEl, item) {
  const code = String(item.code || "").toUpperCase();
  if (code === "UZS") return;

  const optionsResp = await ctx.api(`/currencies/rate-options?code=${encodeURIComponent(code)}`);
  const options = optionsResp.item || { cbu_rate: null, banks: [] };
  const sourceEl = modalEl.querySelector("[name='rate_source']");
  const directionEl = modalEl.querySelector("[name='rate_direction']");
  const bankEl = modalEl.querySelector("[name='bank_name']");
  const previewEl = modalEl.querySelector("[name='rate_preview']");
  const bankWrap = modalEl.querySelector("[data-bank-wrap]");
  const directionWrap = modalEl.querySelector("[data-direction-wrap]");

  const renderBanks = () => {
    const selected = String(item.bank_name || "");
    bankEl.innerHTML = [
      `<option value="">Выбрать банк</option>`,
      ...(options.banks || []).map((bank) => `<option value="${esc(bank.name)}" ${bank.name === selected ? "selected" : ""}>${esc(bank.name)}</option>`),
    ].join("");
  };

  const resolvePreview = () => {
    const source = sourceEl.value;
    if (source === "cbu") {
      previewEl.value = formatRate(options.cbu_rate || 0);
      bankWrap.style.display = "none";
      directionWrap.style.display = "none";
      return;
    }
    bankWrap.style.display = "";
    directionWrap.style.display = "";
    const direction = directionEl.value === "buy" ? "buy_rate" : "sell_rate";
    const bank = (options.banks || []).find((row) => row.name === bankEl.value);
    previewEl.value = formatRate(bank?.[direction] || 0);
  };

  renderBanks();
  if (!bankEl.value && item.bank_name) bankEl.value = item.bank_name;
  sourceEl.addEventListener("change", resolvePreview);
  directionEl.addEventListener("change", resolvePreview);
  bankEl.addEventListener("change", resolvePreview);
  resolvePreview();
}

async function openEditCurrency(ctx, item, rerender) {
  const isSystem = Number(item.is_system || 0) === 1;
  const title = isSystem ? `Валюта: ${item.code || item.name}` : `Изменить валюту: ${item.code || item.name}`;
  const bodyHtml = isSystem
    ? currencySystemHtml(item)
    : currencyCustomHtml(item);

  ctx.openModal({
    title,
    bodyHtml,
    onMount: async (modalEl) => {
      if (isSystem) await mountSystemCurrencyModal(ctx, modalEl, item);
    },
    onSave: async (modalEl) => {
      let payload = {};
      if (isSystem) {
        if (String(item.code || "").toUpperCase() === "UZS") {
          payload = {
            sort_order: Number(item.sort_order || 10),
            symbol: item.symbol || "сум",
          };
        } else {
          payload = {
            is_active: Number(modalEl.querySelector("[name='is_active']")?.value || 0),
            rate_source: modalEl.querySelector("[name='rate_source']")?.value || "cbu",
            rate_direction: modalEl.querySelector("[name='rate_direction']")?.value || "sell",
            bank_name: modalEl.querySelector("[name='bank_name']")?.value || "",
            sort_order: Number(modalEl.querySelector("[name='sort_order']")?.value || item.sort_order || 100),
          };
        }
      } else {
        payload = {
          code: modalEl.querySelector("[name='code']")?.value.trim().toUpperCase() || "",
          name: modalEl.querySelector("[name='name']")?.value.trim() || "",
          symbol: modalEl.querySelector("[name='symbol']")?.value.trim() || "",
          rate_value: Number(modalEl.querySelector("[name='rate_value']")?.value || 0),
          sort_order: Number(modalEl.querySelector("[name='sort_order']")?.value || 100),
          is_active: Number(modalEl.querySelector("[name='is_active']")?.value || 0),
        };
      }

      await ctx.api(`/currencies/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await rerender();
    },
  });
}

export async function render(ctx) {
  const { page, section, viewEl, api, accessFor, state, openModal } = ctx;
  const title = sectionTitle(section);
  page(title, "", { raw: true });
  const canWrite = accessFor(state.me.role).dictionaries_currencies.write;

  const filters = {
    q: viewEl.dataset.q || "",
    page: Number(viewEl.dataset.page || 1),
    page_size: Number(viewEl.dataset.page_size || 50),
  };

  const qs = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.page_size),
  });
  if (filters.q) qs.set("q", filters.q);

  const data = await api(`/currencies?${qs.toString()}`);
  const items = data.items || [];
  const pagination = data.pagination || { page: 1, pages: 1, total: items.length, page_size: filters.page_size };

  const rerender = () => render(ctx);

  viewEl.innerHTML = `
    <div class="card entity-toolbar-card mb-3"><div class="card-body">
      <div class="entity-toolbar-shell">
        <div class="entity-toolbar-main">
          <div class="entity-toolbar-item entity-toolbar-search">
            <label class="form-label">Поиск</label>
            <input id="cur_q" class="form-control" value="${esc(filters.q)}" placeholder="Код, название или банк">
          </div>
        </div>
        ${canWrite ? `<div class="entity-toolbar-actions"><button class="btn btn-primary entity-toolbar-btn" id="cur_create">Создать</button></div>` : ""}
      </div>
    </div></div>

    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered align-middle">
        <thead>
          <tr>
            <th>Код</th>
            <th>Название</th>
            <th>Символ</th>
            <th>Курс</th>
            <th>Источник</th>
            <th>Bank Name</th>
            <th>Обновлен</th>
            <th>По умолчанию</th>
            <th>Статус</th>
            ${canWrite ? "<th>Действия</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><span class="fw-semibold">${esc(item.code || item.name || "")}</span>${Number(item.is_system || 0) === 1 ? '<div class="small text-muted">Системная</div>' : ''}</td>
              <td>${esc(item.name || "")}</td>
              <td>${esc(item.symbol || "")}</td>
              <td>${formatRate(item.rate_value || 0)}</td>
              <td>${esc(sourceLabel(item))}</td>
              <td>${esc(item.bank_name || "-")}</td>
              <td>${esc(formatTs(item.rate_updated_at))}</td>
              <td>${Number(item.is_default) === 1 ? '<span class="badge text-bg-primary">Да</span>' : '<span class="text-muted">Нет</span>'}</td>
              <td>${activeBadge(item.is_active)}</td>
              ${canWrite ? `<td><div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button>
                ${Number(item.is_system || 0) === 1 && String(item.code || "").toUpperCase() !== "UZS" ? `<button class="btn btn-sm btn-outline-secondary" data-refresh="${item.id}">Обновить курс</button>` : ""}
              </div></td>` : ""}
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
            <div class="fw-semibold">${esc(item.code || item.name || "")}</div>
            <div class="small text-muted mt-2">Название: ${esc(item.name || "-")}</div>
            <div class="small text-muted">Символ: ${esc(item.symbol || "-")}</div>
            <div class="small text-muted">Курс: ${formatRate(item.rate_value || 0)}</div>
            <div class="small text-muted">Источник: ${esc(sourceLabel(item))}</div>
            <div class="small text-muted">Bank Name: ${esc(item.bank_name || "-")}</div>
            <div class="small text-muted">Обновлен: ${esc(formatTs(item.rate_updated_at))}</div>
            <div class="small text-muted">По умолчанию: ${Number(item.is_default) === 1 ? "Да" : "Нет"}</div>
            <div class="small text-muted">${activeBadge(item.is_active)}</div>
            ${canWrite ? `<div class="entity-mobile-actions d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">Изменить</button>
              ${Number(item.is_system || 0) === 1 && String(item.code || "").toUpperCase() !== "UZS" ? `<button class="btn btn-sm btn-outline-secondary" data-refresh="${item.id}">Обновить курс</button>` : ""}
            </div>` : ""}
          </div>
        </div>
      `).join("")}
      ${pagerHtml(pagination)}
    </div>
  `;

  viewEl.querySelector("#cur_q")?.addEventListener("input", (ev) => {
    viewEl.dataset.q = ev.target.value.trim();
    queueRender(viewEl, "__curTimer", () => {
      viewEl.dataset.page = "1";
      rerender();
    });
  });

  bindPager(viewEl, pagination, ({ page, page_size }) => {
    viewEl.dataset.page = String(page);
    viewEl.dataset.page_size = String(page_size);
    rerender();
  });

  if (!canWrite) return;

  viewEl.querySelector("#cur_create")?.addEventListener("click", () => {
    openModal({
      title: "Создать пользовательскую валюту",
      bodyHtml: currencyCreateHtml(),
      onSave: async (modalEl) => {
        await api("/currencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readCreateForm(modalEl)),
        });
        await rerender();
      },
    });
  });

  viewEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = items.find((row) => Number(row.id) === Number(btn.getAttribute("data-edit")));
      if (!item) return;
      await openEditCurrency({ ...ctx, openModal }, item, rerender);
    });
  });

  viewEl.querySelectorAll("[data-refresh]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-refresh") || 0);
      if (!id) return;
      await api(`/currencies/${id}/refresh-rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      await rerender();
    });
  });
}
