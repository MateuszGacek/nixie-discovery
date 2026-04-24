import { scoreLabels } from "./scoring.js";

export const pathDefinitions = [
  {
    id: "personal_brand_education",
    name: "Marka osobista + edukacja",
    description: "Dzielenie sie wiedza, perspektywa i doswiadczeniem przez tresci, mini produkty, warsztaty albo konsultacje.",
    weights: { creative: 1.2, communication: 1.4, educational: 1.4, visibility: 1, freedom: 0.8, businessReadiness: 0.6 },
    businessModels: ["seria tresci", "newsletter", "mini kurs", "warsztat", "konsultacje tematyczne"],
    risks: ["presja widocznosci", "tworzenie pod oczekiwania innych", "zbyt szybkie monetyzowanie tematu"],
  },
  {
    id: "mentoring_consulting",
    name: "Mentoring / konsultacje 1:1",
    description: "Praca z druga osoba przez sluchanie, porzadkowanie problemu, zadawanie pytan i wspieranie decyzji.",
    weights: { relational: 1.4, caring: 1.3, communication: 1, meaning: 0.8, businessReadiness: 0.5 },
    businessModels: ["rozmowy testowe", "pakiet konsultacji", "mentoring", "sesje porzadkujace"],
    risks: ["branie zbyt duzej odpowiedzialnosci za innych", "zmeczenie emocjonalne", "brak granic"],
  },
  {
    id: "digital_product",
    name: "Produkt cyfrowy",
    description: "Ukladanie wiedzy lub procesu w produkt, ktory pomaga innym samodzielnie przejsc przez konkretny problem.",
    weights: { creative: 1, educational: 1, independent: 1.2, builder: 1, organizational: 0.7, businessReadiness: 0.8 },
    businessModels: ["PDF", "checklista", "workbook", "mini kurs", "szablony"],
    risks: ["budowanie w izolacji", "perfekcjonizm", "brak rozmow z odbiorcami"],
  },
  {
    id: "physical_aesthetic_product",
    name: "Produkt fizyczny / estetyczny",
    description: "Tworzenie rzeczy, ktore lacza piekno, funkcje, nastroj lub doswiadczenie odbiorcy.",
    weights: { aesthetic: 1.5, creative: 1.2, builder: 0.8, businessReadiness: 0.5 },
    businessModels: ["mikroprodukt", "limitowana kolekcja", "personalizowane zamowienia", "sklep testowy"],
    risks: ["koszty produkcji", "zbyt szybka skala", "tworzenie bez walidacji popytu"],
  },
  {
    id: "workshops_community",
    name: "Warsztaty / spolecznosc",
    description: "Tworzenie bezpiecznej przestrzeni do rozmowy, nauki, wymiany i wspolnego przechodzenia przez proces.",
    weights: { relational: 1.2, educational: 1, leadership: 1, communication: 1, visibility: 0.6 },
    businessModels: ["warsztat online", "cykl spotkan", "kameralna spolecznosc", "program grupowy"],
    risks: ["nadmiar ludzi", "obciazenie moderacja", "niejasne zasady grupy"],
  },
  {
    id: "behind_the_scenes",
    name: "Projekt za kulisami",
    description: "Wspieranie ludzi, marek lub projektow przez porzadkowanie chaosu, strategie, procesy i analize.",
    weights: { organizational: 1.3, strategic: 1.3, analytical: 1, independent: 0.8, visibility: -0.4 },
    businessModels: ["audyt", "strategia", "usprawnienie procesu", "operacyjne wsparcie projektu"],
    risks: ["zbyt duzo pracy operacyjnej", "niewidzialnosc efektow", "wchodzenie w cudzy chaos bez ram"],
  },
  {
    id: "content_storytelling",
    name: "Content + storytelling",
    description: "Budowanie sensu i relacji przez opowiadanie historii, pisanie, edukowanie i nazywanie doswiadczen.",
    weights: { creative: 1.4, communication: 1.4, meaning: 0.8, visibility: 0.8, aesthetic: 0.5 },
    businessModels: ["newsletter", "blog", "scenariusze", "copywriting", "seria edukacyjna"],
    risks: ["porownywanie sie", "presja regularnosci", "tworzenie bez rozmowy z odbiorca"],
  },
  {
    id: "strategy_processes",
    name: "Strategia / organizacja / procesy",
    description: "Pomaganie w decyzjach, strukturze, planowaniu i zamianie chaosu w jasny system dzialania.",
    weights: { strategic: 1.5, organizational: 1.3, analytical: 1, builder: 0.8 },
    businessModels: ["konsultacje strategiczne", "audyt procesu", "mapa dzialan", "system pracy"],
    risks: ["przesadne analizowanie", "brak kontaktu z realnym wdrozeniem", "przejmowanie odpowiedzialnosci"],
  },
  {
    id: "stable_work_side_project",
    name: "Hybryda: stabilna praca + projekt poboczny",
    description: "Spokojne testowanie pomyslu obok stabilnego zrodla bez presji, ze wszystko musi stac sie biznesem od razu.",
    weights: { stability: 1.2, businessReadiness: 0.5, creative: 0.5, freedom: 0.5 },
    businessModels: ["projekt po godzinach", "pilotaz", "sprzedaz testowa", "portfolio eksperymentow"],
    risks: ["rozproszenie", "przeciazenie czasowe", "brak jasnego kryterium kontynuacji"],
  },
  {
    id: "private_creativity",
    name: "Tworczosc prywatna bez monetyzacji na teraz",
    description: "Chronienie tworczej energii jako przestrzeni sensu, regeneracji i poznawania siebie bez natychmiastowej sprzedazy.",
    weights: { creative: 1, meaning: 1, businessReadiness: -0.5, stability: 0.5 },
    businessModels: ["brak monetyzacji na teraz", "portfolio bez presji", "praktyka tworcza", "dziennik projektu"],
    risks: ["poczucie, ze wszystko musi byc uzyteczne", "porzucenie praktyki", "porownywanie z biznesami innych"],
  },
];

