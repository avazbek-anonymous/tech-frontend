import { t } from "/assets/app.js";

let inited = false;

function escHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function ensureModal() {
  if (inited) return;
  inited = true;

  const wrap = document.createElement("div");
  wrap.id = "techModal";
  wrap.style.cssText = `
    position: fixed; inset: 0;
    display: none;
    align-items: center; justify-content: center;
    padding: 18px;
    z-index: 9999;
  `;

  wrap.innerHTML = `
    <div id="techModalBackdrop" style="
      position:absolute; inset:0;
      background: rgba(0,0,0,.35);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    "></div>

    <div id="techModalCard" class="card pad" style="
      position:relative;
      width: min(520px, 92vw);
      border-radius: var(--r);
      box-shadow: var(--shadow);
    ">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <div id="techModalTitle" style="font-weight:800; font-size:16px;"></div>
          <div id="techModalSub" class="muted" style="margin-top:3px;"></div>
        </div>

        <button id="techModalClose" class="btn icon" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="techModalBody" style="margin-top:12px;"></div>

      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:14px; flex-wrap:wrap;">
        <button id="techModalCancel" class="btn"></button>
        <button id="techModalOk" class="btn primary"></button>
      </div>

      <div id="techModalMsg" class="msg" style="margin-top:10px;"></div>
    </div>
  `;

  document.body.appendChild(wrap);

  const close = () => hideModal();

  wrap.querySelector("#techModalBackdrop").addEventListener("click", close);
  wrap.querySelector("#techModalClose").addEventListener("click", close);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideModal();
  });
}

export function hideModal() {
  const wrap = document.getElementById("techModal");
  if (!wrap) return;
  wrap.style.display = "none";
  wrap.dataset.busy = "0";
  wrap.dataset.onok = "";
}

export function openModal({ title, sub = "", bodyHtml = "", okText, cancelText, onOk }) {
  ensureModal();

  const wrap = document.getElementById("techModal");
  const titleEl = wrap.querySelector("#techModalTitle");
  const subEl = wrap.querySelector("#techModalSub");
  const bodyEl = wrap.querySelector("#techModalBody");
  const msgEl = wrap.querySelector("#techModalMsg");

  const okBtn = wrap.querySelector("#techModalOk");
  const cancelBtn = wrap.querySelector("#techModalCancel");

  titleEl.textContent = title || "";
  subEl.textContent = sub || "";
  bodyEl.innerHTML = bodyHtml || "";
  msgEl.textContent = "";

  cancelBtn.textContent = cancelText || (t("cancel") || "Cancel");
  okBtn.textContent = okText || (t("save") || "Save");

  wrap.style.display = "flex";
  wrap.dataset.busy = "0";

  cancelBtn.onclick = () => hideModal();

  okBtn.onclick = async () => {
    if (wrap.dataset.busy === "1") return;

    try {
      wrap.dataset.busy = "1";
      okBtn.disabled = true;
      cancelBtn.disabled = true;

      const res = await (onOk ? onOk() : true);
      if (res !== false) hideModal();
    } catch (e) {
      msgEl.style.color = "var(--danger)";
      msgEl.textContent = (e?.message || String(e));
    } finally {
      wrap.dataset.busy = "0";
      okBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  };
}

// helper for simple text input modal
export function promptModal({ title, label, value = "", placeholder = "", okText, cancelText }) {
  ensureModal();

  const id = "techModalInput_" + Math.random().toString(16).slice(2);
  return new Promise((resolve) => {
    openModal({
      title,
      bodyHtml: `
        <label class="muted" for="${id}" style="display:block; margin-bottom:6px;">${escHtml(label || "")}</label>
        <input id="${id}" class="inp" value="${escHtml(value)}" placeholder="${escHtml(placeholder)}" />
      `,
      okText,
      cancelText,
      onOk: async () => {
        const inp = document.getElementById(id);
        const v = (inp?.value || "").trim();
        resolve(v);
      }
    });

    // focus
    setTimeout(() => {
      const inp = document.getElementById(id);
      if (inp) inp.focus();
    }, 30);

    // override cancel to resolve null
    const wrap = document.getElementById("techModal");
    wrap.querySelector("#techModalCancel").onclick = () => {
      hideModal();
      resolve(null);
    };
  });
}
// Красивое подтверждение вместо window.confirm()
// usage:
// const ok = await confirmModal({ title:"...", bodyHtml:"...", okText:"...", cancelText:"..." });
// if(!ok) return;

export function confirmModal({
  title = "Confirm",
  sub = "",
  bodyHtml = "",
  okText = "OK",
  cancelText = "Cancel",
  danger = false
} = {}) {
  return new Promise((resolve) => {
    openModal({
      title,
      sub,
      bodyHtml,
      okText,
      cancelText,
      // если твой openModal поддерживает kind — можно подсветить danger
      // kind: danger ? "danger" : "primary",
      onOk: async () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
}
