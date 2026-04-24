import { phases, phaseOrder } from "../../config/phases.js";
import { calculateScores, formatAnswer, getTopScores, scoreLabels } from "./scoring.js";
import { generateSevenDayExperiment, generateSuggestedPaths, pathDefinitions } from "./paths.js";

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  return String(value ?? "").trim().length > 0;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const phaseAnswers = (answers) =>
  phaseOrder.map((phaseId) => {
    const phase = phases[phaseId];
    const items = (phase.questions || [])
      .map((question) => ({ question, value: answers[question.id], formatted: formatAnswer(question, answers[question.id]) }))
      .filter((entry) => hasValue(entry.value) && entry.question.type !== "info");
    return { phase, items };
  });

const getAnswerEntry = (profile, id) =>
  profile.groupedAnswers.flatMap((group) => group.items).find((item) => item.question.id === id);

const getFormattedAnswer = (profile, id) => getAnswerEntry(profile, id)?.formatted || "";

const splitAnswerList = (profile, id, fallback = []) => {
  const entry = getAnswerEntry(profile, id);
  if (!entry?.value) return fallback;
  if (Array.isArray(entry.value)) {
    return entry.value
      .map((value) => {
        const option = (entry.question.options || []).find((item) => {
          const itemValue = typeof item === "string" ? item : item.id;
          return String(itemValue) === String(value);
        });
        return typeof option === "string" ? option : option?.label || String(value);
      })
      .filter(Boolean);
  }
  return [String(entry.formatted || "").trim()].filter(Boolean);
};

const trimSentence = (value, maxLength = 140) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const list = (items) =>
  items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "<p>Brak danych.</p>";

const answerHighlights = (profile, ids) =>
  ids
    .map((id) => {
      const entry = getAnswerEntry(profile, id);
      if (!entry?.formatted) return "";
      return `<li><strong>${escapeHtml(entry.question.title || entry.question.label)}</strong><br>${escapeHtml(entry.formatted)}</li>`;
    })
    .filter(Boolean);

