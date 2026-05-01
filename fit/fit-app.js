const workoutPlans = {
  A: {
    name: "FBW A",
    focus: "pull-up + glute band",
    intent: "Dzień pod podciąganie, mocne plecy i pośladek bez docisku przez kostkę. Pośladki robione bokiem i z gumą, bez hip thrustów, RDL, leg pressa ani stania na jednej nodze.",
    exercises: [
      {
        name: "Lat pulldown neutral grip",
        dose: "3 serie x 8-12",
        rir: "RIR 2",
        rest: "90-120 s",
        tags: ["Pull-up path", "No standing load"],
        cues: ["łopatki najpierw w dół", "łokcie prowadź do żeber", "kontrolowany powrót"],
        substitutions: ["lat pulldown nachwytem"],
      },
      {
        name: "Back extension",
        dose: "3 serie x 10-15",
        rir: "RIR 2",
        rest: "90-120 s",
        tags: ["Posterior chain", "Glute activation"],
        cues: ["ruch z biodra", "plecy neutralnie", "zatrzymaj ruch przed przeprostem lędźwi", "pośladek dopina górę"],
        substitutions: ["45-degree back extension", "prone bent-knee hip extension"],
      },
      {
        name: "Flat bench / incline chest press",
        dose: "2 serie x 8-12",
        rir: "RIR 2-3",
        rest: "90-120 s",
        tags: ["Upper", "Chest"],
        cues: ["łopatki ustawione", "kontrolowany dół", "bez dokładania za wszelką cenę"],
        substitutions: ["chest press machine"],
      },
      {
        name: "Seated leg curl",
        dose: "3 serie x 10-15",
        rir: "RIR 2",
        rest: "90 s",
        tags: ["Hamstrings", "Ankle safe"],
        cues: ["biodra dociśnięte", "pełna kontrola powrotu", "wałek nie może uciskać bolesnego rejonu kostki"],
        substitutions: ["lying leg curl"],
      },
      {
        name: "Abductor machine",
        dose: "3 serie x 15-25 na stronę",
        rir: "RIR 1-2",
        rest: "45-60 s",
        tags: ["Glute activation", "Machine", "Ankle safe"],
        cues: ["ustawienie bez bólu kostki", "pauza 1 s w odwiedzeniu", "nie bujaj tułowiem", "kontrolowany powrót"],
        substitutions: ["side-lying hip abduction", "seated band abduction"],
      },
      {
        name: "Adductor machine",
        dose: "2-3 serie x 15-20",
        rir: "RIR 2-3",
        rest: "45-60 s",
        tags: ["Hip balance", "Machine", "Ankle safe"],
        cues: ["zrób od razu po abductorze", "kontrolowany zakres", "bez dociskania stopami na siłę"],
        substitutions: ["pomiń, jeśli ustawienie maszyny drażni kostkę"],
      },
      {
        name: "Face pull siedząc",
        dose: "2 serie x 12-20",
        rir: "RIR 2",
        rest: "60-90 s",
        tags: ["Rear delt", "Scapula"],
        cues: ["łokcie wysoko", "linka do twarzy", "tył barku i łopatki mają pracować"],
        substitutions: ["reverse pec deck"],
      },
      {
        name: "Dead bug",
        dose: "2-3 serie x 8-12 na stronę",
        rir: "RIR 2",
        rest: "60 s",
        tags: ["Core", "Mat exercise"],
        cues: ["lędźwia stabilnie", "powolny wydech", "brzuch trzyma pozycję"],
        substitutions: ["hollow hold regression"],
      },
    ],
  },
  B: {
    name: "FBW B",
    focus: "pull-up + glute mat",
    intent: "Druga jednostka ochronna. Plecy nadal są priorytetem, a pośladki pracują na macie w leżeniu, bez mocnego udziału stopy i bez obciążania kostki.",
    exercises: [
      {
        name: "Lat pulldown neutral grip",
        dose: "3 serie x 8-12",
        rir: "RIR 2",
        rest: "90-120 s",
        tags: ["Pull-up path", "No standing load"],
        cues: ["lat pulldown jako baza", "łopatki najpierw w dół", "opuszczanie pod kontrolą"],
        substitutions: ["assisted pull-up 3x5-8 tylko przy wejściu, zejściu i pozycji 0/10 bólu"],
      },
      {
        name: "Seated cable row",
        dose: "3 serie x 10-12",
        rir: "RIR 2",
        rest: "90 s",
        tags: ["Back", "No standing load"],
        cues: ["siedząca pozycja", "łokcie blisko ciała", "bez bujania"],
        substitutions: ["chest-supported row"],
      },
      {
        name: "Dumbbell bench / incline dumbbell press",
        dose: "2 serie x 8-12",
        rir: "RIR 2-3",
        rest: "90 s",
        tags: ["Upper", "Dumbbells"],
        cues: ["ustaw łopatki", "prowadź hantle równo", "barki bez pompowania objętości"],
        substitutions: ["incline chest press machine", "chest press machine"],
      },
      {
        name: "Lying leg curl",
        dose: "3 serie x 10-15",
        rir: "RIR 2",
        rest: "90 s",
        tags: ["Hamstrings", "Ankle safe"],
        cues: ["biodra przy ławce", "kontrola powrotu", "wałek nie może uciskać bolesnego rejonu kostki"],
        substitutions: ["seated leg curl"],
      },
      {
        name: "Prone bent-knee hip extension",
        dose: "3 serie x 12-20 na stronę",
        rir: "RIR 1-2",
        rest: "45-60 s",
        tags: ["Glute activation", "Mat exercise", "Ankle safe"],
        cues: ["leżenie na brzuchu", "kolano zgięte około 90 stopni", "udo minimalnie nad podłoże", "bez przeprostu w lędźwiach"],
        substitutions: ["side-lying hip abduction"],
      },
      {
        name: "Side-lying hip abduction",
        dose: "2-3 serie x 15-25 na stronę",
        rir: "RIR 1-2",
        rest: "45-60 s",
        tags: ["Glute activation", "Mat exercise", "Ankle safe"],
        cues: ["leżenie bokiem", "palce lekko w dół", "ruch z biodra, nie z lędźwi", "pauza 1 s na górze"],
        substitutions: ["clamshell z minibandem", "clamshell bez gumy"],
        caution: "Clamshell tylko jeśli ustawienie stóp jest 0/10 bólu.",
      },
      {
        name: "Reverse pec deck",
        dose: "2 serie x 12-20",
        rir: "RIR 2",
        rest: "60-90 s",
        tags: ["Rear delt", "Scapula"],
        cues: ["tył barku", "łopatki pod kontrolą", "bez szarpania"],
        substitutions: ["face pull siedząc"],
      },
      {
        name: "Dead bug / hollow hold regression",
        dose: "2-3 serie",
        rir: "RIR 2",
        rest: "60 s",
        tags: ["Core", "Mat exercise"],
        cues: ["dead bug jako pierwsza opcja", "hollow hold regression jako druga", "machine crunch tylko jeśli stopy są neutralne i bez bólu"],
        substitutions: ["machine crunch, jeśli ustawienie stóp jest 0/10 bólu"],
      },
    ],
  },
};

