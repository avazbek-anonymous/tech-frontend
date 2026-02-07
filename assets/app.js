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

const SIDEBAR_KEY = "tech_sidebar"; // сохраняем только desktop-состояние

export function initUI() {
  const html = document.documentElement;

  // theme/lang у тебя уже были — оставь как есть, если они выше/ниже.
  // Здесь добавляем только sidebar-state:
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  const saved = localStorage.getItem(SIDEBAR_KEY) || "open";

  // На мобилке всегда стартуем закрытым (drawer не должен быть открыт после refresh)
  html.setAttribute("data-sidebar", isMobile ? "closed" : saved);

  // Если пользователь меняет размер окна — корректно переключаем режим
  window.addEventListener("resize", () => {
    const m = window.matchMedia("(max-width: 820px)").matches;
    if (m) {
      html.setAttribute("data-sidebar", "closed");
    } else {
      const s = localStorage.getItem(SIDEBAR_KEY) || "open";
      html.setAttribute("data-sidebar", s);
    }
  }, { passive: true });
}

/**
 * toggleSidebar()
 * toggleSidebar(true)  -> open
 * toggleSidebar(false) -> closed
 * toggleSidebar()      -> toggle
 */
export function toggleSidebar(force) {
  const html = document.documentElement;
  const isMobile = window.matchMedia("(max-width: 820px)").matches;

  const cur = html.getAttribute("data-sidebar") || "open";
  let next;

  if (force === true) next = "open";
  else if (force === false) next = "closed";
  else next = (cur === "open") ? "closed" : "open";

  html.setAttribute("data-sidebar", next);

  // сохраняем только на ПК (на мобилке не сохраняем, чтобы drawer не открывался после refresh)
  if (!isMobile) localStorage.setItem(SIDEBAR_KEY, next);

  return next;
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
    code: "Код",
    phone: "Телефон",
    address: "Адрес",
    comment: "Комментарий",
    timezone: "Часовой пояс",
    currency: "Валюта",
    default: "По умолчанию",
    create_filial: "Создать филиал",
    edit_filial: "Редактировать филиал",
    field_name: "Название",
    field_code: "Код (уникально)",
    field_phone: "Телефон",
    field_address: "Адрес",
    field_comment: "Комментарий",
    field_timezone: "Timezone",
    field_currency: "Валюта",
    switch_default: "Филиал по умолчанию",
    switch_active: "Активен",
    warehouses: "Склады",
    cash_accounts: "Кассы / Счета",
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
    code: "Kod",
    phone: "Telefon",
    address: "Manzil",
    comment: "Izoh",
    timezone: "Vaqt mintaqasi",
    currency: "Valyuta",
    default: "Standart",
    create_filial: "Filial yaratish",
    edit_filial: "Filialni tahrirlash",
    field_name: "Nomi",
    field_code: "Kod (yagona)",
    field_phone: "Telefon",
    field_address: "Manzil",
    field_comment: "Izoh",
    field_timezone: "Timezone",
    field_currency: "Valyuta",
    switch_default: "Standart filial",
    switch_active: "Faol",
    warehouses: "Omborlar",
    cash_accounts: "Kassalar / Hisoblar",
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
    code: "Code",
    phone: "Phone",
    address: "Address",
    comment: "Comment",
    timezone: "Timezone",
    currency: "Currency",
    default: "Default",
    create_filial: "Create branch",
    edit_filial: "Edit branch",
    field_name: "Name",
    field_code: "Code (unique)",
    field_phone: "Phone",
    field_address: "Address",
    field_comment: "Comment",
    field_timezone: "Timezone",
    field_currency: "Currency",
    switch_default: "Default branch",
    switch_active: "Active",
    warehouses: "Warehouses",
    cash_accounts: "Cash accounts",
  }
};

export function t(key) {
  const lang = getLang();
  return (T[lang] && T[lang][key]) ? T[lang][key] : (T.ru[key] || key);
}
