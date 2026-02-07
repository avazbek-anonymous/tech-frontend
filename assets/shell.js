import { initUI, toggleSidebar, setTheme, getTheme, setLang, getLang, t, requireFrontAuth } from "/assets/app.js";


function extractNameOnly(text) {
  const s = String(text || "").trim();
  if (!s) return "";
  // Примеры входа:
  // "Ты: Avazbek (business_owner)"
  // "Siz: Avazbek (business_owner)"
  // "You: Avazbek (business_owner)"
  let x = s;
  const p = x.indexOf(":");
  if (p >= 0) x = x.slice(p + 1).trim();
  const k = x.indexOf("(");
  if (k >= 0) x = x.slice(0, k).trim();
  return x;
}

export function renderShell({
  active = "filials",
  titleKey = "filials"
} = {}) {
  initUI();

  const root = document.getElementById("app");
    // global auth guard (all pages except /auth/login.html)
  if (!requireFrontAuth()) {
    root.innerHTML = "";
    return {
      setWho(){},
      setMsg(){},
      setSub(){},
      setTitleKey(){},
      actionsEl: null,
      bodyEl: null,
      applyI18n(){},
    };
  }

  if (!root) throw new Error('No #app element on page');

  root.innerHTML = `
    <div class="app">
      <div class="header">
        <div class="left">
          <button class="btn icon" data-burger title="Menu" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <div style="display:flex; flex-direction:column; line-height:1.1;">
            <div id="appTitle" style="font-weight:700;"></div>
          </div>
        </div>

        <!-- DESKTOP actions (mobile скрывается CSS'ом) -->
        <div class="right">
          <button id="themeBtn" class="btn" style="min-width:92px;"></button>
          <button id="langBtn" class="btn" style="min-width:72px;"></button>
          <button id="logoutBtn" class="btn danger" style="min-width:96px;"></button>
          <div id="whoTop" class="who-pill" title="" style="margin-left:10px;"></div>
        </div>

      </div>

      <div class="sidebar-backdrop" id="sbBackdrop" aria-hidden="true"></div>

      <aside class="sidebar">
        <!-- sidebar top (mobile close) -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;">
          <div class="muted" style="font-weight:700;">${"Tech System"}</div>
          <button class="btn icon" id="sbClose" title="Close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <nav class="menu">
          <div class="menu-group">
            <div class="menu-group-title" id="menuTitle"></div>
            <div class="menu-sub">
              <a href="/dict/filials.html" id="menu_filials">...</a>
              <a href="/dict/warehouses.html" id="menu_warehouses">...</a>
              <a href="/dict/cash-accounts.html" id="menu_cash_accounts">...</a>
            </div>
          </div>
        </nav>

        <!-- MOBILE actions (desktop скрывается CSS'ом) -->
        <div class="mobile-actions" id="mobileActions" data-mobile-only>
          <button id="m_themeBtn" class="btn"></button>
          <button id="m_langBtn" class="btn"></button>
          <button id="m_logoutBtn" class="btn danger"></button>
        </div>

        <div class="muted" style="margin-top:12px;">
          API: <span id="apiBase"></span>
        </div>
      </aside>

      <main class="content">
        <div class="card pad" style="display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <h2 style="margin:0;" id="pageTitle"></h2>
            <span class="muted" id="pageSub"></span>
          </div>
          <div id="pageActions" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;"></div>
        </div>

        <div id="pageMsg" class="msg muted" style="margin:12px 2px 0;"></div>

        <div id="pageBody" style="margin-top:12px;"></div>
      </main>
    </div>
  `;

  // refs
  const whoTopEl = root.querySelector("#whoTop");
  const msgEl = root.querySelector("#pageMsg");
  const actionsEl = root.querySelector("#pageActions");
  const bodyEl = root.querySelector("#pageBody");
  const pageTitleEl = root.querySelector("#pageTitle");
  const pageSubEl = root.querySelector("#pageSub");

  // api label
  root.querySelector("#apiBase").textContent = "https://api.tech.gekto.uz";

  // menu active
  const a = root.querySelector("#menu_" + active);
  if (a) a.classList.add("active");

  function applyI18n() {
    root.querySelector("#appTitle").textContent = t("app");
    root.querySelector("#menuTitle").textContent = t("dict");

    root.querySelector("#menu_filials").textContent = t("filials");
    root.querySelector("#menu_warehouses").textContent = t("warehouses");
    root.querySelector("#menu_cash_accounts").textContent = t("cash_accounts");

    pageTitleEl.textContent = t(titleKey);

    const th = getTheme();
    const thText = (th === "dark") ? t("dark") : t("light");
    root.querySelector("#themeBtn").textContent = thText;
    root.querySelector("#m_themeBtn").textContent = thText;

    const lg = getLang();
    const lgText = (lg === "uz") ? "UZ" : (lg === "en") ? "EN" : "RU";
    root.querySelector("#langBtn").textContent = lgText;
    root.querySelector("#m_langBtn").textContent = lgText;

    root.querySelector("#logoutBtn").textContent = t("logout");
    root.querySelector("#m_logoutBtn").textContent = t("logout");
  }

  applyI18n();

  // events
  root.querySelector("[data-burger]").addEventListener("click", () => toggleSidebar());
  root.querySelector("#sbBackdrop")?.addEventListener("click", () => toggleSidebar(false));
  root.querySelector("#sbClose")?.addEventListener("click", () => toggleSidebar(false));

  root.querySelector("#themeBtn").addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    applyI18n();
  });

  root.querySelector("#langBtn").addEventListener("click", () => {
    const cur = getLang();
    const next = (cur === "ru") ? "uz" : (cur === "uz") ? "en" : "ru";
    setLang(next);
    applyI18n();
    window.dispatchEvent(new Event("tech:lang"));
  });

  root.querySelector("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
  });

  // mobile actions
  root.querySelector("#m_themeBtn").addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    applyI18n();
  });

  root.querySelector("#m_langBtn").addEventListener("click", () => {
    const cur = getLang();
    const next = (cur === "ru") ? "uz" : (cur === "uz") ? "en" : "ru";
    setLang(next);
    applyI18n();
    window.dispatchEvent(new Event("tech:lang"));
  });

  root.querySelector("#m_logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
  });

  // mobile UX: close drawer after clicking menu link
  root.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", () => {
      const isMobile = window.matchMedia("(max-width: 820px)").matches;
      if (isMobile) toggleSidebar(false);
    });
  });

  return {
    setWho(text) {
      const nameOnly = extractNameOnly(text);
      whoTopEl.textContent = nameOnly ? nameOnly : "";
      whoTopEl.title = nameOnly ? nameOnly : "";
    },
    setMsg(text, ok = true) {
      msgEl.textContent = text || "";
      msgEl.style.color = ok ? "var(--muted)" : "var(--danger)";
      msgEl.classList.toggle("muted", ok);
    },
    setSub(text) { pageSubEl.textContent = text || ""; },
    setTitleKey(k) { titleKey = k; applyI18n(); document.title = "Tech — " + t(k); },
    actionsEl,
    bodyEl,
    applyI18n
  };
}