let activePlan = "A";

const exerciseList = document.querySelector("#fitExerciseList");
const workoutNote = document.querySelector("#fitWorkoutNote");
const planTabs = Array.from(document.querySelectorAll("[data-plan-tab]"));

planTabs.forEach((button) => {
  button.addEventListener("click", () => {
    activePlan = button.dataset.planTab;
    render();
  });
});

render();

function render() {
  const plan = workoutPlans[activePlan];

  workoutNote.innerHTML = `
    <strong>${plan.name}: ${plan.focus}</strong>
    <span>${plan.intent}</span>
  `;

  exerciseList.innerHTML = plan.exercises.map(renderExerciseCard).join("");

  planTabs.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.planTab === activePlan));
  });
}

function renderExerciseCard(exercise, index) {
  return `
    <article class="fit-exercise-card">
      <div class="fit-exercise-head">
        <div>
          <span>${String(index + 1).padStart(2, "0")} · ${exercise.dose}</span>
          <h3>${exercise.name}</h3>
        </div>
        <em>${exercise.rir}</em>
      </div>
      <div class="fit-tag-list" aria-label="Tagi ćwiczenia">
        ${exercise.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <dl class="fit-dose-list">
        <div>
          <dt>Przerwa</dt>
          <dd>${exercise.rest}</dd>
        </div>
        <div>
          <dt>Zamiennik</dt>
          <dd>${exercise.substitutions.join(" / ")}</dd>
        </div>
      </dl>
      ${exercise.caution ? `<p class="fit-substitution">${exercise.caution}</p>` : ""}
      <ul class="fit-cue-list">
        ${exercise.cues.map((cue) => `<li>${cue}</li>`).join("")}
      </ul>
    </article>
  `;
}
