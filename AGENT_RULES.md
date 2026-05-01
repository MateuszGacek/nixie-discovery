# Agent Rules — Nixie Discovery

## Golden Rule
NEVER edit HTML to change questions. Only edit `config/phases.js`.

## File Responsibilities
| File | Może edytować agent? | Uwagi |
|------|---------------------|-------|
| config/phases.js | ✅ TAK | Główne miejsce zmian |
| assets/css/*.css | ✅ TAK | Design system |
| assets/js/*.js | ⚠️ OSTROŻNIE | Logika biznesowa — zmiany konsultuj |
| phases/*.html | ❌ NIE | Tylko jeśli dodajesz nową fazę |
| fit/*.html | ✅ TAK | Oddzielna gałąź Strefy Fit |
| index.html | ⚠️ OSTROŻNIE | Landing page |

## Strefa Fit
- Strefa Fit jest oddzielną gałęzią aplikacji w katalogu `fit/`.
- Wejście z home obsługuje komponent `assets/js/fit-zone-button.js`; używaj go ponownie w tej gałęzi zamiast tworzyć podobny przycisk od zera.
- Design Strefy Fit używa własnych tokenów w `assets/css/tokens.css`: `--fit-warm-shell`, `--fit-clay-soft`, `--fit-porcelain`, `--fit-clay`, `--fit-blue-soft`, `--fit-mist`, `--fit-ink`, `--fit-ink-soft`.
- Style aplikacji Strefa Fit rozwijaj w `assets/css/fit.css`; globalne `components.css` ruszaj tylko dla komponentów współdzielonych jak `fit-zone-button`.
- Kierunek wizualny Strefy Fit: loftowy, surowy, techniczny, z cienkimi liniami, gridem, matowymi powierzchniami i spokojną typografią. Paleta kolorów nie oznacza wzoru w paski.
- Strefa Fit jest mobile-first; każda zmiana musi dobrze działać na telefonie przed dopracowaniem desktopu.
- Nie dodawaj fake danych, przykładowych statystyk ani tekstów placeholderowych w Strefie Fit. Lepiej zostawić czystą strukturę sekcji do późniejszego uzupełnienia.
- Nie mieszaj kolorów głównego procesu Nixie ze Strefą Fit, chyba że chodzi o globalne elementy wspólne jak reset, typografia lub layout.
- Funkcje treningowe, plany treningowe i progres rozwijaj w `fit/` oraz w dedykowanych komponentach `fit-*`.

## Dodawanie nowej fazy (Phase 7+)
1. Dodaj entry w `config/phases.js`
2. Skopiuj `phases/phase6.html` → `phases/phase7.html`
3. Zmień tylko `<title>` i ewentualnie meta description
4. Dodaj link w nawigacji (`assets/js/navigation.js`)
5. Gotowe.

## Dodawanie nowego typu pytania
1. Dodaj obsługę w `assets/js/ui.js` → `renderQuestion()`
2. Dodaj style w `assets/css/components.css`
3. Dodaj walidację w `assets/js/form.js` jeśli potrzebna

## Debugowanie
- Stan: `JSON.parse(localStorage.getItem("nixie_answers"))` w konsoli
- Wyczyść: `localStorage.removeItem("nixie_answers")`
