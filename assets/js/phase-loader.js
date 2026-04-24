import { phases } from "../../config/phases.js";
import { renderPhase } from "./ui.js";
import { initForm } from "./form.js";
import { initNav } from "./navigation.js";
import { renderSummary } from "./summary.js";

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
  document.title = phaseId === "phase6" ? "Summary | Nixie Reveal" : `${phaseData.title} | Nixie Reveal`;
}

if (phaseId === "phase6") {
  renderSummary("phase-root");
} else if (phaseData) {
  renderPhase(phaseData, "phase-root", phaseId);
  initForm();
}

initNav(phaseId);
