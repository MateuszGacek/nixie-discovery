import { getAnswers, resetState, phaseProgress, isJourneyComplete, getResumePhaseId } from "./state.js";
import { phases, phaseOrder } from "../../config/phases.js";
import { buildProfile, downloadText, generateFinalReportHtml, generateHumanReport, generateLLMTabHtml, generateLLMPrompt } from "./report.js";
import { formatAnswer } from "./scoring.js";

const getPhaseUrl = (phaseId) => new URL(`../../phases/${phaseId}.html`, import.meta.url).href;

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

const getAnsweredEntries = (answers) =>
  phaseOrder.flatMap((phaseId) =>
    (phases[phaseId]?.questions || [])
      .map((question) => ({
        phaseId,
        phaseTitle: phases[phaseId]?.title,
        title: question.title || question.label,
        value: formatAnswer(question, answers[question.id]),
      }))
      .filter((entry) => entry.value)
  );

const findNextPhaseId = (answers) =>
  getResumePhaseId() ||
  phaseOrder.find((phaseId) => {
    const phase = phases[phaseId];
    return (phase.questions || []).some((question) => {
      if (question.type === "info") return false;
      return !formatAnswer(question, answers[question.id]);
    });
  }) ||
  phaseOrder[0];

const bindFinalTabs = (root, profile) => {
  const report = generateHumanReport(profile);
  const prompt = generateLLMPrompt(profile);

  root.querySelectorAll("[data-final-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.finalTab;
      root.querySelectorAll("[data-final-tab]").forEach((item) => {
        item.dataset.active = item.dataset.finalTab === tab ? "true" : "false";
      });
      root.querySelectorAll("[data-final-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.finalPanel !== tab;
      });
    });
  });

  root.querySelectorAll('[data-action="copy-prompt"]').forEach((button) => {
    button.addEventListener("click", async (event) => {
      const currentButton = event.currentTarget;
      const original = currentButton.textContent;
      try {
        await copyToClipboard(prompt);
        currentButton.textContent = "Skopiowano";
      } catch {
        currentButton.textContent = "Nie udalo sie skopiowac";
      }
      window.setTimeout(() => {
        currentButton.textContent = original;
      }, 1200);
    });
  });

  root.querySelectorAll('[data-action="download-txt"]').forEach((button) => {
    button.addEventListener("click", () => {
      downloadText("moja-sciezka-raport.txt", report);
    });
  });

  root.querySelectorAll('[data-action="download-json"]').forEach((button) => {
    button.addEventListener("click", () => {
      downloadText("moja-sciezka-dane.json", JSON.stringify(profile, null, 2), "application/json");
    });
  });
};

