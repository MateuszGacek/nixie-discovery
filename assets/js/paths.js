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
    businessModels: ["projekt po godzinach", "pilotaż", "sprzedaz testowa", "portfolio eksperymentow"],
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

export const generateSuggestedPaths = (scores) =>
  pathDefinitions
    .map((path) => {
      const raw = Object.entries(path.weights).reduce((sum, [key, weight]) => sum + (scores[key] || 0) * weight, 0);
      const matchScore = Math.max(0, Math.round(raw * 10) / 10);
      const strongest = Object.entries(path.weights)
        .filter(([key]) => (scores[key] || 0) > 0)
        .sort((a, b) => (scores[b[0]] || 0) * b[1] - (scores[a[0]] || 0) * a[1])
        .slice(0, 4)
        .map(([key]) => key);
      return {
        ...path,
        matchScore,
        whyItFits: strongest.length
          ? strongest.map((key) => `W Twoich odpowiedziach mocno pojawia sie obszar: ${key}.`)
          : ["Ta sciezka jest hipoteza do sprawdzenia, ale scoring nie wskazal jeszcze mocnych danych."],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

const defaultDays = [
  "Wybierz jeden maly temat albo problem do przetestowania.",
  "Zapisz, komu to mogloby pomoc i dlaczego.",
  "Stworz najprostsza wersje: notatke, liste, szkic albo rozmowe.",
  "Pokaz to jednej zaufanej osobie albo zachowaj jako wersje robocza.",
  "Zbierz feedback albo dopisz, co czujesz po kontakcie z tym pomyslem.",
  "Nazwij minimalna forme dalszego testu.",
  "Ocen energie, sens, opor, ciekawosc i realnosc kontynuacji.",
];

const experiments = {
  personal_brand_education: [
    "Wybierz 3 tematy, o ktorych moglabys mowic bez przygotowania.",
    "Napisz krotka notatke: Co chcialabym, zeby wiecej osob zrozumialo o tym temacie.",
    "Pokaz tekst jednej zaufanej osobie albo zachowaj jako wersje robocza.",
    "Stworz druga tresc w prostszej formie: 5 punktow, historia albo lekcja.",
    "Porozmawiaj z 2 osobami, ktore moglyby byc odbiorcami tego tematu.",
    "Wymysl mini oferte: PDF, konsultacja, warsztat albo seria tresci.",
    "Ocen energie, sens, opor i chec kontynuacji.",
  ],
  mentoring_consulting: [
    "Wybierz jeden problem, w ktorym naturalnie pomagasz.",
    "Stworz 5 pytan, ktore pomoglyby komus uporzadkowac ten problem.",
    "Zapros jedna zaufana osobe na 30-minutowa rozmowe testowa.",
    "Przeprowadz rozmowe bez dawania gotowych rad - sluchaj i porzadkuj.",
    "Popros o feedback.",
    "Zapisz strukture rozmowy.",
    "Ocen, czy mialas energie po rozmowie i czy chcesz to powtorzyc.",
  ],
  digital_product: [
    "Wybierz problem, ktory chcesz pomoc rozwiazac.",
    "Wypisz 10 pytan lub obaw osoby, ktora ma ten problem.",
    "Zaprojektuj mini produkt: PDF, checkliste, workbook albo mini kurs.",
    "Stworz szkic pierwszej strony lub modulu.",
    "Pokaz 2 osobom i zapytaj, czy to byloby pomocne.",
    "Popraw koncept.",
    "Ocen energie i realnosc dalszej pracy.",
  ],
  physical_aesthetic_product: [
    "Stworz moodboard 10 inspiracji.",
    "Wybierz jeden mikroprodukt lub koncept.",
    "Stworz prosty prototyp albo wizualizacje.",
    "Pokaz 3 osobom.",
    "Policz orientacyjny koszt.",
    "Stworz karte produktu: nazwa, opis, cena testowa.",
    "Ocen, czy chcesz zrobic drugi prototyp.",
  ],
  behind_the_scenes: [
    "Wybierz typ chaosu lub problemu, ktory umiesz porzadkowac.",
    "Znajdz przyklad osoby lub projektu, ktoremu moglabys pomoc.",
    "Stworz mini audyt lub liste usprawnien.",
    "Pokaz komus propozycje.",
    "Zapytaj, czy taka pomoc bylaby wartosciowa.",
    "Opisz prosta usluge.",
    "Ocen, czy ten tryb pracy Ci pasuje.",
  ],
};

export const generateSevenDayExperiment = (pathId) => {
  const path = pathDefinitions.find((entry) => entry.id === pathId) || pathDefinitions[0];
  const tasks = experiments[path?.id] || defaultDays;
  return {
    title: `7-dniowy test: ${path.name}`,
    goal: "Zebrac dane z praktyki, nie podjac decyzje na cale zycie.",
    days: tasks.map((task, index) => ({
      day: index + 1,
      task,
      reflection: "Po zadaniu zapisz: energia, sens, opor, ciekawosc, realny odzew.",
    })),
  };
};
