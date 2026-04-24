import { getAnswer, getAnswers, phaseProgress } from "./state.js";
import {
  buildProfile,
  downloadText,
  generateExperimentHtml,
  generateHumanReport,
  generateLLMPrompt,
  generatePathsHtml,
  generateProfileHtml,
} from "./report.js";
import { phaseOrder } from "../../config/phases.js";

const escapeText = (value) => String(value ?? "");
const getOptionValue = (option) => (typeof option === "string" ? option : option.id);
const getOptionLabel = (option) => (typeof option === "string" ? option : option.label);
const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  return String(value ?? "").trim().length > 0;
};
const isQuestionRequired = (question) => question.type !== "info" && question.required !== false;

const copyIconSvg = `
  <svg aria-hidden="true" viewBox="0 0 24 24" class="copy-icon">
    <path fill="currentColor" d="M14.5 2.5a1 1 0 0 1 0 2H8.75A2.75 2.75 0 0 0 6 7.25V15a1 1 0 1 1-2 0V7.25A4.75 4.75 0 0 1 8.75 2.5H14.5Z"/>
    <path fill="currentColor" d="M15.25 5a2.75 2.75 0 0 1 2.75 2.75V18a2.75 2.75 0 0 1-2.75 2.75H6.75A2.75 2.75 0 0 1 4 18V7.75A2.75 2.75 0 0 1 6.75 5h8.5Zm0 2H6.75A.75.75 0 0 0 6 7.75V18a.75.75 0 0 0 .75.75h8.5A.75.75 0 0 0 16 18V7.75A.75.75 0 0 0 15.25 7Z"/>
  </svg>
`;

const getPhaseUrl = (phaseId) => new URL(`../../phases/${phaseId}.html`, import.meta.url).href;
const getSummaryUrl = () => new URL("../../summary.html", import.meta.url).href;

const getClipboardText = (question) => {
  const answer = getAnswer(question.id);
  const parts = [
    `FRAZA: ${question.title || question.label}`,
    question.description || question.helpText ? `PODPOWIEDZ: ${question.description || question.helpText}` : null,
    Array.isArray(answer)
      ? `ODPOWIEDZ: ${answer.join(", ")}`
      : typeof answer === "boolean"
        ? `ODPOWIEDZ: ${answer ? "Tak" : "Nie"}`
        : answer
          ? `ODPOWIEDZ: ${answer}`
          : "ODPOWIEDZ: brak",
  ].filter(Boolean);

  return parts.join("\n");
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

const optionMarkup = (question, type) => {
  const options = Array.isArray(question.options) ? question.options : [];
  if (!options.length) {
    return type === "select" ? `<option value="">Wybierz opcje</option>` : "";
  }
  const items = options
    .map((option) => `<option value="${escapeText(getOptionValue(option))}">${escapeText(getOptionLabel(option))}</option>`)
    .join("");
  return type === "select" ? `<option value="">Wybierz opcje</option>${items}` : items;
};

const syncChoiceState = (choiceRoot) => {
  choiceRoot.querySelectorAll(".choice-item").forEach((item) => {
    const input = item.querySelector("input");
    item.dataset.selected = input?.checked ? "true" : "false";
  });
};

const showCopyHint = (wrapper) => {
  const existing = wrapper.querySelector(".copy-hint");
  if (existing) existing.remove();

  const hint = document.createElement("div");
  hint.className = "copy-hint";
  hint.textContent = "Skopiowane";
  wrapper.appendChild(hint);
  window.clearTimeout(hint._hideTimer);
  hint._hideTimer = window.setTimeout(() => {
    hint.classList.add("is-hidden");
    window.setTimeout(() => hint.remove(), 180);
  }, 900);
};

const isAnsweredInDom = (shell, question) => {
  const fields = [...shell.querySelectorAll(`[name="${question.id}"]`)];
  if (!fields.length) return hasValue(getAnswer(question.id));
  if (question.type === "single" || question.type === "radio") return fields.some((field) => field.checked);
  if (question.type === "multi") return fields.some((field) => field.checked);
  if (question.type === "checkbox") return fields.some((field) => field.checked);
  return fields.some((field) => hasValue(field.value));
};

const renderGeneratedSection = (kind) => {
  const profile = buildProfile(getAnswers());
  const section = document.createElement("div");
  section.className = "generated-section";

  if (kind === "profile") {
    section.innerHTML = generateProfileHtml(profile);
  } else if (kind === "paths") {
    section.innerHTML = generatePathsHtml(profile);
  } else if (kind === "experiment") {
    section.innerHTML = generateExperimentHtml(profile);
  } else if (kind === "final") {
    const report = generateHumanReport(profile);
    const prompt = generateLLMPrompt(profile);
    section.innerHTML = `
      <article class="summary-card final-card">
        <h2>Raport dla Ciebie</h2>
        <pre class="report-box">${escapeText(report)}</pre>
      </article>
      <article class="summary-card final-card">
        <h2>Gotowy prompt do LLM</h2>
        <p class="soft-warning">Twoje odpowiedzi zostaja lokalnie. Sama decydujesz, czy skopiowac prompt i wkleic go do LLM.</p>
        <textarea class="field-control prompt-output" readonly>${escapeText(prompt)}</textarea>
        <div class="summary-toolbar">
          <button class="button button-primary" type="button" data-final-action="copy-prompt">Kopiuj prompt do LLM</button>
          <button class="button button-secondary" type="button" data-final-action="download-txt">Pobierz raport .txt</button>
          <button class="button button-secondary" type="button" data-final-action="download-json">Pobierz dane .json</button>
        </div>
      </article>
    `;

    section.querySelector('[data-final-action="copy-prompt"]')?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      try {
        await copyToClipboard(prompt);
        const original = button.textContent;
        button.textContent = "Skopiowano";
        window.setTimeout(() => {
          button.textContent = original;
        }, 1200);
      } catch {
        button.textContent = "Nie udalo sie skopiowac";
      }
    });

    section.querySelector('[data-final-action="download-txt"]')?.addEventListener("click", () => {
      downloadText("moja-sciezka-raport.txt", report);
    });

    section.querySelector('[data-final-action="download-json"]')?.addEventListener("click", () => {
      downloadText("moja-sciezka-dane.json", JSON.stringify(profile, null, 2), "application/json");
    });
  }

  return section;
};

