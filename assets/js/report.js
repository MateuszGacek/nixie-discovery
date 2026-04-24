import { phases, phaseOrder } from "../../config/phases.js";
import { calculateScores, formatAnswer, getTopScores, scoreLabels } from "./scoring.js";
import { generateSevenDayExperiment, generateSuggestedPaths, pathDefinitions } from "./paths.js";

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  return String(value ?? "").trim().length > 0;
};

const phaseAnswers = (answers) =>
  phaseOrder.map((phaseId) => {
    const phase = phases[phaseId];
    const items = (phase.questions || [])
      .map((question) => ({ question, value: answers[question.id], formatted: formatAnswer(question, answers[question.id]) }))
      .filter((entry) => hasValue(entry.value) && entry.question.type !== "info");
    return { phase, items };
  });

export const buildProfile = (answers) => {
  const scores = calculateScores(answers);
  const suggestedPaths = generateSuggestedPaths(scores);
  const selectedPathId = answers.selected_path || suggestedPaths[0]?.id || pathDefinitions[0].id;
  const selectedPath = suggestedPaths.find((path) => path.id === selectedPathId) || suggestedPaths[0];
  const experiment = generateSevenDayExperiment(selectedPathId);
  return {
    answers,
    scores,
    topScores: getTopScores(scores, 5),
    suggestedPaths,
    selectedPath,
    experiment,
    groupedAnswers: phaseAnswers(answers),
  };
};

const list = (items) => (items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : "<p>Brak danych.</p>");

const answerHighlights = (profile, ids) =>
  ids
    .map((id) => {
      const entry = profile.groupedAnswers.flatMap((group) => group.items).find((item) => item.question.id === id);
      if (!entry?.formatted) return "";
      return `<li><strong>${entry.question.title || entry.question.label}</strong><br>${entry.formatted}</li>`;
    })
    .filter(Boolean);

export const generateProfileHtml = (profile) => {
  const top = profile.topScores.map((score) => `${score.label}: ${score.value}`);
  return `
    <article class="summary-card generated-card">
      <h2>Najczesciej powtarzajace sie energie</h2>
      ${list(top)}
    </article>
    <article class="summary-card generated-card">
      <h2>Rzeczy, ktore daja energie</h2>
      ${list(answerHighlights(profile, ["energizing_activities", "last_flow_moment", "safe_sharing_forms"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Talenty i latwosci</h2>
      ${list(answerHighlights(profile, ["natural_easy_things", "others_praise", "talent_statements", "talent_energy_notes"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Tematy emocjonalnie wazne</h2>
      ${list(answerHighlights(profile, ["world_frustration", "what_should_change", "problems_to_solve", "core_values"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Preferowany styl pracy</h2>
      ${list(answerHighlights(profile, ["ideal_workday", "freedom_vs_stability", "solo_vs_people", "visibility_comfort", "preferred_pace"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Rzeczy, ktorych warto unikac</h2>
      ${list(answerHighlights(profile, ["draining_activities", "hard_no_list", "business_blockers"]))}
    </article>
  `;
};

export const generatePathsHtml = (profile, limit = 5) => `
  ${profile.suggestedPaths
    .slice(0, limit)
    .map(
      (path) => `
        <article class="summary-card path-card">
          <div class="path-card-header">
            <h2>${path.name}</h2>
            <span class="score-badge">${path.matchScore}</span>
          </div>
          <p>${path.description}</p>
          <h3>Dlaczego moze pasowac</h3>
          ${list(path.whyItFits)}
          <h3>Jak testowac</h3>
          ${list(path.businessModels)}
          <h3>Ryzyka</h3>
          ${list(path.risks)}
          <p class="soft-warning">To nie jest diagnoza, tylko hipoteza.</p>
        </article>
      `
    )
    .join("")}
`;

export const generateExperimentHtml = (profile) => `
  <article class="summary-card experiment-card">
    <h2>${profile.experiment.title}</h2>
    <p>${profile.experiment.goal}</p>
    <ol class="experiment-days">
      ${profile.experiment.days
        .map(
          (day) => `
            <li>
              <strong>Dzien ${day.day}</strong>
              <span>${day.task}</span>
              <small>${day.reflection}</small>
            </li>
          `
        )
        .join("")}
    </ol>
  </article>
`;

