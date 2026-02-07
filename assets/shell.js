import {
  initUI,
  toggleSidebar,
  setTheme,
  getTheme,
  setLang,
  getLang,
  t
} from "/assets/app.js";

export function renderShell({
  active = "filials",
  titleKey = "filials"
} = {}) {
  initUI();

  const root = document.getElementById("app");
  if (!root) throw new Error("No #app element on page");

  root.innerHTML = `
    <div class="app">
      <div class="header">
        <div class="left">
          <button class="btn icon" data-burger title="Menu" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <div style="display:flex; flex-direction:column; line-height:1.1;">
            <div id="appTitle" style="font-weight:700;"></div>
            <div id="who" class="who-pill" style="margin-top:6px;"></div>
          </div>

        </div>

        <div class="right">
          <button id="themeBtn" class="btn" style="min-width:92px;"></button>
          <button id="langBtn" class="btn" style="min-width:72px;"></button>
          <a class="btn" href="/auth/login.html" id="loginLink"
             style="min-width:84px; text-align:center;"></a>
          <button id="logoutBtn" class="btn danger" style="min-width:84px;"></button>
        </div>
      </div>

      <div class="sidebar-backdrop" id="sbBackdrop" aria-hidden="true"></div>


      <aside class="sidebar">
        <nav class="menu">
          <div class="menu-group">
            <div class="menu-group-title" id="menuTitle"></div>
            <div class="menu-sub">
              <a href="/dict/filials.html" id="menu_filials">...</a>
              <a href="/dict/warehouses.html" id="menu_warehouses">...</a>
              <a href="/dict/cash-accounts.html" id="menu_cash_accounts">...</a>
              <!-- позже: склады, товары и т.д. -->
            </div>
          </div>
        </nav>
        <div class="mobile-actions" id="mobileActions">
          <button id="m_themeBtn" class="btn"></button>
          <button id="m_langBtn" class="btn"></button>
          <a class="btn" href="/auth/login.html" id="m_loginLink" style="text-align:center;"></a>
          <button id="m_logoutBtn" class="btn danger"></button>
        </div>

        <div class="muted" style="margin-top:12px;">
          API: <span id="apiBase"></span>
        </div>
      </aside>

      <main class="content">
        <div class="card pad"
             style="display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <h2 style="margin:0;" id="pageTitle"></h2>
            <span class="muted" id="pageSub"></span>
          </div>
          <div id="pageActions"
               style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;"></div>
        </div>

        <div id="pageMsg" class="msg muted" style="margin:12px 2px 0;"></div>

        <div id="pageBody" style="margin-top:12px;"></div>
      </main>
    </div>
  `;

  // refs
  const whoEl = root.querySelector("#who");
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

    root.querySelector("#loginLink").textContent = t("login");
    root.querySelector("#logoutBtn").textContent = t("logout");

    const th = getTheme();
    root.querySelector("#themeBtn").textContent = (th === "dark") ? t("dark") : t("light");

    const lg = getLang();
    root.querySelector("#langBtn").textContent =
      (lg === "uz") ? "UZ" : (lg === "en") ? "EN" : "RU";

    // mobile actions
    root.querySelector("#m_loginLink").textContent = t("login");
    root.querySelector("#m_logoutBtn").textContent = t("logout");
    const th2 = getTheme();
    root.querySelector("#m_themeBtn").textContent = (th2 === "dark") ? t("dark") : t("light");

    const lg2 = getLang();
    root.querySelector("#m_langBtn").textContent = (lg2 === "uz") ? "UZ" : (lg2 === "en") ? "EN" : "RU";
  }

  applyI18n();

  // burger
  root.querySelector("[data-burger]").addEventListener("click", () => {
    toggleSidebar();
  });

  const bd = root.querySelector("#sbBackdrop");
  if (bd) bd.addEventListener("click", () => toggleSidebar(false));


  // theme toggle + event
  root.querySelector("#themeBtn").addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    applyI18n();
    window.dispatchEvent(new Event("tech:theme"));
  });

  // lang cycle RU->UZ->EN + event
  root.querySelector("#langBtn").addEventListener("click", () => {
    const cur = getLang();
    const next = (cur === "ru") ? "uz" : (cur === "uz") ? "en" : "ru";
    setLang(next);
    applyI18n();
    window.dispatchEvent(new Event("tech:lang"));
  });

  // logout
  root.querySelector("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
  });

  // mobile theme
  root.querySelector("#m_themeBtn").addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    applyI18n();
  });

  // mobile lang
  root.querySelector("#m_langBtn").addEventListener("click", () => {
    const cur = getLang();
    const next = (cur === "ru") ? "uz" : (cur === "uz") ? "en" : "ru";
    setLang(next);
    applyI18n();
    window.dispatchEvent(new Event("tech:lang"));
  });

  // mobile logout
  root.querySelector("#m_logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
  });

  

  // public api
  return {
    setWho(text) { whoEl.textContent = text || ""; },
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
