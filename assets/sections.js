export const GEKTO_ROLES = ["super_admin", "gekto_viewer"];
export const BUSINESS_ROLES = ["business_owner", "branch_manager", "sales", "warehouse", "cashier", "analyst"];

function tr(ru, uz, en) {
  return { ru, uz, en };
}

const GROUPS = {
  GEKTO: tr("GEKTO", "GEKTO", "GEKTO"),
  CORE: tr("Основное", "Asosiy", "Core"),
  REPORTS: tr("Отчеты", "Hisobotlar", "Reports"),
  SALES: tr("Продажа", "Savdo", "Sales"),
  STOCK: tr("Склад", "Ombor", "Warehouse"),
  CASH: tr("Касса", "Kassa", "Cash desk"),
  HR: tr("HR", "HR", "HR"),
  NOMENCLATURE: tr("Номенклатура", "Nomenklatura", "Nomenclature"),
  COUNTERPARTIES: tr("Контрагенты", "Kontragentlar", "Counterparties"),
  DICTIONARIES: tr("Справочники", "Ma'lumotnomalar", "Dictionaries"),
  SETTINGS: tr("Настройки", "Sozlamalar", "Settings")
};

export const LEVEL1_SECTIONS = [
  { id: "dashboard", path: "/dashboard", icon: "bi-speedometer2", key: "dashboard", module: "/assets/pages/dashboard.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "businesses", path: "/businesses", icon: "bi-buildings", key: "businesses", module: "/assets/pages/businesses.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "business_settings", path: "/business-settings", icon: "bi-sliders2", label: tr("Настройки бизнесов", "Biznes sozlamalari", "Business settings"), module: "/assets/pages/soon.js", groupId: "gekto", group: GROUPS.GEKTO, allowedRoles: ["super_admin"] },
  { id: "reports", path: "/reports", icon: "bi-bar-chart", key: "reportsAccess", module: "/assets/pages/reports.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "payments", path: "/payments", icon: "bi-cash-stack", key: "payments", module: "/assets/pages/payments.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "calendar", path: "/calendar", icon: "bi-calendar3", key: "calendar", module: "/assets/pages/calendar.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "users", path: "/users", icon: "bi-people", key: "users", module: "/assets/pages/users.js", groupId: "gekto", group: GROUPS.GEKTO }
];

export const LEVEL2_SECTIONS = [
  { id: "dashboard", path: "/dashboard", icon: "bi-speedometer2", label: tr("Главная", "Bosh sahifa", "Dashboard"), module: "/assets/pages/soon.js", groupId: "core", group: GROUPS.CORE },

  { id: "reports_pnl", path: "/reports/pnl", icon: "bi-graph-up", label: tr("Отчеты: P&L", "Hisobotlar: P&L", "Reports: P&L"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_balance", path: "/reports/balance", icon: "bi-pie-chart", label: tr("Отчеты: Balance", "Hisobotlar: Balance", "Reports: Balance"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_cashflow", path: "/reports/cashflow", icon: "bi-water", label: tr("Отчеты: CashFlow", "Hisobotlar: CashFlow", "Reports: CashFlow"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },

  { id: "sales_list", path: "/sales", icon: "bi-cart-check", label: tr("Продажа: Список", "Savdo: Ro'yxat", "Sales: List"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },

  { id: "stock_income", path: "/stock/income", icon: "bi-box-arrow-in-down", label: tr("Склад: Приход", "Ombor: Kirim", "Warehouse: Receipt"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_transfer", path: "/stock/transfer", icon: "bi-arrow-left-right", label: tr("Склад: Перемещение", "Ombor: Ko'chirish", "Warehouse: Transfer"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_inventory", path: "/stock/inventory", icon: "bi-clipboard-check", label: tr("Склад: Инвентаризация", "Ombor: Inventarizatsiya", "Warehouse: Inventory"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },

  { id: "cash_moves", path: "/cash", icon: "bi-cash-stack", label: tr("Касса: Движение ДС", "Kassa: Pul harakati", "Cash: Money movement"), module: "/assets/pages/soon.js", groupId: "cash", group: GROUPS.CASH },

  { id: "hr", path: "/hr", icon: "bi-person-badge", label: tr("HR", "HR", "HR"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },

  { id: "products", path: "/products", icon: "bi-box-seam", label: tr("Номенклатура: Товары", "Nomenklatura: Mahsulotlar", "Nomenclature: Products"), module: "/assets/pages/nomenclature-products.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },
  { id: "categories", path: "/categories", icon: "bi-diagram-3", label: tr("Номенклатура: Категории", "Nomenklatura: Kategoriyalar", "Nomenclature: Categories"), module: "/assets/pages/nomenclature-categories.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },
  { id: "prices", path: "/prices", icon: "bi-tags", label: tr("Номенклатура: Установка цен", "Nomenklatura: Narxlarni belgilash", "Nomenclature: Price setup"), module: "/assets/pages/nomenclature-prices.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },

  { id: "counterparties_suppliers", path: "/counterparties/suppliers", icon: "bi-truck", label: tr("Контрагенты: Поставщики", "Kontragentlar: Yetkazib beruvchilar", "Counterparties: Suppliers"), module: "/assets/pages/counterparties.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },
  { id: "counterparties_clients", path: "/counterparties/clients", icon: "bi-people", label: tr("Контрагенты: Клиенты", "Kontragentlar: Mijozlar", "Counterparties: Clients"), module: "/assets/pages/counterparties.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },
  { id: "counterparties_employees", path: "/counterparties/employees", icon: "bi-person-workspace", label: tr("Контрагенты: Сотрудники", "Kontragentlar: Xodimlar", "Counterparties: Employees"), module: "/assets/pages/counterparties.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },
  { id: "counterparties_inspections", path: "/counterparties/inspections", icon: "bi-shield-check", label: tr("Контрагенты: Инспекции", "Kontragentlar: Inspeksiyalar", "Counterparties: Inspections"), module: "/assets/pages/counterparties.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },
  { id: "counterparties_other", path: "/counterparties/other", icon: "bi-collection", label: tr("Контрагенты: Прочее", "Kontragentlar: Boshqa", "Counterparties: Other"), module: "/assets/pages/counterparties.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },

  { id: "dictionaries_units", path: "/dictionaries/units", icon: "bi-rulers", label: tr("Справочники: Ед. изм.", "Ma'lumotnomalar: O'lchov birligi", "Dictionaries: Units"), module: "/assets/pages/dictionaries-units.js", groupId: "dictionaries", group: GROUPS.DICTIONARIES },
  { id: "dictionaries_currencies", path: "/dictionaries/currencies", icon: "bi-currency-exchange", label: tr("Справочники: Валюты", "Ma'lumotnomalar: Valyutalar", "Dictionaries: Currencies"), module: "/assets/pages/dictionaries-currencies.js", groupId: "dictionaries", group: GROUPS.DICTIONARIES },
  { id: "dictionaries_price_types", path: "/dictionaries/price-types", icon: "bi-tag", label: tr("Справочники: Виды цен", "Ma'lumotnomalar: Narx turlari", "Dictionaries: Price types"), module: "/assets/pages/dictionaries-price-types.js", groupId: "dictionaries", group: GROUPS.DICTIONARIES },
  { id: "dictionaries_counterparty_roles", path: "/dictionaries/counterparty-roles", icon: "bi-diagram-2", label: tr("Справочники: Прочие роли контрагентов", "Ma'lumotnomalar: Kontragent rollari", "Dictionaries: Counterparty extra roles"), module: "/assets/pages/dictionaries-extra-roles.js", groupId: "dictionaries", group: GROUPS.DICTIONARIES },
  { id: "dictionaries_static", path: "/dictionaries/static", icon: "bi-geo-alt", label: tr("Справочники: Статичные", "Ma'lumotnomalar: Statik", "Dictionaries: Static"), module: "/assets/pages/dictionaries-static.js", groupId: "dictionaries", group: GROUPS.DICTIONARIES },

  { id: "settings_users", path: "/settings/users", icon: "bi-people-fill", label: tr("Настройки: Пользователи", "Sozlamalar: Foydalanuvchilar", "Settings: Users"), module: "/assets/pages/settings-users.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_filials", path: "/settings/filials", icon: "bi-buildings", label: tr("Настройки: Филиалы", "Sozlamalar: Filiallar", "Settings: Branches"), module: "/assets/pages/settings-filials.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_roles", path: "/settings/roles", icon: "bi-key", label: tr("Настройки: Роли", "Sozlamalar: Rollar", "Settings: Roles"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS }
];
