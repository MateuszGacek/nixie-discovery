import { initNav } from "./navigation.js";
import { renderSummary } from "./summary.js";

if (typeof document !== "undefined") {
  document.title = "Podsumowanie | Nixie Discovery";
  renderSummary("phase-root");
  initNav("summary");
}
