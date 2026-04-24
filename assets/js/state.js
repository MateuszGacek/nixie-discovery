import { getData, setData, clearData } from "./storage.js";
import { phases, phaseOrder } from "../../config/phases.js";

const phaseIndex = new Map(phaseOrder.map((phaseId, index) => [phaseId, index]));

const isMeaningful = (value) => {
  if (Array.isArray(value)) return value.some((entry) => String(entry).trim() !== "");
  if (typeof value === "boolean") return value;
  return String(value ?? "").trim().length > 0;
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

export const getPhaseQuestions = (phaseId) => phases[phaseId]?.questions || [];

export const getCompletedPhaseCount = () =>
  phaseOrder.reduce((count, phaseId) => {
    const questions = getPhaseQuestions(phaseId);
    const answered = questions.some((question) => isMeaningful(getAnswer(question.id)));
    return count + (answered ? 1 : 0);
  }, 0);

export const isPhaseUnlocked = (phaseId) => {
  if (phaseId === phaseOrder[0]) return true;
  const index = phaseIndex.get(phaseId);
  if (index === undefined) return false;
  const previousId = phaseOrder[index - 1];
  const previousQuestions = getPhaseQuestions(previousId);
  return previousQuestions.some((question) => isMeaningful(getAnswer(question.id)));
};

export const getNextPhaseId = (phaseId) => {
  const index = phaseIndex.get(phaseId);
  if (index === undefined) return phaseOrder[0];
  return phaseOrder[Math.min(index + 1, phaseOrder.length - 1)];
};

export const getPhaseLabel = (phaseId) => phases[phaseId]?.title || phaseId;

export const phaseProgress = (currentPhaseId = "") => {
  const total = phaseOrder.length;
  const completed = getCompletedPhaseCount() + (currentPhaseId === "phase6" ? 1 : 0);
  return { completed, total, percent: Math.round((completed / total) * 100) };
};