const createCheckpointData = (profile, checkpointFor) => {
  const freedomScore = profile.scores.freedom || 0;
  const stabilityScore = profile.scores.stability || 0;
  const peopleScore = profile.scores.relational || 0;
  const soloScore = profile.scores.independent || 0;

  const checkpointMap = {
    identity: {
      repeating: [
        getFormattedAnswer(profile, "free_day")
          ? `W obrazie dnia tylko dla siebie wraca: ${trimSentence(getFormattedAnswer(profile, "free_day"))}`
          : "",
        splitAnswerList(profile, "natural_easy_things").length
          ? `Lekko przychodza Ci rzeczy takie jak: ${splitAnswerList(profile, "natural_easy_things").slice(0, 3).join(", ")}.`
          : "",
        getFormattedAnswer(profile, "endless_topics")
          ? `Tematy, do ktorych naturalnie wracasz: ${trimSentence(getFormattedAnswer(profile, "endless_topics"))}`
          : "",
      ],
      observe: [
        getFormattedAnswer(profile, "most_yourself_moment")
          ? `Warto dalej obserwowac momenty, w ktorych czujesz: ${trimSentence(getFormattedAnswer(profile, "most_yourself_moment"))}`
          : "Warto dalej obserwowac, w jakich sytuacjach czujesz najwiecej lekkoosci i bycia soba.",
        getFormattedAnswer(profile, "identity_self_check")
          ? `Po tym etapie czujesz: ${getFormattedAnswer(profile, "identity_self_check")}.`
          : "",
      ],
      notYet: [
        "Nie musisz jeszcze wiedziec, jak to nazwac zawodowo.",
        "Nie musisz od razu oddzielac talentu od powolania.",
      ],
    },
    joy_flow: {
      repeating: [
        splitAnswerList(profile, "energizing_activities").length
          ? `Bardziej ozywiaja Cie aktywnosci takie jak: ${splitAnswerList(profile, "energizing_activities").slice(0, 3).join(", ")}.`
          : "",
        getFormattedAnswer(profile, "last_flow_moment")
          ? `Flow pojawia sie, gdy: ${trimSentence(getFormattedAnswer(profile, "last_flow_moment"))}`
          : "",
        splitAnswerList(profile, "safe_sharing_forms").length
          ? `Najbezpieczniejsze formy dzielenia sie na ten moment to: ${splitAnswerList(profile, "safe_sharing_forms").slice(0, 2).join(", ")}.`
          : "",
      ],
      observe: [
        splitAnswerList(profile, "draining_activities").length
          ? `Warto chronic sie przed tym, co odbiera Ci energie: ${splitAnswerList(profile, "draining_activities").slice(0, 3).join(", ")}.`
          : "",
        getFormattedAnswer(profile, "private_vs_shared_joy")
          ? `Na ten moment relacja miedzy radoscia a dzieleniem sie brzmi tak: ${getFormattedAnswer(profile, "private_vs_shared_joy")}.`
          : "",
      ],
      notYet: [
        "Nie wszystko, co daje Ci radosc, musi stac sie praca.",
        "Nie musisz jeszcze wiedziec, jak duzo z tego chcesz pokazywac innym.",
      ],
    },
    emotions: {
      repeating: [
        getFormattedAnswer(profile, "world_frustration")
          ? `Mocno porusza Cie temat: ${trimSentence(getFormattedAnswer(profile, "world_frustration"))}`
          : "",
        splitAnswerList(profile, "problems_to_solve").length
          ? `Naturalnie ciaagnie Cie do problemow takich jak: ${splitAnswerList(profile, "problems_to_solve").slice(0, 3).join(", ")}.`
          : "",
        splitAnswerList(profile, "core_values").length
          ? `Pod tym wszystkim wracaja wartosci: ${splitAnswerList(profile, "core_values").slice(0, 3).join(", ")}.`
          : "",
      ],
      observe: [
        getFormattedAnswer(profile, "moved_to_tears")
          ? `Warto obserwowac, co najmocniej Cie porusza: ${trimSentence(getFormattedAnswer(profile, "moved_to_tears"))}`
          : "",
        getFormattedAnswer(profile, "what_should_change")
          ? `Jest w Tobie wyrazny impuls, zeby zmieniac: ${trimSentence(getFormattedAnswer(profile, "what_should_change"))}`
          : "",
      ],
      notYet: [
        "Nie musisz jeszcze przekladac tych emocji na misje ani zawod.",
        "Wystarczy, ze widzisz, co jest dla Ciebie naprawde wazne.",
      ],
    },
    work_style: {
      repeating: [
        getFormattedAnswer(profile, "ideal_workday")
          ? `Najbardziej sluzy Ci dzien, w ktorym: ${trimSentence(getFormattedAnswer(profile, "ideal_workday"))}`
          : "",
        `W relacji wolnosc - stabilnosc mocniej brzmi dla Ciebie: ${freedomScore >= stabilityScore ? "wolnosc" : "stabilnosc"}.`,
        `W relacji kontakt z ludzmi - samodzielnosc mocniej brzmi dla Ciebie: ${peopleScore >= soloScore ? "kontakt z ludzmi" : "spokojniejsza samodzielnosc"}.`,
      ],
      observe: [
        getFormattedAnswer(profile, "preferred_pace")
          ? `Najzdrowsze tempo rozwoju brzmi teraz: ${getFormattedAnswer(profile, "preferred_pace")}.`
          : "",
        splitAnswerList(profile, "hard_no_list").length
          ? `Warto chronic granice wokol rzeczy, ktorych nie chcesz: ${splitAnswerList(profile, "hard_no_list").slice(0, 3).join(", ")}.`
          : "",
      ],
      notYet: [
        "Nie musisz jeszcze wymyslac jednego modelu pracy na cale zycie.",
        "Wystarczy, ze coraz lepiej widzisz warunki, w ktorych mozesz oddychac.",
      ],
    },
  };

  const current = checkpointMap[checkpointFor] || checkpointMap.identity;
  return {
    repeating: current.repeating.filter(Boolean).slice(0, 3),
    observe: current.observe.filter(Boolean).slice(0, 2),
    notYet: current.notYet.filter(Boolean).slice(0, 2),
  };
};

