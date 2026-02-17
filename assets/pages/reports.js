function reportName(r, lang) {
  if (lang === "uz") return r.name_uz || r.code;
  if (lang === "en") return r.name_en || r.code;
  return r.name_ru || r.code;
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
        <div class="col-md-8"><label class="form-label">Search business</label><input id="r_q" class="form-control" value="${esc(q)}"></div>
      </div>
    </div></div>
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>ID</th><th>${t("business")}</th><th>Enabled reports</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
          ${items.map(x => `<tr>
            <td>${x.business_id}</td>
            <td>${esc(x.business_name)}</td>
            <td>${esc(x.enabled_reports || "")}</td>
            ${canWrite ? `<td><button class="btn btn-xs btn-outline-primary" data-open="${x.business_id}">${t("edit")}</button></td>` : ""}
          </tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;

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
        <label class="form-check-label" for="rep_${esc(r.code)}">${esc(reportName(r, lang))} <span class="text-muted">(${esc(r.code)})</span></label>
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
