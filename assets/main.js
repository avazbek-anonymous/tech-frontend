import { API_BASE, I18N } from "./config.js";
import { BUSINESS_ROLES, GEKTO_ROLES, LEVEL1_SECTIONS, LEVEL2_SECTIONS } from "./sections.js";

const token = localStorage.getItem("tech_token") || "";
if (!token) location.href = "/auth/login.html";

const html = document.documentElement;
let lang = localStorage.getItem("tech_lang") || "ru";
let theme = localStorage.getItem("tech_theme") || "light";
html.lang = lang;
html.setAttribute("data-bs-theme", theme);

const state = {
  me: null,
  activeSection: "",
  renderSeq: 0,
  sections: [],
  roleScope: "",
  rolePermissions: null,
  menuSyncTimer: 0,
  openParents: {},
  skipAutoCollapse: false
};

const SECTION_OVERRIDES = {
  sales_dbkd: { label: { ru: "Продажи: Дт, Кт", uz: "Savdo: Dt, Kt", en: "Sales: Dt, Kt" } },
  stock_income: { label: { ru: "Приход", uz: "Kirim", en: "Receipt" } },
  stock_list: { label: { ru: "Список", uz: "Ro'yxat", en: "List" } },
  stock_dbkd: { label: { ru: "Дт, Кт", uz: "Dt, Kt", en: "Dt, Kt" } },
  stock_inventory: { label: { ru: "Инвентаризация", uz: "Inventarizatsiya", en: "Inventory" } },
  hr_advances: { label: { ru: "HR: Авансы и Дт, Кт", uz: "HR: Avans va Dt, Kt", en: "HR: Advances and Dt, Kt" } },
  settings_users: { module: "/assets/pages/settings-users.js" },
  settings_roles: { module: "/assets/pages/roles.js" },
  settings_filials: { module: "/assets/pages/settings-filials.js" },
  settings_cash_accounts: { module: "/assets/pages/settings-cash-accounts.js" },
  settings_warehouses: { module: "/assets/pages/settings-warehouses.js" },
  settings_units: { module: "/assets/pages/settings-units.js" },
  settings_product_types: { module: "/assets/pages/settings-product-types.js" },
  settings_currency: { module: "/assets/pages/settings-currency.js" }
};

function applySectionOverrides(sections) {
  return sections.map(section => {
    const override = SECTION_OVERRIDES[section.id];
    if (!override) return section;
    return { ...section, ...override };
  });
}

function t(k) {
  return (I18N[lang] && I18N[lang][k]) || I18N.ru[k] || k;
}

function fmt(n) {
  return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : (lang === "uz" ? "uz-UZ" : "en-US")).format(Number(n || 0));
}

