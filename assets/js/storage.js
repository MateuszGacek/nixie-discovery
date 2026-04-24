const KEY = "nixie_answers";
const RESUME_KEY = "nixie_resume_phase";

export const getData = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

export const setData = (data) => localStorage.setItem(KEY, JSON.stringify(data));
export const clearData = () => localStorage.removeItem(KEY);
export const STORAGE_KEY = KEY;
export const getResumePhase = () => localStorage.getItem(RESUME_KEY) || "";
export const setResumePhase = (phaseId) => localStorage.setItem(RESUME_KEY, phaseId);
export const clearResumePhase = () => localStorage.removeItem(RESUME_KEY);
