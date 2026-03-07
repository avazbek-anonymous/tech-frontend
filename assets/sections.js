export const GEKTO_ROLES = ["super_admin", "gekto_viewer"];
export const BUSINESS_ROLES = ["business_owner", "branch_manager", "sales", "warehouse", "cashier", "analyst"];

function tr(ru, uz, en) {
  return { ru, uz, en };
}

const GROUPS = {
  GEKTO: tr("GEKTO", "GEKTO", "GEKTO"),
  CORE: tr("Основное", "Asosiy", "Core"),
  REPORTS: tr("Отчеты", "Hisobotlar", "Reports"),
  SALES: tr("Продажи", "Savdo", "Sales"),
  STOCK: tr("Склад", "Ombor", "Warehouse"),
  CASH: tr("Касса", "Kassa", "Cash desk"),
  HR: tr("HR", "HR", "HR"),
  NOMENCLATURE: tr("Номенклатура", "Nomenklatura", "Nomenclature"),
  PRICES: tr("Цены", "Narxlar", "Prices"),
  COUNTERPARTIES: tr("Контрагенты", "Kontragentlar", "Counterparties"),
  SETTINGS: tr("Настройки", "Sozlamalar", "Settings")
};

export const LEVEL1_SECTIONS = [
  { id: "dashboard", icon: "bi-speedometer2", key: "dashboard", module: "/assets/pages/dashboard.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "businesses", icon: "bi-buildings", key: "businesses", module: "/assets/pages/businesses.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "reports", icon: "bi-bar-chart", key: "reportsAccess", module: "/assets/pages/reports.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "payments", icon: "bi-cash-stack", key: "payments", module: "/assets/pages/payments.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "calendar", icon: "bi-calendar3", key: "calendar", module: "/assets/pages/calendar.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "users", icon: "bi-people", key: "users", module: "/assets/pages/users.js", groupId: "gekto", group: GROUPS.GEKTO }
];

export const LEVEL2_SECTIONS = [
  { id: "biz_dashboard", icon: "bi-speedometer2", label: tr("Главное", "Bosh sahifa", "Dashboard"), module: "/assets/pages/soon.js", groupId: "core", group: GROUPS.CORE },

  { id: "reports_root", icon: "bi-bar-chart", label: tr("Отчеты", "Hisobotlar", "Reports"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_pnl", icon: "bi-graph-up", label: tr("P&L", "P&L", "P&L"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_cashflow", icon: "bi-cash", label: tr("CashFlow", "CashFlow", "CashFlow"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_balance", icon: "bi-bank", label: tr("Balance", "Balance", "Balance"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },

  { id: "sales_create", icon: "bi-cart-plus", label: tr("Продажи: Создать", "Savdo: Yaratish", "Sales: Create"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },
  { id: "sales_list", icon: "bi-list-check", label: tr("Продажи: Список", "Savdo: Ro'yxat", "Sales: List"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },
  { id: "sales_installments", icon: "bi-calendar-event", label: tr("Продажи: Календарь рассрочки", "Savdo: Muddatli to'lov kalendari", "Sales: Installment calendar"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },
  { id: "sales_dbkd", icon: "bi-arrow-left-right", label: tr("Продажи: Дб/Кд", "Savdo: Db/Kd", "Sales: Db/Kd"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },

  { id: "stock_income", icon: "bi-box-arrow-in-down", label: tr("Склад: Создать приход", "Ombor: Kirim yaratish", "Warehouse: Create receipt"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_list", icon: "bi-boxes", label: tr("Склад: Список", "Ombor: Ro'yxat", "Warehouse: List"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_dbkd", icon: "bi-arrow-left-right", label: tr("Склад: Дб/Кд", "Ombor: Db/Kd", "Warehouse: Db/Kd"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_inventory", icon: "bi-clipboard-data", label: tr("Склад: Инвентаризация", "Ombor: Inventarizatsiya", "Warehouse: Inventory"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },

  { id: "cash_create", icon: "bi-wallet2", label: tr("Касса: Создать", "Kassa: Yaratish", "Cash desk: Create"), module: "/assets/pages/soon.js", groupId: "cash", group: GROUPS.CASH },
  { id: "cash_list", icon: "bi-receipt", label: tr("Касса: Список", "Kassa: Ro'yxat", "Cash desk: List"), module: "/assets/pages/soon.js", groupId: "cash", group: GROUPS.CASH },

  { id: "hr_kpi", icon: "bi-bullseye", label: tr("HR: Назначение KPI", "HR: KPI tayinlash", "HR: KPI assignment"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },
  { id: "hr_accrual", icon: "bi-calculator", label: tr("HR: Начисление", "HR: Hisoblash", "HR: Accrual"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },
  { id: "hr_advances", icon: "bi-cash-coin", label: tr("HR: Авансы и Дб/Кд", "HR: Avans va Db/Kd", "HR: Advances and Db/Kd"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },

  { id: "nomenclature_products", icon: "bi-box-seam", label: tr("Номенклатура: Товары", "Nomenklatura: Tovarlar", "Nomenclature: Products"), module: "/assets/pages/soon.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },
  { id: "nomenclature_categories", icon: "bi-tags", label: tr("Номенклатура: Категория", "Nomenklatura: Kategoriya", "Nomenclature: Category"), module: "/assets/pages/soon.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },

  { id: "prices_docs", icon: "bi-file-earmark-text", label: tr("Цены: Документы", "Narxlar: Hujjatlar", "Prices: Documents"), module: "/assets/pages/soon.js", groupId: "prices", group: GROUPS.PRICES },
  { id: "prices_list", icon: "bi-list-ul", label: tr("Цены: Список цен", "Narxlar: Narxlar ro'yxati", "Prices: Price list"), module: "/assets/pages/soon.js", groupId: "prices", group: GROUPS.PRICES },
  { id: "prices_installment", icon: "bi-percent", label: tr("Цены: Проценты рассрочки", "Narxlar: Muddatli to'lov foizlari", "Prices: Installment percentages"), module: "/assets/pages/soon.js", groupId: "prices", group: GROUPS.PRICES },

  { id: "counterparties_suppliers", icon: "bi-truck", label: tr("Контрагенты: Поставщики", "Kontragentlar: Ta'minotchilar", "Counterparties: Suppliers"), module: "/assets/pages/soon.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },
  { id: "counterparties_clients", icon: "bi-person-lines-fill", label: tr("Контрагенты: Клиенты", "Kontragentlar: Mijozlar", "Counterparties: Clients"), module: "/assets/pages/soon.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },

  { id: "settings_users", icon: "bi-people", label: tr("Настройки: Пользователи", "Sozlamalar: Foydalanuvchilar", "Settings: Users"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_roles", icon: "bi-shield-check", label: tr("Настройки: Роли", "Sozlamalar: Rollar", "Settings: Roles"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_business", icon: "bi-sliders2", label: tr("Настройки: Бизнес", "Sozlamalar: Biznes", "Settings: Business"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_filials", icon: "bi-diagram-3", label: tr("Настройки: Филиалы", "Sozlamalar: Filiallar", "Settings: Branches"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_cash_accounts", icon: "bi-wallet", label: tr("Настройки: Кассы", "Sozlamalar: Kassalar", "Settings: Cash desks"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_warehouses", icon: "bi-building", label: tr("Настройки: Склады", "Sozlamalar: Omborlar", "Settings: Warehouses"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_units", icon: "bi-rulers", label: tr("Настройки: Ед.изм", "Sozlamalar: O'lchov birliklari", "Settings: Units"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_product_types", icon: "bi-card-list", label: tr("Настройки: Типы товаров", "Sozlamalar: Tovar turlari", "Settings: Product types"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_currency", icon: "bi-currency-exchange", label: tr("Настройки: Валюта", "Sozlamalar: Valyuta", "Settings: Currency"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS }
];
