export async function render(ctx) {
  const { page, t, api, esc, viewEl, state, accessFor } = ctx;
  page("reportsAccess");
  const canWrite = accessFor(state.me.role).reports.write;
  const list = await api("/gekto/business-reports");
  viewEl.innerHTML = `
    <div class="card"><div class="card-body table-wrap">
      <table class="table table-sm table-bordered">
        <thead><tr><th>ID</th><th>${t("business")}</th><th>Enabled</th>${canWrite ? `<th>${t("action")}</th>` : ""}</tr></thead>
        <tbody>
          ${(list.items || []).map(x => `<tr><td>${x.business_id}</td><td>${esc(x.business_name)}</td><td>${esc(x.enabled_reports || "")}</td>${canWrite ? `<td><button class="btn btn-xs btn-outline-primary" data-open="${x.business_id}">${t("edit")}</button></td>` : ""}</tr>`).join("")}
        </tbody>
      </table>
    </div></div>`;
  if (!canWrite) return;
  document.querySelectorAll("[data-open]").forEach(btn => btn.onclick = async () => {
    const id = Number(btn.dataset.open);
    const detail = await api("/gekto/business-reports/" + id);
    const current = detail.reports.filter(r => Number(r.is_enabled) === 1).map(r => r.code).join(",");
    const next = prompt("codes comma separated", current);
    if (next === null) return;
    const enabledSet = new Set(next.split(",").map(s => s.trim()).filter(Boolean));
    const payload = detail.reports.map(r => ({ code: r.code, is_enabled: enabledSet.has(r.code) ? 1 : 0 }));
    await api("/gekto/business-reports/" + id, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reports: payload })
    });
    render(ctx);
  });
}
