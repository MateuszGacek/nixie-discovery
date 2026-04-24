import { getAnswers, resetState, phaseProgress } from "./state.js";
import { phases, phaseOrder } from "../../config/phases.js";

const getPhaseUrl = (phaseId) => new URL(`../../phases/${phaseId}.html`, import.meta.url).href;

const stringifyValue = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value ?? "").trim();
};

const buildCopyText = () => {
  const answers = getAnswers();
  const lines = ["Nixie Reveal summary", ""];

  phaseOrder.forEach((phaseId) => {
    const phase = phases[phaseId];
    lines.push(phase.title);
    (phase.questions || []).forEach((question) => {
      const value = stringifyValue(answers[question.id]);
      if (value) lines.push(`- ${question.label}: ${value}`);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
};

export const renderSummary = (containerId = "phase-root") => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const answers = getAnswers();
  const shell = document.createElement("section");
  shell.className = "phase-panel fade-in-up";

  const answeredCount = Object.values(answers).filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return String(value ?? "").trim().length > 0;
  }).length;

  const header = document.createElement("header");
  header.className = "summary-header phase-header";
  const progress = phaseProgress("phase6");
  header.innerHTML = `
    <div class="phase-title-row">
      <div>
        <p class="eyebrow">Phase 6</p>
        <h1>Summary</h1>
      </div>
      <div class="progress-pill">
        <span>${progress.completed} of ${progress.total} phases completed</span>
      </div>
    </div>
    <p class="summary-subtitle">This overview is built from localStorage and reflects every saved answer across the earlier phases.</p>
  `;
  shell.appendChild(header);

  const toolbar = document.createElement("div");
  toolbar.className = "summary-toolbar";
  toolbar.innerHTML = `
    <button class="button button-primary" type="button" data-action="copy-summary">Copy to clipboard</button>
    <button class="button button-secondary" type="button" data-action="start-over">Start over</button>
    <a class="button button-secondary" href="${getPhaseUrl("phase1")}">Back to Phase 1</a>
  `;
  shell.appendChild(toolbar);

  const grid = document.createElement("div");
  grid.className = "summary-grid";

  if (!answeredCount) {
    const empty = document.createElement("div");
    empty.className = "summary-empty";
    empty.innerHTML = `
      <h2>No answers yet</h2>
      <p class="summary-subtitle">Start from phase 1 and the summary will populate automatically as answers are saved.</p>
    `;
    grid.appendChild(empty);
  } else {
    phaseOrder.forEach((phaseId) => {
      const phase = phases[phaseId];
      const card = document.createElement("article");
      card.className = "summary-card";
      const items = (phase.questions || [])
        .map((question) => {
          const value = stringifyValue(answers[question.id]);
          if (!value) return "";
          return `
            <div class="summary-item">
              <h3>${question.label}</h3>
              <p>${value}</p>
            </div>
          `;
        })
        .filter(Boolean)
        .join("");

      if (!items) return;

      card.innerHTML = `
        <h2>${phase.title}</h2>
        <div class="summary-collection">${items}</div>
      `;
      grid.appendChild(card);
    });
  }

  shell.appendChild(grid);
  container.replaceChildren(shell);

  shell.querySelector('[data-action="copy-summary"]')?.addEventListener("click", async () => {
    const text = buildCopyText();
    const button = shell.querySelector('[data-action="copy-summary"]');
    if (!button) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      const original = button.textContent;
      button.textContent = "Copy failed";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    }
  });

  shell.querySelector('[data-action="start-over"]')?.addEventListener("click", () => {
    resetState();
    window.location.href = getPhaseUrl("phase1");
  });
};