const createQuestionHeader = (question, wrapper, controlId) => {
  const header = document.createElement(question.type === "info" ? "div" : "div");
  header.className = "field-label";

  const labelText = escapeText(question.title || question.label);
  const statusText =
    question.type === "info" ? "" : isQuestionRequired(question) ? "<small>Wymagane</small>" : "<small>Opcjonalne</small>";

  if (question.type === "radio" || question.type === "single" || question.type === "checkbox" || question.type === "multi") {
    header.innerHTML = `<span>${labelText}</span>${statusText}`;
    wrapper.appendChild(header);
    return null;
  }

  const label = document.createElement("label");
  label.className = "field-label-text";
  label.htmlFor = controlId;
  label.textContent = labelText;
  header.appendChild(label);

  if (statusText) {
    const meta = document.createElement("small");
    meta.textContent = isQuestionRequired(question) ? "Wymagane" : "Opcjonalne";
    header.appendChild(meta);
  }

  wrapper.appendChild(header);
  return label;
};

const createHelpText = (question, wrapper, helpId) => {
  if (!question.description && !question.helpText) return null;
  const help = document.createElement("p");
  help.className = "field-help";
  help.id = helpId;
  help.textContent = question.description || question.helpText;
  wrapper.appendChild(help);
  return help;
};

const createCopyButton = (question, wrapper) => {
  if (question.type === "info") return;
  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "copy-button";
  copyButton.innerHTML = copyIconSvg;
  copyButton.title = "Skopiuj fraze do schowka";
  copyButton.setAttribute("aria-label", `Skopiuj fraze: ${question.title || question.label}`);
  copyButton.addEventListener("click", async () => {
    try {
      await copyToClipboard(getClipboardText(question));
      copyButton.classList.add("is-copied");
      showCopyHint(wrapper);
      window.setTimeout(() => {
        copyButton.classList.remove("is-copied");
      }, 1100);
    } catch {
      copyButton.classList.add("is-copied");
      showCopyHint(wrapper);
      window.setTimeout(() => {
        copyButton.classList.remove("is-copied");
      }, 1100);
    }
  });
  wrapper.appendChild(copyButton);
};

