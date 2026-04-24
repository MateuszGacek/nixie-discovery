import { phases, phaseOrder } from "../../config/phases.js";

export const initialScores = {
  creative: 0,
  analytical: 0,
  relational: 0,
  educational: 0,
  aesthetic: 0,
  strategic: 0,
  organizational: 0,
  caring: 0,
  leadership: 0,
  communication: 0,
  independent: 0,
  freedom: 0,
  stability: 0,
  visibility: 0,
  businessReadiness: 0,
  impact: 0,
  meaning: 0,
  builder: 0,
  explorer: 0,
};

export const scoreLabels = {
  creative: "tworcza",
  analytical: "analityczna",
  relational: "relacyjna",
  educational: "edukacyjna",
  aesthetic: "estetyczna",
  strategic: "strategiczna",
  organizational: "organizacyjna",
  caring: "wspierajaca",
  leadership: "przywodcza",
  communication: "komunikacyjna",
  independent: "niezalezna",
  freedom: "wolnosc",
  stability: "stabilnosc",
  visibility: "widocznosc",
  businessReadiness: "gotowosc biznesowa",
  impact: "wplyw",
  meaning: "sens",
  builder: "budowanie",
  explorer: "eksploracja",
};

const getOptionValue = (option) => (typeof option === "string" ? option : option.id);

const addTags = (scores, tags = {}) => {
  Object.entries(tags).forEach(([key, value]) => {
    if (!Object.hasOwn(scores, key)) return;
    scores[key] += Number(value) || 0;
  });
};

export const getAllQuestions = () =>
  phaseOrder.flatMap((phaseId) => (phases[phaseId]?.questions || []).map((question) => ({ ...question, phaseId })));

export const getQuestionById = (questionId) => getAllQuestions().find((question) => question.id === questionId);

export const getOptionLabel = (question, value) => {
  const option = (question?.options || []).find((entry) => String(getOptionValue(entry)) === String(value));
  if (!option) return String(value ?? "");
  return typeof option === "string" ? option : option.label;
};

export const formatAnswer = (question, value) => {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.map((entry) => getOptionLabel(question, entry)).join(", ");
  if (typeof value === "boolean") return value ? "Tak" : "Nie";
  if (question?.type === "single" || question?.type === "multi" || question?.type === "radio" || question?.type === "checkbox") {
    return getOptionLabel(question, value);
  }
  return String(value).trim();
};

export const calculateScores = (answers, steps = phases) => {
  const scores = { ...initialScores };

  Object.values(steps).forEach((phase) => {
    (phase.questions || []).forEach((question) => {
      const answer = answers[question.id];
      if (answer === undefined || answer === null || answer === "" || answer === false) return;

      const options = question.options || [];
      if (question.type === "single" || question.type === "radio" || question.type === "select") {
        const selected = options.find((option) => String(getOptionValue(option)) === String(answer));
        if (selected && typeof selected !== "string") addTags(scores, selected.tags);
      }

      if (question.type === "multi" || (question.type === "checkbox" && Array.isArray(answer))) {
        answer.forEach((value) => {
          const selected = options.find((option) => String(getOptionValue(option)) === String(value));
          if (selected && typeof selected !== "string") addTags(scores, selected.tags);
        });
      }
    });
  });

  const freedomStability = Number(answers.freedom_vs_stability || 0);
  if (freedomStability) {
    scores.freedom += Math.max(0, freedomStability - 5);
    scores.stability += Math.max(0, 6 - freedomStability);
  }

  const soloPeople = Number(answers.solo_vs_people || 0);
  if (soloPeople) {
    scores.relational += Math.max(0, soloPeople - 5);
    scores.independent += Math.max(0, 6 - soloPeople);
  }

  const experimentReadiness = Number(answers.experiment_readiness || 0);
  if (experimentReadiness) {
    scores.businessReadiness += Math.max(0, experimentReadiness - 5);
    scores.builder += Math.max(0, experimentReadiness - 6);
  }

  return scores;
};

export const getTopScores = (scores, limit = 5) =>
  Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, value]) => value > 0)
    .slice(0, limit)
    .map(([key, value]) => ({ key, label: scoreLabels[key] || key, value }));
