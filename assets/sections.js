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

  { id: "reports_root", icon: "bi-bar-chart", label: tr("Обзор", "Umumiy", "Overview"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_pnl", icon: "bi-graph-up", label: tr("P&L", "P&L", "P&L"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_cashflow", icon: "bi-cash", label: tr("CashFlow", "CashFlow", "CashFlow"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },
  { id: "reports_balance", icon: "bi-bank", label: tr("Balance", "Balance", "Balance"), module: "/assets/pages/soon.js", groupId: "reports", group: GROUPS.REPORTS },

  { id: "sales_create", icon: "bi-cart-plus", label: tr("Создать", "Yaratish", "Create"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },
  { id: "sales_list", icon: "bi-list-check", label: tr("Список", "Ro'yxat", "List"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },
  { id: "sales_installments", icon: "bi-calendar-event", label: tr("Календарь рассрочки", "Muddatli to'lov kalendari", "Installment calendar"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },
  { id: "sales_dbkd", icon: "bi-arrow-left-right", label: tr("Дт, Кт", "Dt, Kt", "Dt, Kt"), module: "/assets/pages/soon.js", groupId: "sales", group: GROUPS.SALES },

  { id: "stock_income", icon: "bi-box-arrow-in-down", label: tr("Приход", "Kirim", "Receipt"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_list", icon: "bi-boxes", label: tr("Список", "Ro'yxat", "List"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_dbkd", icon: "bi-arrow-left-right", label: tr("Дт, Кт", "Dt, Kt", "Dt, Kt"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },
  { id: "stock_inventory", icon: "bi-clipboard-data", label: tr("Инвентаризация", "Inventarizatsiya", "Inventory"), module: "/assets/pages/soon.js", groupId: "stock", group: GROUPS.STOCK },

  { id: "cash_create", icon: "bi-wallet2", label: tr("Создать", "Yaratish", "Create"), module: "/assets/pages/soon.js", groupId: "cash", group: GROUPS.CASH },
  { id: "cash_list", icon: "bi-receipt", label: tr("Список", "Ro'yxat", "List"), module: "/assets/pages/soon.js", groupId: "cash", group: GROUPS.CASH },

  { id: "hr_kpi", icon: "bi-bullseye", label: tr("Назначение KPI", "KPI tayinlash", "KPI assignment"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },
  { id: "hr_accrual", icon: "bi-calculator", label: tr("Начисление", "Hisoblash", "Accrual"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },
  { id: "hr_advances", icon: "bi-cash-coin", label: tr("Авансы и Дт, Кт", "Avans va Dt, Kt", "Advances and Dt, Kt"), module: "/assets/pages/soon.js", groupId: "hr", group: GROUPS.HR },

  { id: "nomenclature_products", icon: "bi-box-seam", label: tr("Товары", "Tovarlar", "Products"), module: "/assets/pages/soon.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },
  { id: "nomenclature_categories", icon: "bi-tags", label: tr("Категория", "Kategoriya", "Category"), module: "/assets/pages/soon.js", groupId: "nomenclature", group: GROUPS.NOMENCLATURE },

  { id: "prices_docs", icon: "bi-file-earmark-text", label: tr("Документы", "Hujjatlar", "Documents"), module: "/assets/pages/soon.js", groupId: "prices", group: GROUPS.PRICES },
  { id: "prices_list", icon: "bi-list-ul", label: tr("Список цен", "Narxlar ro'yxati", "Price list"), module: "/assets/pages/soon.js", groupId: "prices", group: GROUPS.PRICES },
  { id: "prices_installment", icon: "bi-percent", label: tr("Проценты рассрочки", "Muddatli to'lov foizlari", "Installment percentages"), module: "/assets/pages/soon.js", groupId: "prices", group: GROUPS.PRICES },

  { id: "counterparties_suppliers", icon: "bi-truck", label: tr("Поставщики", "Ta'minotchilar", "Suppliers"), module: "/assets/pages/soon.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },
  { id: "counterparties_clients", icon: "bi-person-lines-fill", label: tr("Клиенты", "Mijozlar", "Clients"), module: "/assets/pages/soon.js", groupId: "counterparties", group: GROUPS.COUNTERPARTIES },

  { id: "settings_users", icon: "bi-people", label: tr("Пользователи", "Foydalanuvchilar", "Users"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_roles", icon: "bi-shield-check", label: tr("Роли", "Rollar", "Roles"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_filials", icon: "bi-diagram-3", label: tr("Филиалы", "Filiallar", "Branches"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_cash_accounts", icon: "bi-wallet", label: tr("Кассы", "Kassalar", "Cash desks"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_warehouses", icon: "bi-building", label: tr("Склады", "Omborlar", "Warehouses"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_units", icon: "bi-rulers", label: tr("Ед.изм", "O'lchov birliklari", "Units"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_product_types", icon: "bi-card-list", label: tr("Типы товаров", "Tovar turlari", "Product types"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS },
  { id: "settings_currency", icon: "bi-currency-exchange", label: tr("Валюта", "Valyuta", "Currency"), module: "/assets/pages/soon.js", groupId: "settings", group: GROUPS.SETTINGS }
];