export const renderSummary = (containerId = "phase-root") => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const answers = getAnswers();
  const profile = buildProfile(answers);
  const progress = phaseProgress("summary");
  const answeredEntries = getAnsweredEntries(answers);
  const isEmpty = answeredEntries.length === 0;
  const isComplete = isJourneyComplete();
  const nextPhaseId = findNextPhaseId(answers);
  const heroTargetId = isComplete ? "final_report" : nextPhaseId;
  const recentAnswers = answeredEntries.slice(-4).reverse();

  const shell = document.createElement("section");
  shell.className = "phase-panel summary-screen fade-in-up";
  shell.innerHTML = `
    <header class="summary-header phase-header">
      <div class="phase-title-row">
        <div>
          <p class="eyebrow">Podsumowanie</p>
          <h1>Moja Sciezka</h1>
        </div>
        <div class="progress-pill">
          <span>${progress.completed} z ${progress.total} etapow gotowe</span>
        </div>
      </div>
      <p class="summary-subtitle">To miejsce pozwala Ci spokojnie wrocic do procesu, zobaczyc, co juz sie wybijalo, i dopiero potem wejsc w poglebienie.</p>
    </header>
  `;

  const hero = document.createElement("section");
  hero.className = "summary-hero-card";
  hero.innerHTML = `
    <div class="summary-hero-copy">
      <span class="summary-kicker">${isEmpty ? "Start" : isComplete ? "Raport gotowy" : "W trakcie"}</span>
      <h2>${isEmpty ? "Zacznij od pierwszego etapu" : isComplete ? "Masz gotowy material do dalszej analizy" : "Kontynuuj od miejsca, w ktorym skonczylas"}</h2>
      <p>${isEmpty
        ? "Aplikacja najlepiej dziala jako spokojny proces krok po kroku. Zacznij od onboardingu, a podsumowanie zbuduje sie samo."
        : isComplete
          ? "Masz juz wartosc z samej aplikacji. Prompt do LLM jest dodatkiem, nie koniecznoscia."
          : "Najpierw domknij kolejne etapy i checkpointy, a finalny raport stanie sie czytelniejszy i lzejszy."}</p>
    </div>
    <div class="summary-hero-actions">
      <a class="button button-primary" href="${getPhaseUrl(heroTargetId)}">${isEmpty ? "Rozpocznij proces" : isComplete ? "Przejdz do finalu" : "Kontynuuj proces"}</a>
      <button class="button button-secondary" type="button" data-action="copy-prompt" ${isEmpty ? "disabled aria-disabled=\"true\"" : ""}>Kopiuj prompt</button>
      <button class="button button-secondary" type="button" data-action="download-json" ${isEmpty ? "disabled aria-disabled=\"true\"" : ""}>Pobierz .json</button>
      <button class="button button-danger" type="button" data-action="start-over">Wyczysc dane</button>
    </div>
  `;
  shell.appendChild(hero);

  const grid = document.createElement("div");
  grid.className = "summary-grid";

  const progressCard = document.createElement("article");
  progressCard.className = "summary-card summary-progress-card";
  progressCard.innerHTML = `
    <h2>Stan procesu</h2>
    <div class="summary-stats">
      <div><strong>${progress.completed}</strong><span>etapow gotowych</span></div>
      <div><strong>${answeredEntries.length}</strong><span>odpowiedzi zapisanych</span></div>
      <div><strong>${Math.round(progress.questionPercent)}%</strong><span>wypelnienia</span></div>
    </div>
    <div class="progress-bar"><span style="width:${progress.questionPercent}%"></span></div>
  `;
  grid.appendChild(progressCard);

  const recentCard = document.createElement("article");
  recentCard.className = "summary-card summary-recent-card";
  recentCard.innerHTML = `
    <h2>Ostatnie odpowiedzi</h2>
    ${
      recentAnswers.length
        ? `<div class="summary-collection">${recentAnswers
            .map(
              (entry) => `
                <div class="summary-item">
                  <h3>${entry.title}</h3>
                  <p>${entry.value}</p>
                  <small>${entry.phaseTitle}</small>
                </div>
              `
            )
            .join("")}</div>`
        : '<p class="summary-empty-copy">Tutaj pojawia sie najnowsze odpowiedzi po rozpoczeciu procesu.</p>'
    }
  `;
  grid.appendChild(recentCard);

  if (isEmpty) {
    const emptyCard = document.createElement("article");
    emptyCard.className = "summary-card summary-empty-state";
    emptyCard.innerHTML = `
      <h2>Najpierw dane, potem analiza</h2>
      <p>Nie pokazujemy jeszcze wygenerowanych sciezek ani dlugiego raportu, bo bez odpowiedzi bylyby tylko pustym szkicem.</p>
      <a class="button button-primary" href="${getPhaseUrl(phaseOrder[0])}">Przejdz do onboardingu</a>
    `;
    grid.appendChild(emptyCard);
  } else if (!isComplete) {
    const nextCard = document.createElement("article");
    nextCard.className = "summary-card summary-empty-state";
    nextCard.innerHTML = `
      <h2>Co dalej?</h2>
      <p>Najwieksza wartosc pojawi sie dopiero po przejsciu kolejnych etapow. Teraz widzisz progres i ostatnie odpowiedzi, ale jeszcze nie finalny raport.</p>
      <a class="button button-primary" href="${getPhaseUrl(nextPhaseId)}">Przejdz do ${phases[nextPhaseId]?.title || "kolejnego etapu"}</a>
    `;
    grid.appendChild(nextCard);
  } else {
    const finalCard = document.createElement("article");
    finalCard.className = "final-tabs-shell";
    finalCard.innerHTML = `
      <div class="card-header">
        <div>
          <p class="card-kicker">Final</p>
          <h2>Twoj wynik i poglebienie</h2>
        </div>
      </div>
      <div class="final-tabs" role="tablist" aria-label="Widoki finalne">
        <button type="button" class="final-tab-button" role="tab" data-final-tab="report" data-active="true">Twoj wynik z aplikacji</button>
        <button type="button" class="final-tab-button" role="tab" data-final-tab="llm" data-active="false">Pogleb z LLM</button>
      </div>
      <div class="final-tab-panel" data-final-panel="report">
        ${generateFinalReportHtml(profile)}
      </div>
      <div class="final-tab-panel" data-final-panel="llm" hidden>
        ${generateLLMTabHtml(profile)}
      </div>
      <div class="summary-toolbar final-toolbar">
        <button class="button button-primary" type="button" data-action="copy-prompt">Kopiuj prompt do LLM</button>
        <button class="button button-secondary" type="button" data-action="download-txt">Pobierz raport .txt</button>
        <button class="button button-secondary" type="button" data-action="download-json">Pobierz dane .json</button>
      </div>
    `;
    grid.appendChild(finalCard);
  }

  shell.appendChild(grid);
  container.replaceChildren(shell);

  bindFinalTabs(shell, profile);

  shell.querySelector('[data-action="start-over"]')?.addEventListener("click", () => {
    if (!window.confirm("Czy na pewno chcesz wyczyscic odpowiedzi i zaczac od nowa?")) return;
    resetState();
    window.location.href = getPhaseUrl(phaseOrder[0]);
  });
};
