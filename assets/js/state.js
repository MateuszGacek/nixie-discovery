import { getData, setData, clearData } from "./storage.js";
import { phases, phaseOrder } from "../../config/phases.js";

const phaseIndex = new Map(phaseOrder.map((phaseId, index) => [phaseId, index]));
const getPhaseSeenKey = (phaseId) => `__phase_seen_${phaseId}`;

const isMeaningful = (value) => {
  if (Array.isArray(value)) return value.some((entry) => String(entry).trim() !== "");
  if (typeof value === "boolean") return value;
  return String(value ?? "").trim().length > 0;
};

const isPhaseSeen = (phaseId) => Boolean(getData()[getPhaseSeenKey(phaseId)]);

const isQuestionRequired = (question) =>
  question.type !== "info" && question.required !== false;

const isQuestionComplete = (question) => {
  if (question.type === "info" || question.generated) return true;
  if (!isQuestionRequired(question)) return true;
  return isMeaningful(getAnswer(question.id));
};

export const getAnswers = () => getData();

export const getAnswer = (questionId) => getData()[questionId];

export const setAnswer = (questionId, value) => {
  const current = getData();
  current[questionId] = value;
  setData(current);
  return current;
};

export const removeAnswer = (questionId) => {
  const current = getData();
  delete current[questionId];
  setData(current);
  return current;
};

export const resetState = () => clearData();

export const markPhaseVisited = (phaseId) => {
  const current = getData();
  const key = getPhaseSeenKey(phaseId);
  if (current[key]) return current;
  current[key] = true;
  setData(current);
  return current;
};

export const getPhaseQuestions = (phaseId) => phases[phaseId]?.questions || [];

export const getPhaseCompletion = (phaseId) => {
  if (isPhaseComplete(phaseId)) return 100;
  const questions = getPhaseQuestions(phaseId).filter((question) => question.type !== "info");
  if (!questions.length) return 0;
  const answered = questions.filter((question) => isMeaningful(getAnswer(question.id))).length;
  return Math.round((answered / questions.length) * 100);
};

export const isPhaseComplete = (phaseId) => {
  const phase = phases[phaseId];
  if (!phase) return false;

  if (phase.generated === "paths") {
    return isPhaseSeen(phaseId) || isMeaningful(getAnswer("selected_path"));
  }

  if (phase.generated && getPhaseQuestions(phaseId).length === 0) {
    return isPhaseSeen(phaseId);
  }

  const questions = getPhaseQuestions(phaseId);
  if (!questions.length) return false;
  return questions.every(isQuestionComplete);
};

export const getCompletedPhaseCount = () =>
  phaseOrder.reduce((count, phaseId) => {
    return count + (isPhaseComplete(phaseId) ? 1 : 0);
  }, 0);

export const isJourneyComplete = () => {
  const allQuestions = phaseOrder.flatMap((phaseId) => getPhaseQuestions(phaseId).filter((question) => question.type !== "info"));
  const totalQuestions = allQuestions.length;
  if (!totalQuestions) return false;
  const answeredQuestions = allQuestions.filter((question) => isMeaningful(getAnswer(question.id))).length;
  return answeredQuestions >= totalQuestions;
};

export const isPhaseUnlocked = (phaseId) => {
  if (phaseId === phaseOrder[0]) return true;
  const index = phaseIndex.get(phaseId);
  if (index === undefined) return false;
  const previousId = phaseOrder[index - 1];
  return isPhaseComplete(previousId);
};

export const getNextPhaseId = (phaseId) => {
  const index = phaseIndex.get(phaseId);
  if (index === undefined) return phaseOrder[0];
  return phaseOrder[Math.min(index + 1, phaseOrder.length - 1)];
};

export const getPhaseLabel = (phaseId) => phases[phaseId]?.title || phaseId;

export const phaseProgress = (currentPhaseId = "") => {
  const total = phaseOrder.length;
  const completed = getCompletedPhaseCount();
  const allQuestions = phaseOrder.flatMap((phaseId) => getPhaseQuestions(phaseId).filter((question) => question.type !== "info"));
  const totalQuestions = allQuestions.length;
  const answeredQuestions = allQuestions.filter((question) => isMeaningful(getAnswer(question.id))).length;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    questionPercent: Math.round((answeredQuestions / Math.max(totalQuestions, 1)) * 100),
  };
};