const buildFinalSections = (profile) => {
  const topPaths = profile.suggestedPaths.slice(0, 3);
  const pathLines = topPaths.map((path) => `${path.name} - ${path.matchLabel}. ${path.description}`);
  const easiestStep = getFormattedAnswer(profile, "easiest_first_step");
  const preferredForms = splitAnswerList(profile, "preferred_next_form");
  const topSignals = profile.topScores.map((score) => `Wraca energia: ${score.label}.`);

  return {
    whatYouKnow: [
      ...topSignals.slice(0, 3),
      getFormattedAnswer(profile, "identity_self_check")
        ? `Po etapie o tozsamosci zostaje w Tobie: ${getFormattedAnswer(profile, "identity_self_check")}.`
        : "",
      preferredForms.length ? `Najbezpieczniejsza forma dzialania na teraz brzmi jak: ${preferredForms.slice(0, 2).join(", ")}.` : "",
    ].filter(Boolean),
    energizesYou: [
      splitAnswerList(profile, "energizing_activities").length
        ? `Ozywia Cie: ${splitAnswerList(profile, "energizing_activities").slice(0, 3).join(", ")}.`
        : "",
      splitAnswerList(profile, "natural_easy_things").length
        ? `Naturalna latwosc pojawia sie przy: ${splitAnswerList(profile, "natural_easy_things").slice(0, 3).join(", ")}.`
        : "",
      getFormattedAnswer(profile, "last_flow_moment")
        ? `Flow pojawia sie, gdy: ${trimSentence(getFormattedAnswer(profile, "last_flow_moment"))}`
        : "",
    ].filter(Boolean),
    drainsYou: [
      splitAnswerList(profile, "draining_activities").length
        ? `Najczesciej odcina Cie od energii: ${splitAnswerList(profile, "draining_activities").slice(0, 3).join(", ")}.`
        : "",
      splitAnswerList(profile, "hard_no_list").length
        ? `W przyszlym dzialaniu chcesz chronic sie przed: ${splitAnswerList(profile, "hard_no_list").slice(0, 3).join(", ")}.`
        : "",
      splitAnswerList(profile, "business_blockers").length
        ? `Na starcie moga zatrzymywac Cie: ${splitAnswerList(profile, "business_blockers").slice(0, 3).join(", ")}.`
        : "",
    ].filter(Boolean),
    directions: pathLines,
    notYet: [
      "Nie musisz jeszcze wiedziec, czy to ma byc projekt, biznes, spokojna praca czy tworczosc prywatna.",
      "Nie musisz wybierac jednej sciezki na zawsze. Najpierw wystarczy jedna lagodna hipoteza.",
      preferredForms.length ? `Masz juz sygnal, jaka forma brzmi bezpieczniej: ${preferredForms.slice(0, 2).join(", ")}.` : "",
    ].filter(Boolean),
    nextStep: [
      easiestStep
        ? `Najlatwiejszy pierwszy krok, ktory sama widzisz: ${trimSentence(easiestStep)}`
        : `Najbezpieczniejszy pierwszy krok: ${profile.experiment.days[0]?.task || "wybierz najmniejsza probe do sprawdzenia."}`,
      "Nie chodzi o udowodnienie czegokolwiek. Chodzi o zebranie pierwszego sygnalu z rzeczywistosci.",
    ].filter(Boolean),
  };
};

export const buildProfile = (answers) => {
  const scores = calculateScores(answers);
  const suggestedPaths = generateSuggestedPaths(scores, answers);
  const selectedPathId = answers.selected_path || suggestedPaths[0]?.id || pathDefinitions[0].id;
  const selectedPath = suggestedPaths.find((path) => path.id === selectedPathId) || suggestedPaths[0];
  const experiment = generateSevenDayExperiment(selectedPathId);

  const profile = {
    answers,
    scores,
    topScores: getTopScores(scores, 5),
    suggestedPaths,
    selectedPath,
    experiment,
    groupedAnswers: phaseAnswers(answers),
  };

  return {
    ...profile,
    checkpointInsights: {
      identity: createCheckpointData(profile, "identity"),
      joy_flow: createCheckpointData(profile, "joy_flow"),
      emotions: createCheckpointData(profile, "emotions"),
      work_style: createCheckpointData(profile, "work_style"),
    },
    finalSections: buildFinalSections(profile),
  };
};

export const generateProfileHtml = (profile) => {
  const top = profile.topScores.map((score) => `${score.label}: ${score.value}`);
  return `
    <article class="summary-card generated-card">
      <h2>To juz sie wyraznie powtarza</h2>
      ${list(top)}
    </article>
    <article class="summary-card generated-card">
      <h2>Co Cie ozywia</h2>
      ${list(answerHighlights(profile, ["energizing_activities", "last_flow_moment", "safe_sharing_forms"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Talenty i naturalna latwosc</h2>
      ${list(answerHighlights(profile, ["natural_easy_things", "others_praise", "talent_statements", "talent_energy_notes"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Wartosci, ktore wracaja</h2>
      ${list(answerHighlights(profile, ["world_frustration", "what_should_change", "problems_to_solve", "core_values"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Jaki styl sluzy Ci bardziej</h2>
      ${list(answerHighlights(profile, ["ideal_workday", "freedom_vs_stability", "solo_vs_people", "visibility_comfort", "preferred_pace"]))}
    </article>
    <article class="summary-card generated-card">
      <h2>Czego chcesz chronic mniej</h2>
      ${list(answerHighlights(profile, ["draining_activities", "hard_no_list", "business_blockers"]))}
    </article>
  `;
};

