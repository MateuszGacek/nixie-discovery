# Agent Rules — Nixie Reveal

## Golden Rule
NEVER edit HTML to change questions. Only edit `config/phases.js`.

## File Responsibilities
| File | Może edytować agent? | Uwagi |
|------|---------------------|-------|
| config/phases.js | ✅ TAK | Główne miejsce zmian |
| assets/css/*.css | ✅ TAK | Design system |
| assets/js/*.js | ⚠️ OSTROŻNIE | Logika biznesowa — zmiany konsultuj |
| phases/*.html | ❌ NIE | Tylko jeśli dodajesz nową fazę |
| index.html | ⚠️ OSTROŻNIE | Landing page |

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
