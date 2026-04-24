import { phaseProgress } from "./state.js";

const escapeText = (value) => String(value ?? "");

const optionMarkup = (question, type) => {
  const options = Array.isArray(question.options) ? question.options : [];
  if (!options.length) {
    return `<option value="">Select one</option>`;
  }
  const items = options
    .map((option) => `<option value="${escapeText(option)}">${escapeText(option)}</option>`)
    .join("");
  return type === "select" ? `<option value="">Select one</option>${items}` : items;
};

export const renderQuestion = (question) => {
  const wrapper = document.createElement("article");
  wrapper.className = "question-card fade-in-up";
  wrapper.dataset.questionId = question.id;
  wrapper.dataset.fieldType = question.type;

  const label = document.createElement("div");
  label.className = "field-label";
  label.innerHTML = `<span>${escapeText(question.label)}</span>${
    question.required ? "<small>Required</small>" : "<small>Optional</small>"
  }`;

  wrapper.appendChild(label);

  if (question.helpText) {
    const help = document.createElement("p");
    help.className = "field-help";
    help.textContent = question.helpText;
    wrapper.appendChild(help);
  }

  let control = null;

  if (question.type === "text") {
    control = document.createElement("input");
    control.type = "text";
    control.className = "field-control";
    control.name = question.id;
    control.placeholder = question.placeholder || "";
  } else if (question.type === "textarea") {
    control = document.createElement("textarea");
    control.className = "field-control";
    control.name = question.id;
    control.placeholder = question.placeholder || "";
  } else if (question.type === "select") {
    control = document.createElement("select");
    control.className = "field-control";
    control.name = question.id;
    control.innerHTML = optionMarkup(question, "select");
  } else if (question.type === "radio") {
    const group = document.createElement("div");
    group.className = "choice-group";
    (question.options || []).forEach((option, index) => {
      const row = document.createElement("label");
      row.className = "choice-item";
      row.innerHTML = `
        <input type="radio" name="${escapeText(question.id)}" value="${escapeText(option)}" />
        <span>${escapeText(option)}</span>
      `;
      group.appendChild(row);
      if (index === 0) row.dataset.first = "true";
    });
    control = group;
  } else if (question.type === "checkbox") {
    const options = question.options || [];
    if (options.length > 1) {
      const group = document.createElement("div");
      group.className = "choice-group";
      options.forEach((option) => {
        const row = document.createElement("label");
        row.className = "choice-item";
        row.innerHTML = `
          <input type="checkbox" name="${escapeText(question.id)}" value="${escapeText(option)}" />
          <span>${escapeText(option)}</span>
        `;
        group.appendChild(row);
      });
      control = group;
    } else {
      control = document.createElement("label");
      control.className = "choice-item";
      control.innerHTML = `
        <input type="checkbox" name="${escapeText(question.id)}" value="true" />
        <span>${escapeText(question.checkboxLabel || "Yes, this applies")}</span>
      `;
    }
  } else {
    control = document.createElement("input");
    control.type = "text";
    control.className = "field-control";
    control.name = question.id;
  }

  wrapper.appendChild(control);

  const status = document.createElement("div");
  status.className = "field-status";
  status.textContent = "Saved";
  wrapper.appendChild(status);

  return wrapper;
};

export const renderPhase = (phaseData, containerId = "phase-root", phaseId = "") => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const shell = document.createElement("section");
  shell.className = "phase-panel fade-in-up";

  const header = document.createElement("header");
  header.className = "phase-header";

  const progress = phaseProgress(phaseId);
  const titleRow = document.createElement("div");
  titleRow.className = "phase-title-row";
  titleRow.innerHTML = `
    <div>
      <p class="eyebrow">${escapeText(phaseData.eyebrow || `Phase ${phaseData.order || ""}`)}</p>
      <h1>${escapeText(phaseData.title || "")}</h1>
    </div>
    <div class="progress-pill">
      <span>${progress.completed} of ${progress.total} phases completed</span>
    </div>
  `;

  const subtitle = document.createElement("p");
  subtitle.className = "phase-subtitle";
  subtitle.textContent = phaseData.subtitle || "";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.innerHTML = `<span style="width: ${progress.percent}%"></span>`;

  header.appendChild(titleRow);
  header.appendChild(subtitle);
  header.appendChild(progressBar);

  shell.appendChild(header);

  const list = document.createElement("div");
  list.className = "phase-grid question-list";

  (phaseData.questions || []).forEach((question) => {
    list.appendChild(renderQuestion(question));
  });

  if (!phaseData.questions || phaseData.questions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "summary-empty";
    empty.innerHTML = `
      <h2>Nothing to fill in here.</h2>
      <p class="summary-subtitle">This phase uses the summary module to collect saved answers from the earlier phases.</p>
    `;
    list.appendChild(empty);
  }

  shell.appendChild(list);

  const actions = document.createElement("div");
  actions.className = "phase-actions";
  actions.innerHTML = `
    <a class="button button-secondary" href="${new URL("../../phases/phase1.html", import.meta.url).href}">Restart</a>
    <a class="button button-primary" href="${new URL("../../phases/phase6.html", import.meta.url).href}">Go to Summary</a>
  `;
  shell.appendChild(actions);

  container.replaceChildren(shell);
  document.body.dataset.phase = phaseId || "";
  return shell;
};