export const generateCheckpointHtml = (profile, checkpointFor) => {
  const insight = profile.checkpointInsights[checkpointFor] || profile.checkpointInsights.identity;
  return `
    <article class="summary-card checkpoint-card">
      <h2>Co moze sie powtarzac</h2>
      ${list(insight.repeating)}
    </article>
    <article class="summary-card checkpoint-card">
      <h2>Co warto dalej obserwowac</h2>
      ${list(insight.observe)}
    </article>
    <article class="summary-card checkpoint-card">
      <h2>Czego jeszcze nie musisz rozstrzygac</h2>
      ${list(insight.notYet)}
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
            <div>
              <p class="card-kicker">${escapeHtml(path.matchLabel)}</p>
              <h2>${escapeHtml(path.name)}</h2>
            </div>
            <span class="score-badge">${escapeHtml(path.matchLabel)}</span>
          </div>
          <p>${escapeHtml(path.description)}</p>
          <h3>Dlaczego to moze byc bliskie</h3>
          ${list(path.whyItFits)}
          <h3>Jaka forma brzmi bezpiecznie</h3>
          ${list(path.businessModels)}
          <h3>Na co uwazac</h3>
          ${list(path.risks)}
          <p class="soft-warning">Jedna sciezka nie wyklucza drugiej. To hipotezy do lagodnego sprawdzenia.</p>
        </article>
      `
    )
    .join("")}
`;

export const generateExperimentHtml = (profile) => `
  <article class="summary-card experiment-card">
    <p class="card-kicker">Bezpieczny test zamiast wielkiej decyzji</p>
    <h2>${escapeHtml(profile.experiment.title)}</h2>
    <p>${escapeHtml(profile.experiment.goal)}</p>
    <ol class="experiment-days">
      ${profile.experiment.days
        .map(
          (day) => `
            <li>
              <strong>Dzien ${day.day}</strong>
              <span>${escapeHtml(day.task)}</span>
              <small>${escapeHtml(day.reflection)}</small>
            </li>
          `
        )
        .join("")}
    </ol>
  </article>
`;

const renderFinalSectionCard = (title, items) => `
  <article class="summary-card final-card">
    <h2>${escapeHtml(title)}</h2>
    ${list(items)}
  </article>
`;

export const generateFinalReportHtml = (profile) => `
  <div class="final-report-grid">
    ${renderFinalSectionCard("To juz o sobie wiesz", profile.finalSections.whatYouKnow)}
    ${renderFinalSectionCard("Co Cie ozywia", profile.finalSections.energizesYou)}
    ${renderFinalSectionCard("Co moze Cie przeciazac", profile.finalSections.drainsYou)}
    ${renderFinalSectionCard("Jakie kierunki sa warte sprawdzenia", profile.finalSections.directions)}
    ${renderFinalSectionCard("Czego nie musisz jeszcze wiedziec", profile.finalSections.notYet)}
    ${renderFinalSectionCard("Najbezpieczniejszy nastepny krok", profile.finalSections.nextStep)}
    ${generateExperimentHtml(profile)}
  </div>
`;

export const generateLLMTabHtml = (profile) => `
  <article class="summary-card final-card">
    <p class="card-kicker">Poglebienie zewnetrzne</p>
    <h2>Pogleb z LLM</h2>
    <p>
      Wynik z tej aplikacji juz teraz porzadkuje Twoje odpowiedzi. Jesli chcesz,
      mozesz skopiowac prompt i poglebic analize w zewnetrznym narzedziu.
    </p>
    <p class="soft-warning">
      Ten proces nie zastepuje terapii ani profesjonalnego wsparcia psychologicznego.
      Jesli ktorys fragment jest zbyt trudny, mozesz go pominac, odlozyc albo przerobic tylko czesc promptu.
    </p>
    <p class="soft-warning">
      Twoje odpowiedzi sa zapisane lokalnie w tej aplikacji. Jesli skopiujesz prompt i wkleisz go do zewnetrznego narzedzia,
      udostepnisz mu te tresci. Mozesz przed wyslaniem usunac fragmenty, ktore sa zbyt prywatne.
    </p>
    <textarea class="field-control prompt-output" readonly>${escapeHtml(generateLLMPrompt(profile))}</textarea>
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
    .map((path) => `- ${path.name} (${path.matchLabel}): ${path.description}`)
    .join("\n");

