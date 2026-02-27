import { API_BASE, I18N } from "./config.js";
import { BUSINESS_ROLES, GEKTO_ROLES, LEVEL1_SECTIONS, LEVEL2_SECTIONS } from "./sections.js";

function safeNextPath(path) {
  const p = String(path || "");
  if (!p.startsWith("/")) return "/";
  if (p.startsWith("//")) return "/";
  return p;
}

function redirectToLogin() {
  const next = encodeURIComponent(safeNextPath(location.pathname + location.search + location.hash));
  location.href = `/auth/login.html?next=${next}`;
}

const token = localStorage.getItem("tech_token") || "";
if (!token) redirectToLogin();

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
  openParents: new Set()
};

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

function routeForSection(sectionId) {
  return `/${encodeURIComponent(sectionId)}`;
}

function sectionIdFromUrl() {
  const path = String(location.pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/main" || path === "/main.html") {
    return String(location.hash || "").replace(/^#/, "");
  }
  const first = path.split("/").filter(Boolean)[0] || "";
  return decodeURIComponent(first);
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

function parentIconFromChildren(children = []) {
  return children[0]?.icon || "bi-folder2-open";
}

async function api(path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {}, { Authorization: "Bearer " + token });
  const r = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) {
    localStorage.removeItem("tech_token");
    redirectToLogin();
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

function renderMenu() {
  const perms = accessFor(state.me.role);
  const ul = document.getElementById("menu");
  ul.innerHTML = "";

  const visible = state.sections.filter(s => perms[s.id]?.read);
  if (state.roleScope === "business") {
    const standalone = [];
    const groups = [];
    const map = new Map();

    for (const s of visible) {
      const gid = String(s.groupId || "");
      if (gid === "core" || !gid) {
        standalone.push(s);
        continue;
      }
      if (!map.has(gid)) {
        const g = { id: gid, label: groupLabel(s), children: [] };
        map.set(gid, g);
        groups.push(g);
      }
      map.get(gid).children.push(s);
    }

    for (const s of standalone) {
      const li = document.createElement("li");
      li.className = "nav-item";
      li.innerHTML = `<a href="${routeForSection(s.id)}" data-section="${s.id}" class="nav-link ${state.activeSection === s.id ? "active" : ""}">
        <i class="nav-icon bi ${s.icon}"></i><p>${esc(sectionLabel(s))}</p></a>`;
      ul.appendChild(li);
    }

    for (const g of groups) {
      const hasActive = g.children.some(x => x.id === state.activeSection);
      const opened = hasActive || state.openParents.has(g.id);
      const li = document.createElement("li");
      li.className = `nav-item has-treeview ${opened ? "menu-open" : ""}`;
      li.innerHTML = `
        <a href="#" data-parent-id="${esc(g.id)}" class="nav-link ${opened ? "active" : ""}">
          <i class="nav-icon bi ${parentIconFromChildren(g.children)}"></i>
          <p>${esc(g.label)}<i class="nav-arrow bi ${opened ? "bi-chevron-down" : "bi-chevron-right"}"></i></p>
        </a>
        <ul class="nav nav-treeview" style="${opened ? "" : "display:none;"}">
          ${g.children.map(s => `
            <li class="nav-item">
              <a href="${routeForSection(s.id)}" data-section="${s.id}" class="nav-link ${state.activeSection === s.id ? "active" : ""}">
                <i class="nav-icon bi ${s.icon}"></i><p>${esc(sectionLabel(s))}</p>
              </a>
            </li>
          `).join("")}
        </ul>`;
      ul.appendChild(li);
    }
  } else {
    for (const s of visible) {
      const li = document.createElement("li");
      li.className = "nav-item";
      li.innerHTML = `<a href="${routeForSection(s.id)}" data-section="${s.id}" class="nav-link ${state.activeSection === s.id ? "active" : ""}">
        <i class="nav-icon bi ${s.icon}"></i><p>${esc(sectionLabel(s))}</p></a>`;
      ul.appendChild(li);
    }
  }

  const homeId = getDefaultSectionId();
  const brand = document.querySelector(".brand-link");
  if (brand && homeId) {
    brand.setAttribute("href", routeForSection(homeId));
  }
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

function resolveSectionByUrl() {
  const sectionId = sectionIdFromUrl();
  const fallback = getDefaultSectionId();
  return state.sections.find(s => s.id === sectionId) ? sectionId : fallback;
}

function navigateTo(sectionId, replace = false) {
  if (!state.sections.find(s => s.id === sectionId)) return;
  const url = routeForSection(sectionId);
  if (replace) history.replaceState({}, "", url);
  else history.pushState({}, "", url);
  state.activeSection = sectionId;
  renderMenu();
  renderCurrent();
}

async function bootstrap() {
  state.me = (await api("/me")).user;
  const role = state.me.role;
  const pick = getSectionsForRole(role);
  state.roleScope = pick.scope;
  state.sections = pick.sections;
  state.openParents = new Set();

  if (!state.sections.length) {
    localStorage.removeItem("tech_token");
    redirectToLogin();
    return;
  }

  document.getElementById("who").textContent = `${state.me.full_name} (${state.me.role})`;
  state.activeSection = resolveSectionByUrl();
  if (!state.activeSection) {
    localStorage.removeItem("tech_token");
    redirectToLogin();
    return;
  }

  const canonical = routeForSection(state.activeSection);
  if (location.pathname !== canonical || location.hash) {
    history.replaceState({}, "", canonical);
  }

  renderMenu();
  paintControls();
  for (const s of state.sections) import(s.module).catch(() => {});
  await renderCurrent();
}

window.addEventListener("popstate", () => {
  if (!state.sections.length) return;
  state.activeSection = resolveSectionByUrl();
  if (!state.activeSection) state.activeSection = getDefaultSectionId();
  renderMenu();
  renderCurrent();
});

document.getElementById("menu").addEventListener("click", (e) => {
  const parentLink = e.target.closest("a[data-parent-id]");
  if (parentLink) {
    e.preventDefault();
    const pid = String(parentLink.getAttribute("data-parent-id") || "");
    if (!pid) return;
    if (state.openParents.has(pid)) state.openParents.delete(pid);
    else state.openParents.add(pid);
    renderMenu();
    return;
  }

  const link = e.target.closest("a[data-section]");
  if (!link) return;
  const sectionId = link.getAttribute("data-section");
  if (!sectionId) return;
  e.preventDefault();
  if (sectionId === state.activeSection) return;
  navigateTo(sectionId, false);
});

document.querySelector(".brand-link")?.addEventListener("click", (e) => {
  const homeId = getDefaultSectionId();
  if (!homeId) return;
  e.preventDefault();
  if (homeId === state.activeSection) return;
  navigateTo(homeId, false);
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
