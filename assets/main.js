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
  openParents: {}
};

const LABEL_OVERRIDES = {
  sales_dbkd: { ru: "Продажи: Дт, Кт", uz: "Savdo: Dt, Kt", en: "Sales: Dt, Kt" },
  stock_income: { ru: "Приход", uz: "Kirim", en: "Receipt" },
  stock_list: { ru: "Список", uz: "Ro'yxat", en: "List" },
  stock_dbkd: { ru: "Дт, Кт", uz: "Dt, Kt", en: "Dt, Kt" },
  stock_inventory: { ru: "Инвентаризация", uz: "Inventarizatsiya", en: "Inventory" },
  hr_advances: { ru: "HR: Авансы и Дт, Кт", uz: "HR: Avans va Dt, Kt", en: "HR: Advances and Dt, Kt" }
};

function applySectionOverrides(sections) {
  return sections.map(section => {
    const label = LABEL_OVERRIDES[section.id];
    return label ? { ...section, label } : section;
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

function getSectionsForRole(role) {
  if (GEKTO_ROLES.includes(role)) return { scope: "gekto", sections: LEVEL1_SECTIONS };
  if (BUSINESS_ROLES.includes(role)) return { scope: "business", sections: LEVEL2_SECTIONS };
  return { scope: "", sections: [] };
}

function accessFor(role) {
  const permissions = {};
  for (const s of state.sections) {
    permissions[s.id] = {
      read: true,
      write: isWriteRole(role)
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
    li.innerHTML = `<a href="#${s.id}" class="nav-link ${state.activeSection === s.id ? "active" : ""}">
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
      li.innerHTML = `<a href="#${single.id}" class="nav-link ${state.activeSection === single.id ? "active" : ""}">
        <i class="nav-icon bi ${single.icon}"></i><p>${esc(sectionLabel(single))}</p></a>`;
      ul.appendChild(li);
      continue;
    }

    const parentLabel = root ? sectionLabel(root) : (item.label || sectionLabel(children[0]));
    const parentIcon = root?.icon || "bi-folder";
    const parentActive = root ? state.activeSection === root.id : false;
    const childActive = children.some(s => s.id === state.activeSection);
    const open = Object.prototype.hasOwnProperty.call(state.openParents, groupId)
      ? !!state.openParents[groupId]
      : (parentActive || childActive);
    state.openParents[groupId] = open;

    const li = document.createElement("li");
    li.className = `nav-item ${open ? "menu-open" : ""}`;
    li.innerHTML = `<a href="${root ? `#${root.id}` : "#"}" class="nav-link ${parentActive ? "active" : ""}" data-parent-id="${esc(groupId)}"${root ? ` data-parent-section="${esc(root.id)}"` : ""}>
      <i class="nav-icon bi ${parentIcon}"></i>
      <p>${esc(parentLabel)}<i class="nav-arrow bi bi-chevron-right"></i></p>
    </a>`;

    const tree = document.createElement("ul");
    tree.className = "nav nav-treeview";
    tree.style.display = open ? "block" : "none";

    for (const child of children) {
      const childLi = document.createElement("li");
      childLi.className = "nav-item";
      childLi.innerHTML = `<a href="#${child.id}" class="nav-link ${state.activeSection === child.id ? "active" : ""}">
        <i class="nav-icon bi ${child.icon}"></i><p>${esc(sectionLabel(child))}</p></a>`;
      tree.appendChild(childLi);
    }

    li.appendChild(tree);
    ul.appendChild(li);
  }
}

function ensureActiveParentOpen() {
  if (state.roleScope !== "business") return;
  const active = state.sections.find(s => s.id === state.activeSection);
  if (!active || !active.groupId) return;

  const siblings = state.sections.filter(s => s.groupId === active.groupId);
  const root = siblings.find(s => s.id.endsWith("_root")) || null;
  if (!root || active.id !== root.id) state.openParents[active.groupId] = true;
}

function renderMenu() {
  const perms = accessFor(state.me.role);
  const ul = document.getElementById("menu");
  ul.innerHTML = "";

  if (state.roleScope === "business") {
    renderBusinessTreeMenu(ul, perms);
    return;
  }
  renderFlatMenu(ul, perms);
}

async function renderCurrent() {
  const seq = ++state.renderSeq;
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
  return state.sections.length ? state.sections[0].id : "";
}

function resolveSectionByHash() {
  const hash = (location.hash || "").replace("#", "");
  const fallback = getDefaultSectionId();
  return state.sections.find(s => s.id === hash) ? hash : fallback;
}

async function bootstrap() {
  state.me = (await api("/me")).user;
  const role = state.me.role;
  const pick = getSectionsForRole(role);
  state.roleScope = pick.scope;
  state.sections = applySectionOverrides(pick.sections);
  state.openParents = {};

  if (!state.sections.length) {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
    return;
  }

  document.getElementById("who").textContent = `${state.me.full_name} (${state.me.role})`;
  state.activeSection = resolveSectionByHash();
  if (!state.activeSection) {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
    return;
  }

  ensureActiveParentOpen();
  renderMenu();
  paintControls();
  for (const s of state.sections) import(s.module).catch(() => {});
  await renderCurrent();
}

window.addEventListener("hashchange", () => {
  if (!state.sections.length) return;
  state.activeSection = resolveSectionByHash();
  ensureActiveParentOpen();
  renderMenu();
  renderCurrent();
});

document.getElementById("menu").addEventListener("click", ev => {
  const link = ev.target.closest("a[data-parent-id]");
  if (!link) return;

  const parentId = link.dataset.parentId || "";
  const sectionId = link.dataset.parentSection || "";
  if (parentId) state.openParents[parentId] = !state.openParents[parentId];

  if (sectionId) {
    const nextHash = `#${sectionId}`;
    if (location.hash !== nextHash) {
      location.hash = sectionId;
    } else {
      renderMenu();
      renderCurrent();
    }
  } else {
    renderMenu();
  }
  ev.preventDefault();
});

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