const textAnswerGroups = (profile) =>
  profile.groupedAnswers
    .map((group) => {
      const lines = group.items.map((entry) => `- ${entry.question.title || entry.question.label}: ${entry.formatted}`);
      return lines.length ? `${group.phase.title}\n${lines.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

const scoresText = (scores) =>
  Object.entries(scores)
    .map(([key, value]) => `- ${scoreLabels[key] || key}: ${value}`)
    .join("\n");

const pathsText = (paths) =>
  paths
    .slice(0, 5)
    .map((path) => `- ${path.name} (${path.matchScore}): ${path.description}`)
    .join("\n");

const experimentText = (experiment) =>
  `${experiment.title}\n${experiment.days.map((day) => `- Dzien ${day.day}: ${day.task}`).join("\n")}`;

export const generateHumanReport = (profile) => {
  const topScores = profile.topScores.map((score) => `- ${score.label}: ${score.value}`).join("\n") || "- Brak jeszcze danych scoringowych.";
  return [
    "Raport Moja Sciezka",
    "",
    "Najmocniejsze wzorce ze scoringu:",
    topScores,
    "",
    "Najwazniejsze odpowiedzi:",
    textAnswerGroups(profile) || "Brak odpowiedzi.",
    "",
    "Top sciezki:",
    pathsText(profile.suggestedPaths) || "Brak sciezek.",
    "",
    "Wybrana sciezka:",
    profile.selectedPath ? `${profile.selectedPath.name} (${profile.selectedPath.matchScore})` : "Nie wybrano.",
    "",
    "Eksperyment 7-dniowy:",
    experimentText(profile.experiment),
    "",
    "Osobisty filtr decyzyjny:",
    [
      `- Sygnały: ${formatAnswer({ options: phases.decision_system.questions[0].options }, profile.answers.mine_signals)}`,
      `- Wzorzec ekscytacji: ${formatAnswer(phases.decision_system.questions[1], profile.answers.excitement_pattern)}`,
      `- Kryteria dobrej drogi: ${formatAnswer({ options: phases.decision_system.questions[2].options }, profile.answers.good_path_criteria)}`,
      `- Definicja: ${profile.answers.personal_definition_notes || ""}`,
    ].join("\n"),
  ].join("\n").trim();
};

export const generateLLMPrompt = (profile) => `
Jestes moim strategicznym mentorem, psychologiem i doradca biznesowym w jednym.

Chce, zebys pomogl mi odkryc moja naturalna sciezke, potencjalny kierunek zawodowy lub biznesowy oraz pierwszy praktyczny krok.

Ponizej masz moje odpowiedzi z procesu autorefleksji. Nie traktuj ich jak testu osobowosci. Szukaj wzorcow, powtorzen, napiec i sprzecznosci.

Nie mow mi, ze cos jest na pewno moim powolaniem. Zamiast tego:
- nazwij hipotezy,
- pokaz, co z czego wynika,
- wskaz mozliwe sciezki,
- pokaz ryzyka,
- zaproponuj male eksperymenty,
- pomoz mi odroznic fantazje od realnego kierunku.

Twoje zadania:

1. Znajdz 5-10 najwazniejszych wzorcow w moich odpowiedziach.
2. Nazwij moje prawdopodobne talenty.
3. Nazwij moje dominujace energie, np. tworcza, opiekuncza, analityczna, edukacyjna, estetyczna, przywodcza, eksploracyjna, organizacyjna.
4. Wskaz, co daje mi energie, a co moze mnie wypalac.
5. Wskaz, jakie wartosci stoja za moimi emocjami i frustracjami.
6. Okresl, jaki styl pracy i zycia prawdopodobnie jest ze mna zgodny.
7. Zaproponuj 3-5 mozliwych kierunkow zawodowych, tworczych lub biznesowych.
8. Do kazdego kierunku podaj: dlaczego pasuje, jak mozna na tym zarabiac lub rozwijac to zawodowo, dla kogo moglabym tworzyc wartosc, jakie sa ryzyka, kiedy ten kierunek NIE bedzie dla mnie dobry.
9. Wybierz jedna sciezke najbardziej warta przetestowania jako pierwsza.
10. Zaproponuj mi pierwszy konkretny krok na 72 godziny.
11. Zaproponuj eksperyment 7-dniowy.
12. Stworz moja osobista definicje dobrej drogi.
13. Wskaz najwieksze ryzyko, ktore moze mnie blokowac.

Moje dane:

ODPOWIEDZI POGRUPowane WEDLUG ETAPOW
${textAnswerGroups(profile) || "Brak odpowiedzi."}

SCORING
${scoresText(profile.scores)}

TOP SCIEZKI
${pathsText(profile.suggestedPaths)}

WYBRANA SCIEZKA
${profile.selectedPath ? `${profile.selectedPath.name}: ${profile.selectedPath.description}` : "Nie wybrano."}

WYBRANY EKSPERYMENT
${experimentText(profile.experiment)}

OSOBISTY FILTR DECYZYJNY
- Sygnały, ze cos jest moje: ${formatAnswer({ options: phases.decision_system.questions[0].options }, profile.answers.mine_signals)}
- Wzorzec ekscytacji: ${formatAnswer(phases.decision_system.questions[1], profile.answers.excitement_pattern)}
- Kryteria dobrej drogi: ${formatAnswer({ options: phases.decision_system.questions[2].options }, profile.answers.good_path_criteria)}
- Moja definicja dobrej drogi: ${profile.answers.personal_definition_notes || ""}

Odpowiedz w strukturze:
- Krotkie podsumowanie
- Najwazniejsze wzorce
- Talenty i energie
- Co daje energie / co odbiera energie
- Mozliwe sciezki
- Najlepszy pierwszy test
- Plan 72h
- Ryzyka
- Moja definicja dobrej drogi
`.trim();

export const downloadText = (filename, content, type = "text/plain") => {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
