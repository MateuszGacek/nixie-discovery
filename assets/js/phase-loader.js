import { phases } from "../../config/phases.js";
import { renderPhase } from "./ui.js";
import { initForm } from "./form.js";
import { initNav } from "./navigation.js";
import { isPhaseComplete, isPhaseUnlocked, markPhaseVisited } from "./state.js";
import { phaseOrder } from "../../config/phases.js";

const derivePhaseId = () => {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "phase1.html";
  return last.replace(".html", "") || "phase1";
};

const phaseId = derivePhaseId();
const phaseData = phases[phaseId];

if (!phaseData) {
  console.error("Unknown phase:", phaseId);
} else {
  document.title = `${phaseData.title} | Nixie Discovery`;
}

const canRenderPhase = !phaseData || isPhaseUnlocked(phaseId);

if (phaseData && !canRenderPhase) {
  const fallbackId = phaseOrder.find((id) => !isPhaseComplete(id)) || phaseOrder[0];
  window.location.replace(new URL(`../../phases/${fallbackId}.html`, import.meta.url).href);
}

if (phaseData && canRenderPhase) {
  renderPhase(phaseData, "phase-root", phaseId);
  markPhaseVisited(phaseId);
  initForm();
}

if (canRenderPhase) initNav(phaseId);

if (phaseData?.generated === "experiment" && canRenderPhase) {
  const getSelectedPath = () => {
    try {
      return JSON.parse(window.localStorage.getItem("nixie_answers") || "{}").selected_path || "";
    } catch {
      return "";
    }
  };
  let lastSelectedPath = getSelectedPath();
  window.addEventListener("nixie:answers-updated", () => {
    const selected = getSelectedPath();
    if (selected === lastSelectedPath) return;
    lastSelectedPath = selected;
    renderPhase(phaseData, "phase-root", phaseId);
    initForm();
  });
}
