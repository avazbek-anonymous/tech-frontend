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
  { id: "business_settings", icon: "bi-sliders2", label: tr("Настройки бизнесов", "Biznes sozlamalari", "Business settings"), module: "/assets/pages/soon.js", groupId: "gekto", group: GROUPS.GEKTO, allowedRoles: ["super_admin"] },
  { id: "reports", icon: "bi-bar-chart", key: "reportsAccess", module: "/assets/pages/reports.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "payments", icon: "bi-cash-stack", key: "payments", module: "/assets/pages/payments.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "calendar", icon: "bi-calendar3", key: "calendar", module: "/assets/pages/calendar.js", groupId: "gekto", group: GROUPS.GEKTO },
  { id: "users", icon: "bi-people", key: "users", module: "/assets/pages/users.js", groupId: "gekto", group: GROUPS.GEKTO }
];

export const LEVEL2_SECTIONS = [];

