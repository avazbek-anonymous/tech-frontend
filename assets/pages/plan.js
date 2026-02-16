export async function render(ctx) {
  const { page, t, monthNow, api, viewEl, state, accessFor } = ctx;
  page("revenuePlan");
  const canWrite = accessFor(state.me.role).plan.write;
  const month = monthNow();
  const item = (await api("/gekto/revenue-plan?month=" + month)).item;
  viewEl.innerHTML = `
    <div class="card"><div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-3"><label class="form-label">${t("month")}</label><input class="form-control" value="${month}" readonly></div>
        <div class="col-md-4"><label class="form-label">${t("monthPlan")}</label><input id="planValue" type="number" min="0" class="form-control" value="${Number(item.planned_amount || 0)}" ${canWrite ? "" : "disabled"}></div>
        ${canWrite ? `<div class="col-md-2 d-grid"><button class="btn btn-primary" id="planSave">${t("save")}</button></div>` : ""}
      </div>
    </div></div>`;
  if (canWrite) {
    document.getElementById("planSave").onclick = async () => {
      await api("/gekto/revenue-plan", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month_key: month, planned_amount: Number(document.getElementById("planValue").value || 0) })
      });
      render(ctx);
    };
  }
}