function esc(s) {
  return String(s || "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function monthNow() {
  return new Date().toISOString().slice(0, 7);
}

function isWriteRole(role) {
  return role === "super_admin" || role === "business_owner";
}

function hasReadPermission(sectionId) {
  if (!state.me) return false;
  if (isWriteRole(state.me.role)) return true;
  if (!state.rolePermissions) return false;

  const readKey = `${sectionId}.read`;
  if (state.rolePermissions.has(readKey)) return true;

  const writeKeys = ["add", "change", "disable", "delete", "export"];
  return writeKeys.some(action => state.rolePermissions.has(`${sectionId}.${action}`));
}

function hasWritePermission(sectionId) {
  if (!state.me) return false;
  if (isWriteRole(state.me.role)) return true;
  if (!state.rolePermissions) return false;

  const writeKeys = ["add", "change", "disable", "delete", "export"];
  return writeKeys.some(action => state.rolePermissions.has(`${sectionId}.${action}`));
}

function getSectionsForRole(role) {
  if (GEKTO_ROLES.includes(role)) return { scope: "gekto", sections: LEVEL1_SECTIONS };
  if (BUSINESS_ROLES.includes(role)) return { scope: "business", sections: LEVEL2_SECTIONS };
  return { scope: "", sections: [] };
}

function accessFor(role) {
  const permissions = {};
  for (const s of state.sections) {
    if (state.roleScope !== "business") {
      permissions[s.id] = {
        read: true,
        write: isWriteRole(role)
      };
      continue;
    }

    if (!isWriteRole(role) && s.id.startsWith("settings_")) {
      permissions[s.id] = {
        read: false,
        write: false
      };
      continue;
    }

    permissions[s.id] = {
      read: isWriteRole(role) ? true : hasReadPermission(s.id),
      write: isWriteRole(role) ? true : hasWritePermission(s.id)
    };
  }
  return permissions;
}

function sectionLabel(section) {
  if (!section) return "";
  if (section.label && typeof section.label === "string") return section.label;
  if (section.label && typeof section.label === "object") {
    return section.label[lang] || section.label.ru || section.label.en || section.id;
  }
  if (section.key) return t(section.key);
  return section.id;
}

function groupLabel(section) {
  if (!section || !section.group) return "";
  if (typeof section.group === "string") return section.group;
  if (typeof section.group === "object") {
    return section.group[lang] || section.group.ru || section.group.en || "";
  }
  return "";
}

async function api(path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {}, { Authorization: "Bearer " + token });
  const r = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
    return;
  }
  if (!r.ok || !data.ok) throw new Error(data.error || ("ERR_" + r.status));
  return data;
}

function page(titleKey, sub = "", opts = {}) {
  const title = opts.raw ? String(titleKey || "") : t(titleKey);
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageSub").textContent = sub;
  document.title = `GEKTO Tech - ${title}`;
}

function openModal({ title, bodyHtml, saveText, onSave }) {
  const host = document.createElement("div");
  host.innerHTML = `
    <div class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${esc(title || "")}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">${bodyHtml || ""}</div>
          <div class="modal-footer">
            <div class="text-danger me-auto small" data-err></div>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" data-save>${esc(saveText || t("save"))}</button>
          </div>
        </div>
      </div>
    </div>`;
  const modalEl = host.firstElementChild;
  document.body.appendChild(modalEl);
  const ModalCtor = window.bootstrap && window.bootstrap.Modal ? window.bootstrap.Modal : null;
  if (!ModalCtor) {
    modalEl.classList.add("show");
    modalEl.style.display = "block";
    document.body.classList.add("modal-open");
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
    modalEl.querySelectorAll("[data-bs-dismiss='modal']").forEach(btn => btn.addEventListener("click", () => {
      modalEl.remove();
      backdrop.remove();
      document.body.classList.remove("modal-open");
    }));
    const errEl = modalEl.querySelector("[data-err]");
    const saveBtn = modalEl.querySelector("[data-save]");
    saveBtn.addEventListener("click", async () => {
      errEl.textContent = "";
      saveBtn.disabled = true;
      try {
        await onSave(modalEl);
        modalEl.remove();
        backdrop.remove();
        document.body.classList.remove("modal-open");
      } catch (e) {
        errEl.textContent = String(e?.message || e);
      } finally {
        saveBtn.disabled = false;
      }
    });
    return;
  }
  const modal = new ModalCtor(modalEl);
  const errEl = modalEl.querySelector("[data-err]");
  const saveBtn = modalEl.querySelector("[data-save]");

  saveBtn.addEventListener("click", async () => {
    errEl.textContent = "";
    saveBtn.disabled = true;
    try {
      await onSave(modalEl);
      modal.hide();
    } catch (e) {
      errEl.textContent = String(e?.message || e);
    } finally {
      saveBtn.disabled = false;
    }
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    modal.dispose();
    modalEl.remove();
  });

  modal.show();
}

