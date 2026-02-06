// ===== Tech UI core (theme + sidebar + i18n) =====
const STORAGE = {
  theme: "tech_theme",     // light|dark
  lang: "tech_lang",       // ru|uz|en
  sidebar: "tech_sidebar"  // open|closed
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
  const v = (localStorage.getItem(STORAGE.lang) || "ru").toLowerCase();
  return (v === "uz" || v === "en") ? v : "ru";
}
export function setLang(v) {
  const lang = (String(v || "").toLowerCase() === "uz") ? "uz"
            : (String(v || "").toLowerCase() === "en") ? "en"
            : "ru";
  document.documentElement.dataset.lang = lang;
  localStorage.setItem(STORAGE.lang, lang);
}

export function getSidebar() {
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
    light: "Светлая",
    dark: "Тёмная",
    search: "Поиск...",
    refresh: "Обновить",
    add: "+ Добавить",
    name: "Название",
    active: "Активен",
    created: "Создан",
    actions: "Действия",
    yes: "Да",
    no: "Нет",
    rename: "Переименовать",
    enable: "Включить",
    disable: "Выключить",
    branch_name: "Название филиала:",
    new_name: "Новое название:",
    cancel: "Отмена",
    save: "Сохранить",

  },
  uz: {
    app: "Tech Tizim",
    dict: "Ma’lumotnomalar",
    filials: "Filiallar",
    login: "Kirish",
    logout: "Chiqish",
    light: "Yorug’",
    dark: "Qorong’i",
    search: "Qidirish...",
    refresh: "Yangilash",
    add: "+ Qo‘shish",
    name: "Nomi",
    active: "Faol",
    created: "Yaratilgan",
    actions: "Amallar",
    yes: "Ha",
    no: "Yo‘q",
    rename: "Nomini o‘zgartirish",
    enable: "Yoqish",
    disable: "O‘chirish",
    branch_name: "Filial nomi:",
    new_name: "Yangi nom:",
    cancel: "Bekor qilish",
    save: "Saqlash",

  },
  en: {
    app: "Tech System",
    dict: "Directories",
    filials: "Branches",
    login: "Login",
    logout: "Logout",
    light: "Light",
    dark: "Dark",
    search: "Search...",
    refresh: "Refresh",
    add: "+ Add",
    name: "Name",
    active: "Active",
    created: "Created",
    actions: "Actions",
    yes: "Yes",
    no: "No",
    rename: "Rename",
    enable: "Enable",
    disable: "Disable",
    branch_name: "Branch name:",
    new_name: "New name:",
    cancel: "Cancel",
    save: "Save",

  }
};

export function t(key) {
  const lang = getLang();
  return (T[lang] && T[lang][key]) ? T[lang][key] : (T.ru[key] || key);
}