const preferredFormBoosts = {
  side_project: ["stable_work_side_project"],
  calm_job: ["stable_work_side_project", "behind_the_scenes"],
  small_service: ["mentoring_consulting", "strategy_processes"],
  digital_product: ["digital_product", "content_storytelling"],
  private_creativity: ["private_creativity", "physical_aesthetic_product"],
  behind_scenes: ["behind_the_scenes", "strategy_processes"],
};

const matchToneByIndex = (index) => {
  if (index === 0) return "mocny sygnal";
  if (index === 1 || index === 2) return "dobry kierunek do lagodnego sprawdzenia";
  return "lagodna hipoteza do sprawdzenia";
};

const humanizeSignal = (key) => {
  const label = scoreLabels[key] || key;
  return `W Twoich odpowiedziach wraca energia: ${label}.`;
};

const collectPreferredBoost = (answers, pathId) => {
  const forms = Array.isArray(answers?.preferred_next_form) ? answers.preferred_next_form : [];
  return forms.some((form) => (preferredFormBoosts[form] || []).includes(pathId)) ? 1.2 : 0;
};

export const generateSuggestedPaths = (scores, answers = {}) => {
  const ranked = pathDefinitions
    .map((path) => {
      const raw = Object.entries(path.weights).reduce((sum, [key, weight]) => sum + (scores[key] || 0) * weight, 0);
      const matchScore = Math.max(0, Math.round((raw + collectPreferredBoost(answers, path.id)) * 10) / 10);
      const strongest = Object.entries(path.weights)
        .filter(([key]) => (scores[key] || 0) > 0)
        .sort((a, b) => (scores[b[0]] || 0) * b[1] - (scores[a[0]] || 0) * a[1])
        .slice(0, 3)
        .map(([key]) => key);

      return {
        ...path,
        matchScore,
        whyItFits: strongest.length
          ? strongest.map((key) => humanizeSignal(key))
          : ["Na ten moment to delikatna hipoteza. Warto sprawdzic tylko tyle, ile brzmi bezpiecznie i realnie."],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return ranked.map((path, index) => ({
    ...path,
    matchLabel: matchToneByIndex(index),
  }));
};

const reflectionLine = "Po zadaniu zapisz: energia, opor, ciekawosc, sens i reakcja swiata.";

const defaultDays = [
  "Wybierz jeden drobny temat albo problem, ktory naprawde Cie ciagnie.",
  "Nazwij, komu moglaby pomoc sama prosta probka tego pomyslu.",
  "Stworz najmniejsza wersje: notatke, szkic, liste, rozmowe albo mini material.",
  "Pokaz to jednej bezpiecznej osobie albo zatrzymaj jako wersje robocza i zobacz, czy chcesz do tego wrocic.",
  "Zapisz, co przyszlo latwo, a gdzie pojawil sie opor.",
  "Nazwij najmniejszy kolejny krok, jesli w ogole chcesz go zrobic.",
  "Sprawdz, czy to nadal brzmi jak cos Twojego, czy tylko jak ciekawy pomysl.",
];

const experiments = {
  personal_brand_education: [
    "Wybierz jeden temat, o ktorym naturalnie chcesz mowic albo pisac.",
    "Napisz krotka notatke: co chcialabym, zeby jedna osoba zrozumiala po kontakcie z tym tematem.",
    "Przerob to na mala probke: 5 punktow, mini post, notatke glosowa albo 1 strone PDF.",
    "Pokaz to jednej zaufanej osobie i popros tylko o spokojna reakcje, nie o pelna ocene.",
    "Zapisz, co bylo dla Ciebie zywe, a co brzmialo jak przymus.",
    "Nazwij najlagodniejsza forme kontynuacji: kolejny tekst, rozmowa, mini material.",
    "Sprawdz, czy chcesz do tego wrocic jutro bez zmuszania sie.",
  ],
  mentoring_consulting: [
    "Wybierz jeden problem, przy ktorym naturalnie sluchasz i pomagasz porzadkowac.",
    "Zapisz 5 pytan, ktore pomoglyby komus zrobic maly krok, bez dawania gotowych rozwiazan.",
    "Zapros jedna bezpieczna osobe na krotka rozmowe testowa albo przejdz przez te pytania sama na kartce.",
    "Po rozmowie zapisz, czy czulas wiecej energii czy wiecej ciezaru.",
    "Popros tylko o krotka odpowiedz: co w tej rozmowie bylo pomocne.",
    "Nazwij, jaka forma bylaby dla Ciebie lzejsza: jedna rozmowa, seria pytan, mini sesja.",
    "Zobacz, czy chcesz ten typ kontaktu powtorzyc.",
  ],
  digital_product: [
    "Wybierz jeden maly problem, ktory chcesz uporzadkowac dla kogos innego.",
    "Wypisz 5 pytan albo obaw osoby, ktora ma ten problem.",
    "Stworz mini probke produktu: jedna strone workbooka, checkliste albo szkic PDF.",
    "Pokaz probke jednej bezpiecznej osobie i zapytaj, czy to jest czytelne i pomocne.",
    "Zapisz, czy tworzenie tej rzeczy bylo dla Ciebie zywe czy ciezkie.",
    "Nazwij najmniejsza wersje, ktora ma sens jako kolejny test.",
    "Sprawdz, czy chcesz ja rozwinac, czy zostawic tylko jako sygnal.",
  ],
  physical_aesthetic_product: [
    "Zbierz 6-10 inspiracji, ktore pokazuja klimat rzeczy, jakie chcesz tworzyc.",
    "Wybierz jeden bardzo maly koncept albo mikroprodukt.",
    "Stworz szkic, wizualizacje albo prosty prototyp, bez presji idealnego wykonania.",
    "Pokaz go jednej bezpiecznej osobie i zapytaj, co czuje, kiedy na to patrzy.",
    "Zapisz, czy ten proces bardziej Cie regeneruje czy obciaza.",
    "Nazwij, jaka bylaby najmniejsza nastepna wersja tej rzeczy.",
    "Sprawdz, czy chcesz zrobic druga probe.",
  ],
  behind_the_scenes: [
    "Wybierz typ chaosu, ktory naturalnie lubisz porzadkowac.",
    "Znajdz jeden realny przyklad projektu, procesu albo sytuacji, ktora moglabys ulozyc lepiej.",
    "Stworz mala mape usprawnien albo liste 5 prostych ruchow.",
    "Pokaz jedna bezpieczna osobe ten sposob myslenia i sprawdz, czy brzmi wartosciowo.",
    "Zapisz, czy bardziej czulas ulge z porzadkowania czy ciezar cudzych spraw.",
    "Nazwij najlzejsza forme dalszego testu: audyt, konsultacja, lista usprawnien.",
    "Sprawdz, czy taki tryb pracy nadal brzmi jak cos Twojego.",
  ],
};

export const generateSevenDayExperiment = (pathId) => {
  const path = pathDefinitions.find((entry) => entry.id === pathId) || pathDefinitions[0];
  const tasks = experiments[path.id] || defaultDays;
  return {
    title: `7-dniowy lagodny test: ${path.name}`,
    goal: "Zebrac pierwszy sygnal z praktyki, nie podjac decyzje na cale zycie.",
    days: tasks.map((task, index) => ({
      day: index + 1,
      task,
      reflection: reflectionLine,
    })),
  };
};
