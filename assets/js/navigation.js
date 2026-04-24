import { phaseOrder, phases } from "../../config/phases.js";
import { getAnswers, isPhaseUnlocked, phaseProgress } from "./state.js";

const getPhaseUrl = (phaseId) => new URL(`../../phases/${phaseId}.html`, import.meta.url).href;

const buildNavLink = (phaseId, currentPhaseId, mobile = false) => {
  const phase = phases[phaseId];
  const active = phaseId === currentPhaseId;
  const unlocked = isPhaseUnlocked(phaseId);
  const link = document.createElement("a");
  const disabled = !active && !unlocked;
  link.className = `nav-link${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`;
  link.href = disabled ? "#" : getPhaseUrl(phaseId);
  link.setAttribute("aria-current", active ? "page" : "false");
  link.innerHTML = `
    <span>${mobile ? phase.order : `Phase ${phase.order}`}</span>
    <span class="nav-meta">${mobile ? phase.title : unlocked ? "Open" : "Locked"}</span>
  `;
  if (disabled) {
    link.tabIndex = -1;
    link.setAttribute("aria-disabled", "true");
  }
  return link;
};

const buildSummaryLink = (currentPhaseId, mobile = false) => {
  const active = currentPhaseId === "phase6";
  const link = document.createElement("a");
  link.className = `nav-link${active ? " is-active" : ""}`;
  link.href = getPhaseUrl("phase6");
  link.setAttribute("aria-current", active ? "page" : "false");
  link.innerHTML = `
    <span>${mobile ? "Summary" : "Summary"}</span>
    <span class="nav-meta">${mobile ? "" : "Review answers"}</span>
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
      <strong>Nixie Reveal</strong>
      <span>${progress.completed} of ${progress.total} phases completed</span>
    </div>
  `;

  const progressBlock = document.createElement("div");
  progressBlock.className = "sidebar-progress";
  progressBlock.innerHTML = `
    <span class="summary-count">${progress.completed} / ${progress.total}</span>
    <div class="progress-bar"><span style="width: ${progress.percent}%"></span></div>
  `;
  nav.appendChild(progressBlock);

  const title = document.createElement("div");
  title.className = "nav-section-title";
  title.textContent = "Phases";
  nav.appendChild(title);

  phaseOrder.forEach((phaseId) => nav.appendChild(buildNavLink(phaseId, currentPhaseId)));

  const summaryTitle = document.createElement("div");
  summaryTitle.className = "nav-section-title";
  summaryTitle.textContent = "Review";
  nav.appendChild(summaryTitle);
  nav.appendChild(buildSummaryLink(currentPhaseId));

  aside.replaceChildren(nav);
};

const renderBottomNav = (currentPhaseId) => {
  const bottom = document.querySelector('[data-component="nav-mobile"]');
  if (!bottom) return;
  const nav = document.createElement("div");
  nav.className = "mobile-nav";

  phaseOrder.slice(0, 5).forEach((phaseId) => nav.appendChild(buildNavLink(phaseId, currentPhaseId, true)));
  nav.appendChild(buildSummaryLink(currentPhaseId, true));

  bottom.replaceChildren(nav);
};

export const initNav = (currentPhaseId) => {
  renderSidebar(currentPhaseId);
  renderBottomNav(currentPhaseId);
  const answers = getAnswers();
  document.body.dataset.answers = String(Object.keys(answers).length);
};
