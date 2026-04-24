import { getAnswers, setAnswer, removeAnswer } from "./state.js";

const STATUS_VISIBLE_MS = 1200;
const SAVE_DELAY_MS = 300;

const debounceMap = new WeakMap();
const escapeSelector = (value) =>
  window.CSS && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : String(value).replace(/["\\]/g, "\\$&");

const getQuestionId = (field) => field?.closest?.("[data-question-id]")?.dataset?.questionId;

const collectFieldValue = (root, questionId) => {
  const fields = [...root.querySelectorAll(`[name="${escapeSelector(questionId)}"]`)];
  if (!fields.length) return "";

  const type = fields[0].type;
  const fieldType = fields[0].closest("[data-field-type]")?.dataset?.fieldType;

  if (fieldType === "radio" || fieldType === "single") {
    const checked = fields.find((field) => field.checked);
    return checked ? checked.value : "";
  }

  if (fieldType === "checkbox" || fieldType === "multi") {
    if (fields.length === 1 && fields[0].value === "true") {
      return fields[0].checked;
    }
    return fields.filter((field) => field.checked).map((field) => field.value);
  }

  if (type === "checkbox") {
    return fields[0].checked;
  }

  return fields[0].value;
};

const applyValueToField = (field, value) => {
  const fieldType = field.closest("[data-field-type]")?.dataset?.fieldType;
  if (fieldType === "radio" || fieldType === "single") {
    field.checked = String(field.value) === String(value);
    return;
  }

  if (fieldType === "checkbox" || fieldType === "multi") {
    if (Array.isArray(value)) {
      field.checked = value.includes(field.value);
    } else {
      field.checked = Boolean(value) && field.value === "true";
    }
    return;
  }

  if (field.tagName === "SELECT" || field.tagName === "TEXTAREA" || field.tagName === "INPUT") {
    field.value = value ?? "";
  }
};

const syncChoiceState = (field) => {
  const card = field.closest("[data-question-id]");
  if (!card) return;
  card.querySelectorAll(".choice-item").forEach((item) => {
    const input = item.querySelector("input");
    item.dataset.selected = input?.checked ? "true" : "false";
  });
};

const setSavedStatus = (root, questionId, visible = true) => {
  const card = root.querySelector(`[data-question-id="${escapeSelector(questionId)}"]`);
  if (!card) return;
  const status = card.querySelector(".field-status");
  if (!status) return;
  status.classList.toggle("is-visible", visible);
  if (visible) {
    window.clearTimeout(status._hideTimer);
    status._hideTimer = window.setTimeout(() => {
      status.classList.remove("is-visible");
    }, STATUS_VISIBLE_MS);
  }
};

const persistQuestion = (root, questionId) => {
  const value = collectFieldValue(root, questionId);
  if (
    value === "" ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  ) {
    removeAnswer(questionId);
  } else {
    setAnswer(questionId, value);
  }
  setSavedStatus(root, questionId, true);
  window.dispatchEvent(new Event("nixie:answers-updated"));
};

const schedulePersist = (root, questionId) => {
  const existing = debounceMap.get(root) || new Map();
  debounceMap.set(root, existing);
  const timer = existing.get(questionId);
  if (timer) window.clearTimeout(timer);
  const next = window.setTimeout(() => persistQuestion(root, questionId), SAVE_DELAY_MS);
  existing.set(questionId, next);
};

const hydrateField = (field, value) => {
  applyValueToField(field, value);
  if (field.tagName === "SELECT") {
    const shell = field.closest(".select-shell");
    if (shell) {
      const trigger = shell.querySelector(".select-trigger");
      const label = shell.querySelector(".select-trigger-label");
      const selected = shell.querySelector(`.select-option[data-value="${escapeSelector(field.value)}"]`);
      shell.querySelectorAll(".select-option").forEach((option) => {
        option.dataset.selected = option.dataset.value === field.value ? "true" : "false";
      });
      if (label) label.textContent = selected?.textContent || "Wybierz opcję";
      if (trigger) trigger.dataset.hasValue = field.value ? "true" : "false";
    }
  }
  const fieldType = field.closest("[data-field-type]")?.dataset?.fieldType;
  if (fieldType === "radio" || fieldType === "single" || fieldType === "checkbox" || fieldType === "multi") {
    syncChoiceState(field);
  }
};

const hydrateRoot = (root) => {
  const answers = getAnswers();
  const questionIds = new Set(
    [...root.querySelectorAll("[data-question-id]")].map((card) => card.dataset.questionId)
  );

  questionIds.forEach((questionId) => {
    const fields = [...root.querySelectorAll(`[name="${escapeSelector(questionId)}"]`)];
    const value = answers[questionId];
    fields.forEach((field) => hydrateField(field, value));
    if (value !== undefined) setSavedStatus(root, questionId, true);
  });
  window.dispatchEvent(new Event("nixie:answers-updated"));
};

const attachListeners = (root) => {
  root.addEventListener("input", (event) => {
    const field = event.target;
    if (!field.name) return;
    const questionId = getQuestionId(field);
    if (!questionId) return;
    schedulePersist(root, questionId);
  });

  root.addEventListener("change", (event) => {
    const field = event.target;
    if (!field.name) return;
    const questionId = getQuestionId(field);
    if (!questionId) return;
    persistQuestion(root, questionId);
  });
};

export const initForm = () => {
  const root = document.getElementById("phase-root");
  if (!root) return;
  hydrateRoot(root);
  attachListeners(root);
};