function paintControls() {
  document.querySelectorAll("[data-lang]").forEach(b => {
    b.classList.toggle("btn-secondary", b.dataset.lang === lang);
    b.classList.toggle("btn-outline-secondary", b.dataset.lang !== lang);
  });
  document.querySelectorAll("[data-theme]").forEach(b => {
    b.classList.toggle("btn-secondary", b.dataset.theme === theme);
    b.classList.toggle("btn-outline-secondary", b.dataset.theme !== theme);
  });
  document.getElementById("logoutBtn").title = t("logout");
}

function collapseAllParents() {
  const next = {};
  for (const section of state.sections) {
    if (section.groupId) next[section.groupId] = false;
  }
  state.openParents = next;
}

function openParentForSection(sectionId) {
  const active = state.sections.find(section => section.id === sectionId);
  if (!active?.groupId) return;

  const siblings = state.sections.filter(section => section.groupId === active.groupId);
  if (siblings.length <= 1) return;
  state.openParents[active.groupId] = true;
}

function isCollapsedMiniDesktop() {
  return state.roleScope === "business"
    && window.innerWidth >= 992
    && document.body.classList.contains("sidebar-mini")
    && document.body.classList.contains("sidebar-collapse");
}

function syncCollapsedFlyoutPosition() {
  if (!isCollapsedMiniDesktop()) return;
  const menu = document.getElementById("menu");
  if (!menu) return;

  const openItem = menu.querySelector(".nav-item.menu-open");
  if (!openItem) return;

  const parentLink = openItem.querySelector(":scope > .nav-link");
  const tree = openItem.querySelector(":scope > .nav-treeview");
  if (!parentLink || !tree) return;

  const linkRect = parentLink.getBoundingClientRect();
  const left = Math.round(linkRect.right + 10);
  const top = Math.max(8, Math.round(linkRect.top - 4));
  const maxWidth = Math.max(210, Math.min(320, window.innerWidth - left - 12));
  const maxHeight = Math.max(180, window.innerHeight - top - 12);

  tree.style.setProperty("--flyout-left", `${left}px`);
  tree.style.setProperty("--flyout-top", `${top}px`);
  tree.style.setProperty("--flyout-max-width", `${maxWidth}px`);
  tree.style.setProperty("--flyout-max-height", `${maxHeight}px`);
}

function childLabel(section, parentLabel, fallbackGroupLabel = "") {
  const label = String(sectionLabel(section) || "").trim();
  const candidates = [parentLabel, fallbackGroupLabel]
    .map(v => String(v || "").trim())
    .filter(Boolean);

  for (const base of candidates) {
    const prefix = `${base}:`;
    if (label.toLowerCase().startsWith(prefix.toLowerCase())) {
      const trimmed = label.slice(prefix.length).trim();
      return trimmed || label;
    }
  }

  const direct = label.split(":");
  if (direct.length > 1) {
    const trimmed = direct.slice(1).join(":").trim();
    if (trimmed) return trimmed;
  }

  return label;
}

function destroyMenuTooltips() {
  const TooltipCtor = window.bootstrap && window.bootstrap.Tooltip ? window.bootstrap.Tooltip : null;
  if (!TooltipCtor) return;

  const menu = document.getElementById("menu");
  if (!menu) return;

  const links = menu.querySelectorAll(".nav-link[data-menu-title]");
  links.forEach(link => {
    const existing = TooltipCtor.getInstance(link);
    if (existing) {
      existing.hide();
      existing.dispose();
    }
    link.removeAttribute("data-bs-title");
    link.removeAttribute("data-bs-original-title");
  });
}

function initMenuTooltips() {
  const TooltipCtor = window.bootstrap && window.bootstrap.Tooltip ? window.bootstrap.Tooltip : null;
  if (!TooltipCtor) return;

  const menu = document.getElementById("menu");
  if (!menu) return;

  const hasOpenParent = !!menu.querySelector(":scope > .nav-item.menu-open");
  if (!isCollapsedMiniDesktop() || hasOpenParent) {
    destroyMenuTooltips();
    return;
  }

  const links = menu.querySelectorAll(":scope > .nav-item > .nav-link[data-menu-title]");
  links.forEach(link => {
    const title = String(link.getAttribute("data-menu-title") || "").trim();
    if (!title) return;

    const existing = TooltipCtor.getInstance(link);
    if (existing) existing.dispose();

    link.setAttribute("data-bs-title", title);
    new TooltipCtor(link, {
      container: "body",
      trigger: "hover",
      placement: "right",
      boundary: "viewport",
      delay: { show: 0, hide: 0 },
      offset: [0, 8]
    });
  });
}

