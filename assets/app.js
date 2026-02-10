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
    admin: "Система",
    businesses: "Бизнесы",
    filials: "Филиалы",
    login: "Вход",
    logout: "Выйти",
    light: "Светлая",
    dark: "Тёмная",
    search: "Поиск...",
    loading: "Загрузка...",
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
    units: "Единицы",
    product_categories: "Категории товаров",
    products: "Товары",
    stock_docs: "Складские документы",
    roles: "Роли",
    users: "Пользователи",
    permissions: "Права",
    create_role: "Создать роль",
    edit_role: "Редактировать роль",
    role_name: "Название роли",
    create_user: "Создать пользователя",
    edit_user: "Редактировать пользователя",
    user_email: "Email",
    user_full_name: "ФИО",
    user_role_level: "Уровень",
    user_role_perm: "Роль (права)",
    role_super_admin: "Суперадмин",
    role_admin: "Админ бизнеса",
    role_user: "Пользователь",
    password_new: "Новый пароль",
    reset_password: "Сбросить пароль",
    filials_access: "Доступ ко всем филиалам",
    status: "Статус",
    verified: "Проверен",
    tariff_plan: "Тариф",
    owner_email: "Email владельца",
    owner_full_name: "ФИО владельца",
    password: "Пароль",
    create_business: "Создать бизнес",
    edit_business: "Редактировать бизнес",
    active_status: "Активен",
    blocked_status: "Заблокирован",
    perms_read: "Чтение",
    perms_add: "Добавление",
    perms_change: "Изменение",
    perms_disable: "Отключение",
    perms_delete: "Удаление",
    perms_export: "Экспорт",
  },
  uz: {
    app: "Tech Tizim",
    dict: "Ma’lumotnomalar",
    admin: "Tizim",
    businesses: "Bizneslar",
    filials: "Filiallar",
    login: "Kirish",
    logout: "Chiqish",
    light: "Yorug’",
    dark: "Qorong’i",
    search: "Qidirish...",
    loading: "Yuklanmoqda...",
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
    units: "Birliklar",
    product_categories: "Mahsulot kategoriyalari",
    products: "Mahsulotlar",
    stock_docs: "Ombor hujjatlari",
    roles: "Rollar",
    users: "Foydalanuvchilar",
    permissions: "Ruxsatlar",
    create_role: "Rol yaratish",
    edit_role: "Rolni tahrirlash",
    role_name: "Rol nomi",
    create_user: "Foydalanuvchi yaratish",
    edit_user: "Foydalanuvchini tahrirlash",
    user_email: "Email",
    user_full_name: "FIO",
    user_role_level: "Daraja",
    user_role_perm: "Rol (ruxsatlar)",
    role_super_admin: "Super admin",
    role_admin: "Biznes admin",
    role_user: "Foydalanuvchi",
    password_new: "Yangi parol",
    reset_password: "Parolni yangilash",
    filials_access: "Barcha filiallarga ruxsat",
    status: "Holat",
    verified: "Tekshirildi",
    tariff_plan: "Tarif",
    owner_email: "Egasining emaili",
    owner_full_name: "Egasining FIO",
    password: "Parol",
    create_business: "Biznes yaratish",
    edit_business: "Biznesni tahrirlash",
    active_status: "Faol",
    blocked_status: "Bloklangan",
    perms_read: "O‘qish",
    perms_add: "Qo‘shish",
    perms_change: "O‘zgartirish",
    perms_disable: "O‘chirish",
    perms_delete: "O‘chirish",
    perms_export: "Eksport",
  },
  en: {
    app: "Tech System",
    dict: "Directories",
    admin: "System",
    businesses: "Businesses",
    filials: "Branches",
    login: "Login",
    logout: "Logout",
    light: "Light",
    dark: "Dark",
    search: "Search...",
    loading: "Loading...",
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
    units: "Units",
    product_categories: "Product categories",
    products: "Products",
    stock_docs: "Stock documents",
    roles: "Roles",
    users: "Users",
    permissions: "Permissions",
    create_role: "Create role",
    edit_role: "Edit role",
    role_name: "Role name",
    create_user: "Create user",
    edit_user: "Edit user",
    user_email: "Email",
    user_full_name: "Full name",
    user_role_level: "Level",
    user_role_perm: "Role (permissions)",
    role_super_admin: "Super admin",
    role_admin: "Business admin",
    role_user: "User",
    password_new: "New password",
    reset_password: "Reset password",
    filials_access: "Access to all branches",
    status: "Status",
    verified: "Verified",
    tariff_plan: "Tariff",
    owner_email: "Owner email",
    owner_full_name: "Owner full name",
    password: "Password",
    create_business: "Create business",
    edit_business: "Edit business",
    active_status: "Active",
    blocked_status: "Blocked",
    perms_read: "Read",
    perms_add: "Add",
    perms_change: "Change",
    perms_disable: "Disable",
    perms_delete: "Delete",
    perms_export: "Export",
  }
};

export function t(key) {
  const lang = getLang();
  return (T[lang] && T[lang][key]) ? T[lang][key] : (T.ru[key] || key);
}
export function requireFrontAuth() {
  const token = localStorage.getItem("tech_token") || "";
  const path = location.pathname || "";

  // login page itself must be accessible
  if (path.includes("/auth/login.html")) return true;

  if (!token) {
    location.href = "/auth/login.html";
    return false;
  }
  return true;
}
