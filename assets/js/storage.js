const KEY = "nixie_answers";

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