function refreshMenuTooltipsBySidebarState() {
  if (isCollapsedMiniDesktop()) {
    initMenuTooltips();
    syncCollapsedFlyoutPosition();
    return;
  }
  destroyMenuTooltips();
}

function renderFlatMenu(ul, perms) {
  let currentGroupId = "";
  for (const s of state.sections) {
    if (!perms[s.id]?.read) continue;

    const groupId = s.groupId || "";
    if (s.group && groupId && groupId !== currentGroupId) {
      const head = document.createElement("li");
      head.className = "nav-header text-uppercase small";
      head.textContent = groupLabel(s);
      ul.appendChild(head);
      currentGroupId = groupId;
    }

    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a href="#${s.id}" class="nav-link ${state.activeSection === s.id ? "active" : ""}" data-menu-title="${esc(sectionLabel(s))}" aria-label="${esc(sectionLabel(s))}">
      <i class="nav-icon bi ${s.icon}"></i><p>${esc(sectionLabel(s))}</p></a>`;
    ul.appendChild(li);
  }
}

function renderBusinessTreeMenu(ul, perms) {
  const groupOrder = [];
  const groups = new Map();

  for (const section of state.sections) {
    if (!perms[section.id]?.read) continue;
    const groupId = section.groupId || section.id;
    if (!groups.has(groupId)) {
      groups.set(groupId, { id: groupId, label: groupLabel(section), sections: [] });
      groupOrder.push(groupId);
    }
    groups.get(groupId).sections.push(section);
  }

  for (const groupId of groupOrder) {
    const item = groups.get(groupId);
    const root = item.sections.find(s => s.id.endsWith("_root")) || null;
    const children = root ? item.sections.filter(s => s.id !== root.id) : item.sections;

    if ((root && children.length === 0) || (!root && children.length === 1)) {
      const single = root || children[0];
      const li = document.createElement("li");
      li.className = "nav-item";
      li.innerHTML = `<a href="#${single.id}" class="nav-link ${state.activeSection === single.id ? "active" : ""}" data-menu-title="${esc(sectionLabel(single))}" aria-label="${esc(sectionLabel(single))}">
        <i class="nav-icon bi ${single.icon}"></i><p>${esc(sectionLabel(single))}</p></a>`;
      ul.appendChild(li);
      continue;
    }

    const parentGroupLabel = item.label || groupLabel(children[0]) || "";
    const parentLabel = root ? sectionLabel(root) : (parentGroupLabel || sectionLabel(children[0]));
    const parentIcon = root?.icon || children[0]?.icon || "bi-folder";
    const childActive = children.some(s => s.id === state.activeSection);
    const parentActive = (root ? state.activeSection === root.id : false) || childActive;
    const open = Object.prototype.hasOwnProperty.call(state.openParents, groupId)
      ? !!state.openParents[groupId]
      : false;
    state.openParents[groupId] = open;

    const li = document.createElement("li");
    li.className = `nav-item ${open ? "menu-open" : ""}`;
    li.innerHTML = `<a href="${root ? `#${root.id}` : "#"}" class="nav-link ${parentActive ? "active" : ""}" data-menu-title="${esc(parentLabel)}" aria-label="${esc(parentLabel)}" data-parent-id="${esc(groupId)}"${root ? ` data-parent-section="${esc(root.id)}"` : ""}>
      <i class="nav-icon bi ${parentIcon}"></i>
      <p><span class="menu-label">${esc(parentLabel)}</span><i class="nav-arrow bi bi-chevron-right"></i></p>
    </a>`;

    const tree = document.createElement("ul");
    tree.className = "nav nav-treeview";
    tree.style.display = open ? "block" : "none";

    for (const child of children) {
      const childLi = document.createElement("li");
      childLi.className = "nav-item";
      const childText = childLabel(child, parentLabel, parentGroupLabel);
      childLi.innerHTML = `<a href="#${child.id}" class="nav-link ${state.activeSection === child.id ? "active" : ""}" aria-label="${esc(childText)}">
        <i class="nav-icon bi ${child.icon}"></i><p>${esc(childText)}</p></a>`;
      tree.appendChild(childLi);
    }

    li.appendChild(tree);
    ul.appendChild(li);
  }
}

function renderMenu() {
  const perms = accessFor(state.me.role);
  const ul = document.getElementById("menu");
  ul.innerHTML = "";

  if (state.roleScope === "business") {
    renderBusinessTreeMenu(ul, perms);
    initMenuTooltips();
    if (isCollapsedMiniDesktop()) requestAnimationFrame(syncCollapsedFlyoutPosition);
    return;
  }
  renderFlatMenu(ul, perms);
  initMenuTooltips();
}

function syncMenuAfterAnimation(runCurrent = false) {
  clearTimeout(state.menuSyncTimer);
  const delay = state.roleScope === "business" ? 320 : 0;
  state.menuSyncTimer = setTimeout(() => {
    renderMenu();
    if (runCurrent) renderCurrent();
  }, delay);
}

async function renderCurrent() {
  const seq = ++state.renderSeq;
  if (!state.activeSection) {
    document.getElementById("view").innerHTML = `<div class="alert alert-danger">${t("noAccess")}</div>`;
    return;
  }
  const perms = accessFor(state.me.role);
  if (!perms[state.activeSection]?.read) {
    document.getElementById("view").innerHTML = `<div class="alert alert-danger">${t("noAccess")}</div>`;
    return;
  }
  const section = state.sections.find(s => s.id === state.activeSection);
  if (!section) return;

  try {
    document.getElementById("view").innerHTML = `<div class="text-muted small py-2">Loading...</div>`;
    const mod = await import(section.module);
    if (seq !== state.renderSeq) return;
    await mod.render({
      state,
      section,
      t,
      fmt,
      esc,
      api,
      page,
      monthNow,
      accessFor,
      openModal,
      viewEl: document.getElementById("view")
    });
  } catch (e) {
    document.getElementById("view").innerHTML = `<div class="alert alert-danger">${esc(e.message || e)}</div>`;
  }
}

function getDefaultSectionId() {
  const perms = state.me ? accessFor(state.me.role) : {};
  const firstAllowed = state.sections.find(section => perms[section.id]?.read);
  return firstAllowed ? firstAllowed.id : "";
}

function resolveSectionByHash() {
  const hash = (location.hash || "").replace("#", "");
  const perms = state.me ? accessFor(state.me.role) : {};
  const fallback = getDefaultSectionId();
  return state.sections.find(s => s.id === hash) && perms[hash]?.read ? hash : fallback;
}

async function bootstrap() {
  state.me = (await api("/me")).user;
  const role = state.me.role;
  const pick = getSectionsForRole(role);
  state.roleScope = pick.scope;
  state.sections = applySectionOverrides(pick.sections);
  state.rolePermissions = null;
  state.openParents = {};

  if (state.roleScope === "business" && !isWriteRole(role)) {
    if (state.me.role_id) {
      try {
        const resp = await api(`/roles/${state.me.role_id}/permissions`);
        state.rolePermissions = new Set(resp.permissions || []);
      } catch {
        state.rolePermissions = new Set();
      }
    } else {
      state.rolePermissions = new Set();
    }
  }

  if (!state.sections.length) {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
    return;
  }

  document.getElementById("who").textContent = `${state.me.full_name} (${state.me.role})`;
  state.activeSection = resolveSectionByHash();
  if (!state.activeSection) {
    renderMenu();
    paintControls();
    document.getElementById("view").innerHTML = `<div class="alert alert-danger">${t("noAccess")}</div>`;
    return;
  }

  collapseAllParents();
  if (!isCollapsedMiniDesktop()) openParentForSection(state.activeSection);
  renderMenu();
  paintControls();
  for (const s of state.sections) import(s.module).catch(() => {});
  await renderCurrent();
}

window.addEventListener("hashchange", () => {
  if (!state.sections.length) return;
  const skipAutoCollapse = state.skipAutoCollapse;
  const doCollapse = state.roleScope === "business" && !skipAutoCollapse;
  state.skipAutoCollapse = false;
  if (doCollapse) collapseAllParents();
  state.activeSection = resolveSectionByHash();
  if (!state.activeSection) {
    renderMenu();
    document.getElementById("view").innerHTML = `<div class="alert alert-danger">${t("noAccess")}</div>`;
    return;
  }
  if (doCollapse && !isCollapsedMiniDesktop()) openParentForSection(state.activeSection);
  if (state.roleScope === "business" && skipAutoCollapse) {
    syncMenuAfterAnimation(true);
    return;
  }
  renderMenu();
  renderCurrent();
});

document.getElementById("menu").addEventListener("click", ev => {
  if (isCollapsedMiniDesktop()) destroyMenuTooltips();

  const childLink = ev.target.closest(".nav-treeview .nav-link[href^='#']");
  if (childLink && isCollapsedMiniDesktop()) {
    state.skipAutoCollapse = true;
    ev.stopPropagation();
    return;
  }

  const link = ev.target.closest("a[data-parent-id]");
  if (!link) return;
  ev.stopPropagation();

  const collapsedMini = isCollapsedMiniDesktop();
  const parentId = link.dataset.parentId || "";
  const sectionId = link.dataset.parentSection || "";
  if (parentId) {
    const willOpen = !state.openParents[parentId];
    collapseAllParents();
    if (willOpen) state.openParents[parentId] = true;
  }

  if (collapsedMini) {
    renderMenu();
    ev.preventDefault();
    return;
  }

  if (sectionId) {
    state.skipAutoCollapse = true;
    const nextHash = `#${sectionId}`;
    if (location.hash !== nextHash) {
      location.hash = sectionId;
    } else {
      state.activeSection = sectionId;
      syncMenuAfterAnimation(true);
    }
  } else {
    syncMenuAfterAnimation(false);
  }
  ev.preventDefault();
});

