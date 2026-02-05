// ===== Tech UI core (theme + sidebar + i18n) =====
const STORAGE = {
  theme: "tech_theme",   // light|dark
  lang: "tech_lang",     // ru|uz
  sidebar: "tech_sidebar" // open|closed
};

export function getTheme() {
  return localStorage.getItem(STORAGE.theme) || "light";
}
export function setTheme(v) {
  const theme = (v === "dark") ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE.theme, theme);
}

export function getLang() {
  return localStorage.getItem(STORAGE.lang) || "ru";
}
export function setLang(v) {
  const lang = (v === "uz") ? "uz" : "ru";
  document.documentElement.dataset.lang = lang;
  localStorage.setItem(STORAGE.lang, lang);
}

export function getSidebar() {
  // desktop default open, mobile default closed
  return localStorage.getItem(STORAGE.sidebar) || "open";
}
export function setSidebar(v) {
  const s = (v === "closed") ? "closed" : "open";
  document.documentElement.dataset.sidebar = s;
  localStorage.setItem(STORAGE.sidebar, s);
}

export function toggleSidebar() {
  setSidebar(getSidebar() === "open" ? "closed" : "open");
}

export function initUI() {
  setTheme(getTheme());
  setLang(getLang());

  // mobile default closed if not set
  if (!localStorage.getItem(STORAGE.sidebar)) {
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    setSidebar(isMobile ? "closed" : "open");
  } else {
    setSidebar(getSidebar());
  }

  // close sidebar on mobile click outside
  document.addEventListener("click", (e) => {
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    if (!isMobile) return;

    if (document.documentElement.dataset.sidebar !== "open") return;

    const sidebar = document.querySelector(".sidebar");
    const burger = document.querySelector("[data-burger]");

    const target = e.target;
    const insideSidebar = sidebar && sidebar.contains(target);
    const insideBurger = burger && burger.contains(target);

    if (!insideSidebar && !insideBurger) {
      setSidebar("closed");
    }
  });
}

// простейший переводчик
export const T = {
  ru: {
    app: "Tech System",
    dict: "Справочники",
    filials: "Филиалы",
    login: "Вход",
    logout: "Выйти",
    theme: "Тема",
    lang: "Язык",
    light: "Светлая",
    dark: "Тёмная",
  },
  uz: {
    app: "Tech Tizim",
    dict: "Ma’lumotnomalar",
    filials: "Filiallar",
    login: "Kirish",
    logout: "Chiqish",
    theme: "Mavzu",
    lang: "Til",
    light: "Yorug’",
    dark: "Qorong’i",
  }
};

export function t(key) {
  const lang = getLang();
  return (T[lang] && T[lang][key]) ? T[lang][key] : (T.ru[key] || key);
}