export const renderQuestion = (question) => {
  const profile = buildProfile(getAnswers());
  if (question.dynamicOptions === "suggestedPaths") {
    question = {
      ...question,
      options: profile.suggestedPaths.slice(0, 5).map((path) => ({
        id: path.id,
        label: `${path.name} (${path.matchScore})`,
      })),
    };
  }

  const wrapper = document.createElement("article");
  wrapper.className = `question-card fade-in-up${question.type === "info" ? " info-card" : ""}`;
  wrapper.dataset.questionId = question.id;
  wrapper.dataset.fieldType = question.type;

  const controlId = `${question.id}-control`;
  const helpId = `${question.id}-help`;

  createQuestionHeader(question, wrapper, controlId);
  createCopyButton(question, wrapper);
  createHelpText(question, wrapper, helpId);

  let control = null;

  if (question.type === "info") {
    control = document.createElement("div");
    control.className = "info-note";
  } else if (question.type === "text") {
    control = document.createElement("input");
    control.type = "text";
    control.id = controlId;
    control.className = "field-control";
    control.name = question.id;
    control.placeholder = question.placeholder || "";
    if (question.description || question.helpText) control.setAttribute("aria-describedby", helpId);
  } else if (question.type === "textarea") {
    control = document.createElement("textarea");
    control.id = controlId;
    control.className = "field-control";
    control.name = question.id;
    control.placeholder = question.placeholder || "";
    if (question.description || question.helpText) control.setAttribute("aria-describedby", helpId);
  } else if (question.type === "select") {
    control = document.createElement("select");
    control.id = controlId;
    control.className = "field-control";
    control.name = question.id;
    control.innerHTML = optionMarkup(question, "select");
    if (question.description || question.helpText) control.setAttribute("aria-describedby", helpId);
  } else if (question.type === "rating") {
    control = document.createElement("div");
    control.className = "rating-control";
    control.innerHTML = `
      <input class="field-control rating-range" id="${controlId}" type="range" name="${escapeText(question.id)}" min="${question.min || 1}" max="${question.max || 10}" step="1" value="${getAnswer(question.id) || question.min || 1}" />
      <div class="rating-scale" aria-hidden="true"><span>${question.min || 1}</span><strong data-rating-value>${getAnswer(question.id) || question.min || 1}</strong><span>${question.max || 10}</span></div>
    `;
    if (question.description || question.helpText) {
      control.querySelector("input")?.setAttribute("aria-describedby", helpId);
    }
    const range = control.querySelector("input");
    const value = control.querySelector("[data-rating-value]");
    range?.addEventListener("input", () => {
      if (value) value.textContent = range.value;
    });
  } else if (question.type === "radio" || question.type === "single") {
    control = document.createElement("fieldset");
    control.className = "choice-fieldset";
    if (question.description || question.helpText) control.setAttribute("aria-describedby", helpId);

    const legend = document.createElement("legend");
    legend.className = "sr-only";
    legend.textContent = question.title || question.label;
    control.appendChild(legend);

    const group = document.createElement("div");
    group.className = "choice-group";

    (question.options || []).forEach((option) => {
      const row = document.createElement("label");
      row.className = "choice-item";
      row.innerHTML = `
        <input id="${escapeText(question.id)}-${escapeText(getOptionValue(option))}" type="radio" name="${escapeText(question.id)}" value="${escapeText(getOptionValue(option))}" />
        <span>${escapeText(getOptionLabel(option))}</span>
      `;
      row.dataset.selected = "false";
      row.querySelector("input")?.addEventListener("change", () => syncChoiceState(group));
      group.appendChild(row);
    });

    control.appendChild(group);
  } else if (question.type === "checkbox" || question.type === "multi") {
    const options = question.options || [];
    if (question.type === "multi" || options.length > 1) {
      control = document.createElement("fieldset");
      control.className = "choice-fieldset";
      if (question.description || question.helpText) control.setAttribute("aria-describedby", helpId);

      const legend = document.createElement("legend");
      legend.className = "sr-only";
      legend.textContent = question.title || question.label;
      control.appendChild(legend);

      const group = document.createElement("div");
      group.className = "choice-group";

      options.forEach((option) => {
        const row = document.createElement("label");
        row.className = "choice-item";
        row.innerHTML = `
          <input id="${escapeText(question.id)}-${escapeText(getOptionValue(option))}" type="checkbox" name="${escapeText(question.id)}" value="${escapeText(getOptionValue(option))}" />
          <span>${escapeText(getOptionLabel(option))}</span>
        `;
        row.dataset.selected = "false";
        row.querySelector("input")?.addEventListener("change", () => syncChoiceState(group));
        group.appendChild(row);
      });

      control.appendChild(group);
    } else {
      control = document.createElement("div");
      control.className = "choice-group";
      const row = document.createElement("label");
      row.className = "choice-item";
      row.innerHTML = `
        <input id="${controlId}" type="checkbox" name="${escapeText(question.id)}" value="true" />
        <span>${escapeText(question.checkboxLabel || "Yes, this applies")}</span>
      `;
      row.dataset.selected = "false";
      row.querySelector("input")?.addEventListener("change", () => {
        row.dataset.selected = row.querySelector("input")?.checked ? "true" : "false";
      });
      control.appendChild(row);
    }
  } else {
    control = document.createElement("input");
    control.type = "text";
    control.id = controlId;
    control.className = "field-control";
    control.name = question.id;
  }

  wrapper.appendChild(control);

  if (question.type === "info") {
    return wrapper;
  }

  const status = document.createElement("div");
  status.className = "field-status";
  status.textContent = "Zapisano";
  status.setAttribute("aria-live", "polite");
  status.setAttribute("role", "status");
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
      <span>${progress.completed} z ${progress.total} etapow gotowe</span>
    </div>
  `;

  const subtitle = document.createElement("p");
  subtitle.className = "phase-subtitle";
  subtitle.textContent = phaseData.subtitle || "";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.innerHTML = `<span data-phase-progress-bar style="width: ${progress.questionPercent}%"></span>`;

  header.appendChild(titleRow);
  header.appendChild(subtitle);
  header.appendChild(progressBar);

  shell.appendChild(header);

  if (phaseData.generated) {
    shell.appendChild(renderGeneratedSection(phaseData.generated));
  }

  const list = document.createElement("div");
  list.className = "phase-grid question-list";

  (phaseData.questions || []).forEach((question) => {
    list.appendChild(renderQuestion(question));
  });

  if ((!phaseData.questions || phaseData.questions.length === 0) && !phaseData.generated) {
    const empty = document.createElement("div");
    empty.className = "summary-empty";
    empty.innerHTML = `
      <h2>Nie ma tu pol do wypelnienia</h2>
      <p class="summary-subtitle">Ten etap zbiera zapisane odpowiedzi z wczesniejszych krokow.</p>
    `;
    list.appendChild(empty);
  }

  shell.appendChild(list);

  const currentIndex = phaseOrder.indexOf(phaseId);
  const previousId = phaseOrder[currentIndex - 1];
  const nextId = phaseOrder[currentIndex + 1];
  const actions = document.createElement("nav");
  actions.className = "phase-actions";
  actions.innerHTML = `
    ${previousId ? `<a class="button button-secondary" href="${getPhaseUrl(previousId)}">Wstecz</a>` : `<a class="button button-secondary" href="${getSummaryUrl()}">Podsumowanie</a>`}
    ${
      nextId
        ? `<a class="button button-primary" data-next-phase href="${getPhaseUrl(nextId)}">Dalej</a>`
        : `<a class="button button-primary" data-next-phase href="${getSummaryUrl()}">Zobacz podsumowanie</a>`
    }
  `;
  actions.querySelector("[data-next-phase]")?.addEventListener("click", (event) => {
    const missing = (phaseData.questions || []).filter((question) => isQuestionRequired(question) && !isAnsweredInDom(shell, question));
    if (!missing.length) return;
    event.preventDefault();
    const first = shell.querySelector(`[data-question-id="${missing[0].id}"]`);
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    first?.classList.add("is-required-missing");
    window.setTimeout(() => first?.classList.remove("is-required-missing"), 1200);
  });
  shell.appendChild(actions);

  container.replaceChildren(shell);
  document.body.dataset.phase = phaseId || "";
  return shell;
};