const experimentText = (experiment) =>
  `${experiment.title}\n${experiment.days.map((day) => `- Dzien ${day.day}: ${day.task}`).join("\n")}`;

export const generateHumanReport = (profile) => {
  const section = profile.finalSections;
  return [
    "Twoj wynik z aplikacji",
    "",
    "To juz o sobie wiesz:",
    (section.whatYouKnow || []).map((item) => `- ${item}`).join("\n") || "- Brak danych.",
    "",
    "Co Cie ozywia:",
    (section.energizesYou || []).map((item) => `- ${item}`).join("\n") || "- Brak danych.",
    "",
    "Co moze Cie przeciazac:",
    (section.drainsYou || []).map((item) => `- ${item}`).join("\n") || "- Brak danych.",
    "",
    "Jakie kierunki sa warte sprawdzenia:",
    (section.directions || []).map((item) => `- ${item}`).join("\n") || "- Brak kierunkow.",
    "",
    "Czego nie musisz jeszcze wiedziec:",
    (section.notYet || []).map((item) => `- ${item}`).join("\n") || "- Brak danych.",
    "",
    "Najbezpieczniejszy nastepny krok:",
    (section.nextStep || []).map((item) => `- ${item}`).join("\n") || "- Brak danych.",
    "",
    "Twoj eksperyment 7-dniowy:",
    experimentText(profile.experiment),
  ].join("\n").trim();
};

export const generateLLMPrompt = (profile) => `
Jestes moim strategicznym mentorem, psychologiem i doradca biznesowym w jednym.

Chce, zebys pomogl mi spokojnie poglebic moja naturalna sciezke, mozliwe kierunki dzialania oraz pierwszy bezpieczny test.

Ponizej masz moje odpowiedzi z procesu autorefleksji. Nie traktuj ich jak testu osobowosci ani jak diagnozy. Szukaj wzorcow, powtorzen, napiec i sygnalow, ale zostaw miejsce na niepewnosc.

Nie mow mi, ze cos jest na pewno moim powolaniem. Zamiast tego:
- nazwij hipotezy,
- pokaz, co z czego wynika,
- wskaz mozliwe kierunki,
- pokaz ryzyka,
- zaproponuj male eksperymenty,
- pomoz mi odroznic fantazje od realnego kierunku,
- zachowaj ton spokojny, wspierajacy i nieprzebodzcowujacy.

Twoje zadania:

1. Znajdz 5-10 najwazniejszych wzorcow w moich odpowiedziach.
2. Nazwij moje prawdopodobne talenty i dominujace energie.
3. Wskaz, co daje mi energie, a co moze mnie wypalac.
4. Wskaz, jakie wartosci stoja za moimi emocjami i frustracjami.
5. Okresl, jaki styl pracy i zycia prawdopodobnie jest ze mna zgodny.
6. Zaproponuj 3-5 mozliwych kierunkow zawodowych, tworczych lub projektowych.
7. Do kazdego kierunku podaj: dlaczego pasuje, jaka forma bylaby na teraz najlagodniejsza, jak mozna to sprawdzic bez presji, jakie sa ryzyka, kiedy ten kierunek nie bedzie dla mnie dobry.
8. Wybierz jedna hipoteze najbardziej warta spokojnego sprawdzenia jako pierwsza.
9. Zaproponuj mi pierwszy konkretny krok na 72 godziny.
10. Zaproponuj eksperyment 7-dniowy.
11. Stworz moja osobista definicje dobrej drogi.
12. Wskaz najwieksze ryzyko, ktore moze mnie blokowac.

Moje dane:

ODPOWIEDZI POGRUPOWANE WEDLUG ETAPOW
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
- Sygnaly, ze cos jest moje: ${formatAnswer({ options: phases.decision_system.questions[0].options }, profile.answers.mine_signals)}
- Wzorzec ekscytacji: ${formatAnswer(phases.decision_system.questions[1], profile.answers.excitement_pattern)}
- Kryteria dobrej drogi: ${formatAnswer({ options: phases.decision_system.questions[2].options }, profile.answers.good_path_criteria)}
- Moja definicja dobrej drogi: ${profile.answers.personal_definition_notes || ""}

Odpowiedz w strukturze:
- Krotkie podsumowanie
- Najwazniejsze wzorce
- Talenty i energie
- Co daje energie / co odbiera energie
- Mozliwe kierunki
- Najlagodniejszy pierwszy test
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
