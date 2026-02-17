import { API_BASE, I18N, sections } from "./config.js";

const token = localStorage.getItem("tech_token") || "";
if (!token) location.href = "/auth/login.html";

const html = document.documentElement;
let lang = localStorage.getItem("tech_lang") || "ru";
let theme = localStorage.getItem("tech_theme") || "light";
html.lang = lang;
html.setAttribute("data-bs-theme", theme);

const state = {
  me: null,
  activeSection: "dashboard"
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

function accessFor(role) {
  const all = { read: true, write: role === "super_admin" };
  if (role === "super_admin" || role === "gekto_viewer") {
    return {
      dashboard: all, businesses: all, reports: all, payments: all, calendar: all, users: all
    };
  }
  return {};
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

function page(titleKey, sub = "") {
  document.getElementById("pageTitle").textContent = t(titleKey);
  document.getElementById("pageSub").textContent = sub;
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
  const modal = new bootstrap.Modal(modalEl);
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
  for (const s of sections) {
    if (!perms[s.id]?.read) continue;
    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a href="#${s.id}" class="nav-link ${state.activeSection === s.id ? "active" : ""}">
      <i class="nav-icon bi ${s.icon}"></i><p>${esc(t(s.key))}</p></a>`;
    ul.appendChild(li);
  }
}

async function renderCurrent() {
  const perms = accessFor(state.me.role);
  if (!perms[state.activeSection]?.read) {
    document.getElementById("view").innerHTML = `<div class="alert alert-danger">${t("noAccess")}</div>`;
    return;
  }
  const section = sections.find(s => s.id === state.activeSection);
  if (!section) return;

  try {
    const mod = await import(section.module);
    await mod.render({
      state,
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

async function bootstrap() {
  state.me = (await api("/me")).user;
  if (!["super_admin", "gekto_viewer"].includes(state.me.role)) {
    localStorage.removeItem("tech_token");
    location.href = "/auth/login.html";
    return;
  }

  document.getElementById("who").textContent = `${state.me.full_name} (${state.me.role})`;
  const hash = (location.hash || "#dashboard").replace("#", "");
  state.activeSection = sections.find(s => s.id === hash) ? hash : "dashboard";
  renderMenu();
  paintControls();
  await renderCurrent();
}

window.addEventListener("hashchange", () => {
  const next = (location.hash || "#dashboard").replace("#", "");
  state.activeSection = sections.find(s => s.id === next) ? next : "dashboard";
  renderMenu();
  renderCurrent();
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
