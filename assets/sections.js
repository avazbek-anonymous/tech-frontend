export const GEKTO_ROLES = ["super_admin", "gekto_viewer"];
export const BUSINESS_ROLES = ["business_owner", "branch_manager", "sales", "warehouse", "cashier", "analyst"];

export const LEVEL1_SECTIONS = [
  { id: "dashboard", icon: "bi-speedometer2", key: "dashboard", module: "/assets/pages/dashboard.js", group: "GEKTO" },
  { id: "businesses", icon: "bi-buildings", key: "businesses", module: "/assets/pages/businesses.js", group: "GEKTO" },
  { id: "reports", icon: "bi-bar-chart", key: "reportsAccess", module: "/assets/pages/reports.js", group: "GEKTO" },
  { id: "payments", icon: "bi-cash-stack", key: "payments", module: "/assets/pages/payments.js", group: "GEKTO" },
  { id: "calendar", icon: "bi-calendar3", key: "calendar", module: "/assets/pages/calendar.js", group: "GEKTO" },
  { id: "users", icon: "bi-people", key: "users", module: "/assets/pages/users.js", group: "GEKTO" }
];

export const LEVEL2_SECTIONS = [
  { id: "biz_dashboard", icon: "bi-speedometer2", label: "Главное", module: "/assets/pages/soon.js", group: "Основное" },

  { id: "reports_root", icon: "bi-bar-chart", label: "Отчеты", module: "/assets/pages/soon.js", group: "Отчеты" },
  { id: "reports_pnl", icon: "bi-graph-up", label: "P&L", module: "/assets/pages/soon.js", group: "Отчеты" },
  { id: "reports_cashflow", icon: "bi-cash", label: "CashFlow", module: "/assets/pages/soon.js", group: "Отчеты" },
  { id: "reports_balance", icon: "bi-bank", label: "Balance", module: "/assets/pages/soon.js", group: "Отчеты" },

  { id: "sales_create", icon: "bi-cart-plus", label: "Продажи: Создать", module: "/assets/pages/soon.js", group: "Продажи" },
  { id: "sales_list", icon: "bi-list-check", label: "Продажи: Список", module: "/assets/pages/soon.js", group: "Продажи" },
  { id: "sales_installments", icon: "bi-calendar-event", label: "Продажи: Календарь рассрочки", module: "/assets/pages/soon.js", group: "Продажи" },
  { id: "sales_dbkd", icon: "bi-arrow-left-right", label: "Продажи: Дб/Кд", module: "/assets/pages/soon.js", group: "Продажи" },

  { id: "stock_income", icon: "bi-box-arrow-in-down", label: "Склад: Создать приход", module: "/assets/pages/soon.js", group: "Склад" },
  { id: "stock_list", icon: "bi-boxes", label: "Склад: Список", module: "/assets/pages/soon.js", group: "Склад" },
  { id: "stock_dbkd", icon: "bi-arrow-left-right", label: "Склад: Дб/Кд", module: "/assets/pages/soon.js", group: "Склад" },
  { id: "stock_inventory", icon: "bi-clipboard-data", label: "Склад: Инвентаризация", module: "/assets/pages/soon.js", group: "Склад" },

  { id: "cash_create", icon: "bi-wallet2", label: "Касса: Создать", module: "/assets/pages/soon.js", group: "Касса" },
  { id: "cash_list", icon: "bi-receipt", label: "Касса: Список", module: "/assets/pages/soon.js", group: "Касса" },

  { id: "hr_kpi", icon: "bi-bullseye", label: "HR: Назначение KPI", module: "/assets/pages/soon.js", group: "HR" },
  { id: "hr_accrual", icon: "bi-calculator", label: "HR: Начисление", module: "/assets/pages/soon.js", group: "HR" },
  { id: "hr_advances", icon: "bi-cash-coin", label: "HR: Авансы и Дб/Кд", module: "/assets/pages/soon.js", group: "HR" },

  { id: "nomenclature_products", icon: "bi-box-seam", label: "Номенклатура: Товары", module: "/assets/pages/soon.js", group: "Номенклатура" },
  { id: "nomenclature_categories", icon: "bi-tags", label: "Номенклатура: Категория", module: "/assets/pages/soon.js", group: "Номенклатура" },

  { id: "prices_docs", icon: "bi-file-earmark-text", label: "Цены: Документы", module: "/assets/pages/soon.js", group: "Цены" },
  { id: "prices_list", icon: "bi-list-ul", label: "Цены: Список цен", module: "/assets/pages/soon.js", group: "Цены" },
  { id: "prices_installment", icon: "bi-percent", label: "Цены: Проценты рассрочки", module: "/assets/pages/soon.js", group: "Цены" },

  { id: "counterparties_suppliers", icon: "bi-truck", label: "Контрагенты: Поставщики", module: "/assets/pages/soon.js", group: "Контрагенты" },
  { id: "counterparties_clients", icon: "bi-person-lines-fill", label: "Контрагенты: Клиенты", module: "/assets/pages/soon.js", group: "Контрагенты" },

  { id: "settings_users", icon: "bi-people", label: "Настройки: Пользователи", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_roles", icon: "bi-shield-check", label: "Настройки: Роли", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_filials", icon: "bi-diagram-3", label: "Настройки: Филиалы", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_cash_accounts", icon: "bi-wallet", label: "Настройки: Кассы", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_warehouses", icon: "bi-building", label: "Настройки: Склады", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_units", icon: "bi-rulers", label: "Настройки: Ед.изм", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_product_types", icon: "bi-card-list", label: "Настройки: Типы товаров", module: "/assets/pages/soon.js", group: "Настройки" },
  { id: "settings_currency", icon: "bi-currency-exchange", label: "Настройки: Валюта", module: "/assets/pages/soon.js", group: "Настройки" }
];