document.addEventListener("click", ev => {
  if (!isCollapsedMiniDesktop()) return;
  const menu = document.getElementById("menu");
  const target = ev.target;
  if (!menu || !(target instanceof Node)) return;
  if (menu.contains(target)) return;

  const hasOpen = Object.values(state.openParents).some(Boolean);
  if (!hasOpen) return;

  collapseAllParents();
  renderMenu();
});

window.addEventListener("resize", () => {
  refreshMenuTooltipsBySidebarState();
});

window.addEventListener("scroll", () => {
  if (isCollapsedMiniDesktop()) syncCollapsedFlyoutPosition();
}, true);

const sidebarClassObserver = new MutationObserver(() => {
  refreshMenuTooltipsBySidebarState();
});
sidebarClassObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

document.querySelectorAll("[data-lang]").forEach(btn => btn.addEventListener("click", () => {
  lang = btn.dataset.lang;
  localStorage.setItem("tech_lang", lang);
  html.lang = lang;
  paintControls();
  renderMenu();
  renderCurrent();
}));

document.querySelectorAll("[data-theme]").forEach(btn => btn.addEventListener("click", () => {
  theme = btn.dataset.theme;
  localStorage.setItem("tech_theme", theme);
  html.setAttribute("data-bs-theme", theme);
  paintControls();
}));

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("tech_token");
  location.href = "/auth/login.html";
});

bootstrap();
