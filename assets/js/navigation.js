import { phaseOrder, phases } from "../../config/phases.js";
import { getAnswers, getPhaseCompletion, isPhaseComplete, isPhaseUnlocked, phaseProgress } from "./state.js";

const getPhaseUrl = (phaseId) => new URL(`../../phases/${phaseId}.html`, import.meta.url).href;
const getHomeUrl = () => new URL("../../index.html", import.meta.url).href;
const getSummaryUrl = () => new URL("../../summary.html", import.meta.url).href;
const getLogoUrl = () => new URL("../../assets/logo.svg", import.meta.url).href;
const MOBILE_NAV_KEY = "nixie_mobile_nav_open";

const getPhaseStatus = (phaseId, currentPhaseId) => {
  if (phaseId === currentPhaseId) return "biezacy";
  if (isPhaseComplete(phaseId)) return "gotowy";
  if (isPhaseUnlocked(phaseId)) return "gotowy";
  return "zablokowany";
};

const mobileChevronSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="nav-chevron">
    <path d="M17.3 14.7a1 1 0 0 1-1.4 0L12 10.83l-3.9 3.87a1 1 0 1 1-1.4-1.42l4.6-4.6a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.42Z"/>
  </svg>
`;

const buildNavLink = (phaseId, currentPhaseId) => {
  const phase = phases[phaseId];
  const status = getPhaseStatus(phaseId, currentPhaseId);
  const active = status === "biezacy";
  const disabled = status === "zablokowany";
  const link = document.createElement("a");
  link.className = `nav-link${active ? " is-active" : ""}${status === "gotowy" ? " is-ready" : ""}${disabled ? " is-disabled" : ""}`;
  link.href = disabled ? "#" : getPhaseUrl(phaseId);
  link.setAttribute("aria-current", active ? "page" : "false");
  link.dataset.phaseId = phaseId;
  link.innerHTML = `
    <span class="nav-index">${phase.order}</span>
    <span class="nav-copy">
      <span class="nav-title">${phase.title}</span>
      <span class="nav-meta">${active ? "Biezacy" : status === "gotowy" ? "Gotowy" : "Zablokowany"}</span>
    </span>
    <span class="nav-progress" aria-hidden="true"><span style="width: ${getPhaseCompletion(phaseId)}%"></span></span>
  `;
  if (disabled) {
    link.tabIndex = -1;
    link.setAttribute("aria-disabled", "true");
  }
  return link;
};

const refreshNavLink = (link, currentPhaseId) => {
  const phaseId = link.dataset.phaseId;
  if (!phaseId || phaseId === "summary") return;

  const status = getPhaseStatus(phaseId, currentPhaseId);
  const active = status === "biezacy";
  const disabled = status === "zablokowany";

  link.className = `nav-link${active ? " is-active" : ""}${status === "gotowy" ? " is-ready" : ""}${disabled ? " is-disabled" : ""}`;
  link.href = disabled ? "#" : getPhaseUrl(phaseId);
  link.setAttribute("aria-current", active ? "page" : "false");
  link.setAttribute("aria-disabled", disabled ? "true" : "false");
  link.tabIndex = disabled ? -1 : 0;

  const meta = link.querySelector(".nav-meta");
  const bar = link.querySelector(".nav-progress > span");
  if (meta) meta.textContent = active ? "Biezacy" : status === "gotowy" ? "Gotowy" : "Zablokowany";
  if (bar) bar.style.width = `${getPhaseCompletion(phaseId)}%`;
};

const buildSummaryLink = (currentPhaseId) => {
  const active = currentPhaseId === "summary";
  const link = document.createElement("a");
  link.className = `nav-link nav-link-summary${active ? " is-active" : ""}`;
  link.href = getSummaryUrl();
  link.setAttribute("aria-current", active ? "page" : "false");
  link.dataset.phaseId = "summary";
  link.innerHTML = `
    <span class="nav-index">S</span>
    <span class="nav-copy">
      <span class="nav-title">Podsumowanie</span>
      <span class="nav-meta">${active ? "Biezace" : "Podglad"}</span>
    </span>
    <span class="nav-progress" aria-hidden="true"><span style="width: 100%"></span></span>
  `;
  return link;
};

const renderSidebar = (currentPhaseId) => {
  const aside = document.querySelector('[data-component="nav"]');
  if (!aside) return;
  const progress = phaseProgress(currentPhaseId);
  const nav = document.createElement("div");
  nav.className = "sidebar-nav";
  nav.innerHTML = `
    <div class="sidebar-brand">
      <img class="nav-brand-logo" src="${getLogoUrl()}" alt="" aria-hidden="true" />
      <div>
        <strong>Nixie Discovery</strong>
        <span>Moja Ścieżka</span>
      </div>
    </div>
  `;

  const homeLink = document.createElement("a");
  homeLink.className = "nav-link nav-link-home";
  homeLink.href = getHomeUrl();
  homeLink.innerHTML = `
    <img class="nav-brand-logo nav-brand-logo-inline" src="${getLogoUrl()}" alt="" aria-hidden="true" />
    <span class="nav-copy">
      <span class="nav-title">Strona glowna</span>
      <span class="nav-meta">Start</span>
    </span>
  `;
  nav.appendChild(homeLink);

  const progressBlock = document.createElement("div");
  progressBlock.className = "sidebar-progress";
  progressBlock.innerHTML = `
    <span class="summary-count">${progress.completed} / ${progress.total}</span>
    <div class="progress-bar"><span style="width: ${progress.questionPercent}%"></span></div>
    <p class="sidebar-hint">Biezacy progres odpowiedzi i etapow. Kolejne kroki odblokowuja sie po kolei.</p>
  `;
  nav.appendChild(progressBlock);

  const title = document.createElement("div");
  title.className = "nav-section-title";
  title.textContent = "Etapy";
  nav.appendChild(title);
  phaseOrder.forEach((phaseId) => nav.appendChild(buildNavLink(phaseId, currentPhaseId)));

  const summaryTitle = document.createElement("div");
  summaryTitle.className = "nav-section-title";
  summaryTitle.textContent = "Wynik";
  nav.appendChild(summaryTitle);
  nav.appendChild(buildSummaryLink(currentPhaseId));

  aside.replaceChildren(nav);
};

const renderBottomNav = (currentPhaseId) => {
  const bottom = document.querySelector('[data-component="nav-mobile"]');
  if (!bottom) return;

  const currentPhase = phases[currentPhaseId];
  const progress = phaseProgress(currentPhaseId);
  const isOpen = window.localStorage.getItem(MOBILE_NAV_KEY) === "open";

  const nav = document.createElement("div");
  nav.className = "mobile-nav";
  nav.dataset.open = isOpen ? "true" : "false";
  nav.innerHTML = `
    <div class="mobile-nav-bar">
      <a class="mobile-home-link" href="${getHomeUrl()}" aria-label="Strona glowna">
        <img class="nav-brand-logo nav-brand-logo-inline" src="${getLogoUrl()}" alt="" aria-hidden="true" />
      </a>
      <div class="mobile-nav-current">
        <span class="mobile-nav-eyebrow">${currentPhaseId === "summary" ? "Podsumowanie" : currentPhase?.eyebrow || "Etap"}</span>
        <strong>${currentPhaseId === "summary" ? "Moja Sciezka" : currentPhase?.title || "Nixie Discovery"}</strong>
        <span>${progress.completed}/${progress.total} etapow gotowe</span>
      </div>
      <button class="mobile-nav-toggle" type="button" aria-expanded="${isOpen ? "true" : "false"}" aria-controls="mobile-nav-drawer">
        ${mobileChevronSvg}
      </button>
    </div>
    <div class="mobile-nav-progress"><span style="width:${progress.questionPercent}%"></span></div>
    <div id="mobile-nav-drawer" class="mobile-nav-drawer"></div>
  `;

  const drawer = nav.querySelector(".mobile-nav-drawer");
  phaseOrder.forEach((phaseId) => drawer.appendChild(buildNavLink(phaseId, currentPhaseId)));
  drawer.appendChild(buildSummaryLink(currentPhaseId));

  nav.querySelector(".mobile-nav-toggle")?.addEventListener("click", (event) => {
    const toggle = event.currentTarget;
    const nowOpen = nav.dataset.open !== "true";
    nav.dataset.open = nowOpen ? "true" : "false";
    toggle.setAttribute("aria-expanded", nowOpen ? "true" : "false");
    window.localStorage.setItem(MOBILE_NAV_KEY, nowOpen ? "open" : "closed");
  });

  bottom.replaceChildren(nav);
};

const updateNavProgress = (currentPhaseId) => {
  document.querySelectorAll(".nav-link[data-phase-id]").forEach((link) => {
    refreshNavLink(link, currentPhaseId);
  });

  const overallBar = document.querySelector(".sidebar-progress .progress-bar > span");
  if (overallBar) {
    overallBar.style.width = `${phaseProgress(currentPhaseId).questionPercent}%`;
  }

  const summaryCount = document.querySelector(".sidebar-progress .summary-count");
  if (summaryCount) {
    const progress = phaseProgress(currentPhaseId);
    summaryCount.textContent = `${progress.completed} / ${progress.total}`;
  }

  const phaseBar = document.querySelector("[data-phase-progress-bar]");
  if (phaseBar) {
    phaseBar.style.width = `${phaseProgress(currentPhaseId).questionPercent}%`;
  }

  const mobileBar = document.querySelector(".mobile-nav-progress > span");
  if (mobileBar) {
    mobileBar.style.width = `${phaseProgress(currentPhaseId).questionPercent}%`;
  }

  const phasePill = document.querySelector(".phase-title-row .progress-pill span");
  if (phasePill) {
    const progress = phaseProgress(currentPhaseId);
    phasePill.textContent = `${progress.completed} z ${progress.total} etapow gotowe`;
  }
};

export const initNav = (currentPhaseId) => {
  renderSidebar(currentPhaseId);
  renderBottomNav(currentPhaseId);
  const sync = () => updateNavProgress(currentPhaseId);
  sync();
  window.removeEventListener("nixie:answers-updated", sync);
  window.addEventListener("nixie:answers-updated", sync);
  const answers = getAnswers();
  document.body.dataset.answers = String(Object.keys(answers).length);
};
