// assets/select.js
let opened = null;

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function closeAny() {
  if (!opened) return;
  opened.remove();
  opened = null;
}

export function enhanceSelect(selectEl) {
  if (!selectEl || selectEl.dataset.techSelect === "1") return;

  selectEl.dataset.techSelect = "1";
  selectEl.style.display = "none";

  const wrap = document.createElement("div");
  wrap.className = "tselect";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "inp tselect-btn";
  btn.innerHTML = `
    <span class="tselect-label"></span>
    <svg class="tselect-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const labelEl = btn.querySelector(".tselect-label");

  function syncLabel() {
    const opt = selectEl.options[selectEl.selectedIndex];
    labelEl.textContent = opt ? opt.textContent : "";
  }

  function open() {
    closeAny();

    const rect = btn.getBoundingClientRect();

    const pop = document.createElement("div");
    pop.className = "tselect-pop";
    pop.innerHTML = `
      <div class="tselect-backdrop"></div>
      <div class="tselect-panel card">
        <div class="tselect-list"></div>
      </div>
    `;

    const panel = pop.querySelector(".tselect-panel");
    const list = pop.querySelector(".tselect-list");

    // position
    const maxH = Math.min(320, window.innerHeight - rect.bottom - 14);
    panel.style.left = rect.left + "px";
    panel.style.top = (rect.bottom + 8) + "px";
    panel.style.width = rect.width + "px";
    panel.style.maxHeight = (maxH > 140 ? maxH : 260) + "px";

    // build options
    const curVal = selectEl.value;
    const opts = Array.from(selectEl.options);

    list.innerHTML = opts.map(o => {
      const active = String(o.value) === String(curVal);
      return `
        <button type="button" class="tselect-opt ${active ? "active" : ""}" data-val="${esc(o.value)}">
          ${esc(o.textContent)}
        </button>
      `;
    }).join("");

    // events
    pop.querySelector(".tselect-backdrop").addEventListener("click", closeAny);
    list.addEventListener("click", (e) => {
      const b = e.target.closest(".tselect-opt");
      if (!b) return;
      const v = b.getAttribute("data-val") ?? "";
      selectEl.value = v;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      syncLabel();
      closeAny();
    });

    // close on scroll/resize/escape
    const onKey = (e) => { if (e.key === "Escape") closeAny(); };
    const onResize = () => closeAny();
    window.addEventListener("keydown", onKey, { once: true });
    window.addEventListener("resize", onResize, { once: true });

    document.body.appendChild(pop);
    opened = pop;
  }

  btn.addEventListener("click", () => open());

  // mount
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(btn);
  wrap.appendChild(selectEl);

  // keep label updated if code changes value
  selectEl.addEventListener("change", syncLabel);

  syncLabel();
}
