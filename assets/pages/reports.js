function reportName(r, lang) {
  if (lang === "uz") return r.name_uz || r.name_ru || r.name_en || "Report";
  if (lang === "en") return r.name_en || r.name_ru || r.name_uz || "Report";
  return r.name_ru || r.name_uz || r.name_en || "Отчет";
}

function desktopTableHtml(items, canWrite, t, esc) {
  return `
    <div class="card d-none d-lg-block"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>${t("business")}</th><th>Enabled reports</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
          ${items.map(x => {
            const enabledCount = String(x.enabled_reports || "").split(",").filter(Boolean).length;
            return `<tr>
              <td>${esc(x.business_name)}</td>
              <td>${enabledCount}</td>
              ${canWrite ? `<td><button class="btn btn-sm btn-outline-primary" data-open="${x.business_id}">${t("edit")}</button></td>` : ""}
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div></div>`;
}

function mobileCardsHtml(items, canWrite, t, esc) {
  return `
    <div class="d-lg-none">
      ${items.map(x => {
        const enabledCount = String(x.enabled_reports || "").split(",").filter(Boolean).length;
        return `
          <div class="card mb-2 shadow-sm">
            <div class="card-body p-3">
              <div class="fw-semibold">${esc(x.business_name)}</div>
              <div class="small text-muted mt-2">Enabled reports: ${enabledCount}</div>
              ${canWrite ? `<div class="d-flex gap-2 flex-wrap mt-3"><button class="btn btn-sm btn-outline-primary" data-open="${x.business_id}">${t("edit")}</button></div>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>`;
}

export async function render(ctx) {
  const { page, t, api, esc, viewEl, state, accessFor, openModal } = ctx;
  page("reportsAccess");
  const canWrite = accessFor(state.me.role).reports.write;
  const lang = document.documentElement.lang || "ru";
  const q = viewEl.getAttribute("data-q") || "";

  const list = await api("/gekto/business-reports");
  let items = list.items || [];
  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(x => String(x.business_name || "").toLowerCase().includes(ql));
  }

  viewEl.innerHTML = `
    <div class="card mb-3"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-8"><label class="form-label">Search business</label><input id="r_q" class="form-control" value="${esc(q)}"></div>
      </div>
    </div></div>
    ${desktopTableHtml(items, canWrite, t, esc)}
    ${mobileCardsHtml(items, canWrite, t, esc)}`;

  const qEl = document.getElementById("r_q");
  qEl.addEventListener("input", () => {
    const next = qEl.value.trim();
    if (next.length !== 0 && next.length < 3) return;
    viewEl.setAttribute("data-q", next);
    clearTimeout(viewEl.__fltTimer);
    viewEl.__fltTimer = setTimeout(() => render(ctx), 220);
  });

  if (!canWrite) return;

  document.querySelectorAll("[data-open]").forEach(btn => btn.onclick = async () => {
    const id = Number(btn.dataset.open);
    const detail = await api("/gekto/business-reports/" + id);
    const reports = detail.reports || [];
    const bodyHtml = reports.map(r => `
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" value="${esc(r.code)}" id="rep_${esc(r.code)}" ${Number(r.is_enabled) === 1 ? "checked" : ""}>
        <label class="form-check-label" for="rep_${esc(r.code)}">${esc(reportName(r, lang))}</label>
      </div>`).join("");

    openModal({
      title: `${t("business")}: ${detail.business?.name || id}`,
      bodyHtml,
      onSave: async (modalEl) => {
        const enabled = new Set(Array.from(modalEl.querySelectorAll('input[type="checkbox"]:checked')).map(x => x.value));
        const payload = reports.map(r => ({ code: r.code, is_enabled: enabled.has(r.code) ? 1 : 0 }));
        await api("/gekto/business-reports/" + id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reports: payload })
        });
        await render(ctx);
      }
    });
  });
}
