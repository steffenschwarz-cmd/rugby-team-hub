# Rugby Team Hub — Gesamtplan

## Context
Digitaler Team Hub für Steffens Rugby-Mannschaft. Enthält Kader, Aufstellung, Mannschaftsrat, und das Playbook (Spielzüge, Trainingsplan, Videos). Steffen ist Trainer, alles wird über eine Firebase Realtime Database synchronisiert.

**Seit 04.09.2026: EIN Team.** Die beiden Mannschaften (1. XV / 2. XV) sind zusammengelegt, der Verein spielt nur noch als „SG Oberhavel" in der **Regionalliga Ost**. Die 2. Bundesliga Nord/Ost ist Geschichte — überall dort, wo in älteren Changelog-Einträgen von zwei Mannschaften oder der Bundesliga die Rede ist, beschreibt das den damaligen Stand. Kader: 44 Spieler, Mannschaftsrat: 4 Mitglieder.

## Zugang
Seit 28.02.2026 individuelle Zugangscodes pro Spieler (PBKDF2) mit drei Rollen: `team`, `rat`, `trainer`.
Das alte Team-Passwort und die alte Trainer-PIN sind ungültig.

- **Konkrete Codes/Passwörter**: ausschließlich in `ZUGANGSDATEN.md` (steht in `.gitignore`, gehört NICHT hierher — dieses Repo ist öffentlich)
- **Trainingsplan**: komplett hinter dem Trainer-Gate (Spieler sehen die Seite nicht)
- **Accounts verwalten**: Trainer-Ansicht auf `kader.html` (anlegen, Rolle ändern, Code zurücksetzen, deaktivieren)

## Seiten-Übersicht

| Seite | Datei | Status | Beschreibung |
|-------|-------|--------|--------------|
| Startseite | index.html | Fertig | Navigation, Countdown „Nächstes Spiel", Regionalliga-Spielplan + Tabelle aus `data/liga.json`, nächste Termine |
| Kader | kader.html | Fertig | Spielerliste mit Fotos (44 Spieler seit 04.09.2026) |
| Aufstellung | aufstellung.html | Fertig | Drag&Drop Aufstellung |
| Mannschaftsrat | mannschaftsrat.html | Fertig | Abstimmungen (4 Ratsmitglieder seit 04.09.2026) |
| Spielzüge | spielzuege.html | Fertig | Animierte Spielzug-Visualisierung (Canvas) |
| Trainingsplan | trainingsplan.html | Fertig | Trainingsplanung (nur Trainer) |
| Videos | videos.html | Fertig | Video-Bibliothek |
| Beteiligung | trainingsbeteiligung.html | Fertig | Anwesenheit Training & Spiele; Ranking ohne Ehemalige, Einheiten-Karten mit voller Historie |
| Übungen | uebungen.html | Fertig | Drill & Warm-Up Bibliothek (Canvas) |

## Fortschritt — Playbook

| Schritt | Status | Datum |
|---------|--------|-------|
| Navigation in 4 bestehenden Seiten updaten | Fertig | 22.02.2026 |
| videos.html bauen | Fertig | 22.02.2026 |
| trainingsplan.html bauen | Fertig | 22.02.2026 |
| spielzuege.html bauen | Fertig | 22.02.2026 |
| Trainingsplan nur für Trainer sichtbar | Fertig | 22.02.2026 |
| Cross-References zwischen Seiten | Fertig | 22.02.2026 |
| Testen auf Laptop + Handy | Fertig | 22.02.2026 |
| Formationen & Ball-Carrier-Auswahl | Fertig | 22.02.2026 |
| Pass-Animation (Ball fliegt rückwärts, gerade Linie) | Fertig | 23.02.2026 |
| Nahtlose Phasen-Übergänge (kein Stocker) | Fertig | 23.02.2026 |
| Viererraute "Salz" + "Pfeffer" aus Ruck | Fertig | 01.03.2026 |
| Weitere Startformationen (22er Ports etc.) | Offen | — |
| trainingsbeteiligung.html bauen | Fertig | 23.02.2026 |
| Navigation in allen Seiten: Beteiligung-Link | Fertig | 23.02.2026 |
| uebungen.html bauen (Drill-Bibliothek mit Canvas) | Fertig | 25.02.2026 |
| Navigation in allen Seiten: Übungen-Link | Fertig | 25.02.2026 |
| Erster Drill: "Ball-Klau" (Warm-Up) als Seed | Fertig | 25.02.2026 |
| 6 weitere Warm-Up Drills + Farb-Zonen + kontextabhängige Legende | Fertig | 26.02.2026 |
| CSS-Refactoring: common.css für alle 9 Dark-Theme-Seiten | Fertig | 28.02.2026 |
| 7 weitere Warm-Up Drills (Jailbreak, Schnappball, One-Hand, Double Touch, 2-Bälle Touch, Breakout Circle, Atom-Spiel) | Fertig | 03.03.2026 |
| SpielerPlus-Integration (weitere Screenshots) | Offen | — |
| 6 Entscheidungs-Drills (neue Kategorie "Entscheidung") + Quellen-Links pro Drill | Fertig | 29.07.2026 |
| Saison-Sync 2026/27: Liga-Ergebnisse + SpielerPlus automatisch (GitHub Actions täglich) | Fertig | 29.07.2026 |
| Saisonwechsel-Reste index.html bereinigt (Ziele raus, Termine = Spiele, Trainings-Zählung Mi+Fr) | Fertig | 29.07.2026 |
| Neue Saisonziele 2026/27 eintragen (Sektion aktuell entfernt, wartet auf Steffens Ziele) | Offen | — |
| Trainings wieder in "Nächste Termine" (Rhythmus seit 04.08.: Di 19:00 HN + Fr 18:30 Hennigsdorf) | Fertig | 02.08.2026 |
| Zusammenlegung auf ein Team: Kader 60 → 44, Mannschaftsrat 6 → 4, Login-Deaktivierung | Fertig | 04.09.2026 |
| Trainingsbeteiligung: Ranking ohne Ehemalige, Historie vollständig (`EHEMALIGE`-Set) | Fertig | 04.09.2026 |
| index.html + sync-liga.js auf Regionalliga Ost reduziert (2. Bundesliga raus) | Fertig | 04.09.2026 |
| Vice-Captain-Posten neu besetzen (2 frei seit 04.09.) | Offen | — |

### Changelog
- **04.09.2026**: ZUSAMMENLEGUNG AUF EIN TEAM. Die beiden Mannschaften sind fusioniert — der Verein spielt nur noch als „SG Oberhavel" in der **Regionalliga Ost**, aus der 2. Bundesliga Nord/Ost ist er raus (der Liga-Sync bestätigte das unabhängig: 0 eigene Spiele, kein eigener Tabellenplatz mehr). (1) **Kader 60 → 44**: 16 Spieler entfernt (Ben Johnston, Connor Peise, Felix Berg, Fabian Wendt, Florian Neumann, Fynn Lauer, Hannes Bartelt, Jonas Hinz, Keno Filietz, Luca Karim Borgwardt, Lucas Eichler, Oliver Herrmann, Paul Chukwu, Sascha Kosanke, Tom König, Tom Lebus) aus `kader.html`, `aufstellung.html`, `mannschaftsrat.html` (players + members), `common.js` (KADER) und `trainingsbeteiligung.html` (KADER_IDS). In `scrape-spielerplus.js` wurden die NAME_MAP-Aliase der 15 dort gemappten Spieler auf `null` gesetzt (= Import überspringt sie) statt gelöscht — `resolveName()` hat einen Prefix-Match-Fallback und würde einen gelöschten Namen sonst as-is durchreichen oder falsch zuordnen; Oliver Herrmann stand gar nicht in der NAME_MAP. Steffens Entscheidung: **Historie bleibt**, keine Beteiligungsdaten gelöscht. Nebenfix: Die vier Spielerlisten waren vorher nicht deckungsgleich (in `mannschaftsrat.html` fehlten Julius Kayser id 71 und Simon Reichelt id 69, in `aufstellung.html` Julius Kayser) — ergänzt, jetzt stehen alle vier bei 44. (2) **Mannschaftsrat 6 → 4**: Jonas Hinz (Vice-Captain) und Tom Lebus raus, Posten bleiben vorerst unbesetzt; verblieben Rico Schomacker (Captain), Lukas Laetsch (VC), Anton Hanetzok (VC), Theo Schmidt — betrifft `mannschaftsrat.html` und den `sec-rat`-Block in `index.html` (dort zusätzlich Steffen Schwarz als Trainer). (3) **Login**: Von den 16 hatte nur Jonas Hinz einen eigenen Firebase-Account (Rolle `rat`), der steht jetzt auf `active:false` — in der Trainer-Accountverwaltung als „Inaktiv" mit Aktivieren-Button sichtbar, also reversibel. Insgesamt gibt es nur 3 Accounts (Steffen, Lukas Laetsch, Jonas Hinz), der Rest läuft über Selbstregistrierung mit dem Team-Passwort. (4) **Trainingsbeteiligung — Ranking vs. Historie getrennt**: neues `EHEMALIGE`-Set mit den 16 Namen; `buildRoster()` filtert sie aus `allPlayers`, `renderStats()` zählt für den Beteiligungs-Schnitt nur noch anwesende Spieler, die im aktuellen Roster stehen (sonst verzerrt, weil `present` die Ehemaligen weiter enthält). Gemessen: Ranking 39 → 35 Spieler, Schnitt 36 % → 37 %; die Einheiten-Karten zeigen die Ehemaligen weiter. Bewusst als Ausschlussliste gebaut (nicht als KADER-Whitelist), damit noch nicht eingepflegte Neuzugänge nicht unsichtbar werden. (5) **`index.html` auf ein Team** (1670 → 1523 Zeilen): ein Countdown „Nächstes Spiel" statt zwei, BL-Spielplan- und Tabellensektion raus, Regionalliga ist Hauptsektion, eine Mannschaftskarte („SG Oberhavel / Regionalliga Ost", Spiele-Anzahl jetzt dynamisch aus liga.json statt hartcodiert), BL/RL-Badges aus „Nächste Termine" raus, Footer-Link auf bits-rugby-ls.de. IDs entkoppelt (`*-rl` → ohne Suffix, `gamesRL` → `games`), CSS-Reste (`.badge-bl`, `.liga-bl/-rl`, `.countdown-section.rl`) entfernt, blaue RL-Optik ist jetzt Basis. `shortTeam()` kürzt zusätzlich Liga-Suffix und Rechtsform, weil die bits-Quelle Namen wie „Berliner Sport-Club e.V. Männer Regionalliga Ost" liefert. (6) **`sync-liga.js` auf Regionalliga reduziert** (16,5 → 11,6 KB): der komplette rugbydeutschland.org-Parser (Next.js-Flight-Payloads, Liga 2162, Team 322278) ist ersatzlos raus, `data/liga.json` hat nur noch `updatedAt` + `rl`. Der harte Exit-1-Guard ist von der BL auf die RL umgezogen, aber mit neuer Grenze **strukturell vs. saisonal** — Exit 1 nur bei Netzwerk-/HTTP-/JSON-Fehler oder wenn `search=Oberhavel` gar kein Team liefert (= API-Bruch/Umbenennung); Saison-Term noch nicht angelegt / Team noch nicht eingetragen / Liga aufgelöst mit 0 Spielen geben Exit 0 + `hinweis` auf **stdout** (nicht stderr, sonst färbt GitHub Actions den Lauf rot). Leere `tabelle[]` löst nie einen Hinweis aus (vor dem ersten Spieltag Normalzustand); `getJson()` fängt jetzt zusätzlich JSON-Parse-Fehler mit URL im Text ab. Alle RL-Gotchas unverändert (League-ID saisonabhängig → dynamische Auflösung, `main_results` leer = ungespielt, Matching nur über `teams[]`-IDs, keine npm-Deps). `.github/workflows/season-sync.yml` blieb unverändert — enthält nichts BL-Spezifisches. (7) **Cache-Bust** `common.js`/`common.css` von `?v=8` auf `?v=9` in allen HTML-Seiten. Getestet: `node sync-liga.js` Exit 0 mit 5 Spielen / 0 Tabellenzeilen (Saison startet erst), zweiter Lauf schreibt nicht neu, alle drei Fehlerpfade (kaputter Host / leerer Suchtreffer / HTTP 404) → Exit 1, über `SEASON_START_YEAR=2025` gegengetestet, dass der Parser auch echte Ergebnisse zieht (11 Spiele, 12 Tabellenzeilen); Playwright gegen lokalen Server mit Trainer-Session: index.html 0 JS-Fehler + Countdown + 5 Spielplan-Einträge + „Tabelle noch nicht verfügbar", kader.html 44 Karten, trainingsbeteiligung.html Ranking 35 Zeilen ohne Ehemalige bei vollständiger Historie in den Einheiten-Karten, mannschaftsrat.html bietet nur noch die 4 verbliebenen Ratsmitglieder; alle Inline-Scripts mit `node --check` geprüft.
- **26.08.2026**: RECRUITING-GRAFIK NEUAUFLAGE für Facebook (`recruiting/front-row-wanted-2026-09.png` + `-source.html`, 1080×1350 @2x): Nachfolger von `players-wanted-2026.png` (11.07.), diesmal auf drei Prämissen zugespitzt — (1) roter Kick-off-Balken „Season kick-off · Sat 5 September 2026" ganz oben als Dringlichkeits-Anker, (2) NUR erste Reihe (1 Loosehead Prop / 2 Hooker / 3 Tighthead Prop) statt der fünf Positionen vorher, (3) grün gerahmte Voraussetzungs-Box „EU / EEA passport required — we cannot sponsor visas". Angebot (Accommodation/Flights/Salary Minijob) und CTA unverändert; Player-Coach-Zeile entfernt, damit die Positionsbotschaft eindeutig bleibt. Render-Rezept: Playwright-Screenshot (`node_modules` liegen im iCloud-Projektroot → `NODE_PATH` setzen), viewport 1080×1350, deviceScaleFactor 2. ⚠️ Chrome `--headless=new --screenshot` hängt auf dem Mac (2-min-Timeout) — Playwright nehmen.
- **19.08.2026**: SAISON-SYNC REPARIERT (SpielerPlus-Job war am 19.08. rot). Ursache 1 — Race-Condition im Login: `scrape-spielerplus.js` wartete nach dem Login-Klick starr 3 s und prüfte dann auf `select-team`; auf dem langsameren GitHub-Runner war die Weiterleitung da noch nicht durch, der Handler wurde übersprungen, und das folgende `waitForURL('**/dashboard/**')` lief zwangsläufig in den Timeout — SpielerPlus leitet von der Team-Auswahl NICHT selbst weiter. Fix: `waitForURL` auf dashboard ODER site/select-team (30 s), danach Dashboard-Ansteuerung als Retry-Schleife (3 Versuche) statt Einmal-if, plus Titel-/Fehlertext-Diagnose vor dem Abbruch. Ursache 2 — `npx playwright install --with-deps chromium` blieb am selben Tag zweimal >25 min in der apt-Phase hängen (sonst ~40 s); ohne Job-Timeout wäre das bis zum 6-h-Default gelaufen. Fix in `season-sync.yml`: Job `timeout-minutes: 25`, Install-Step 12 min, `--with-deps` hart auf 6 min begrenzt mit Fallback auf `playwright install chromium` (ohne System-Deps) + `DEBIAN_FRONTEND=noninteractive`. Verifiziert: manueller Run 32235068260 grün, Fallback hat gegriffen, 46 Spieler / 11 Sessions gescraped, 9 Sessions nach Firebase gepusht.
- **03.08.2026 (2)**: 9 KICK-SPIELZUG-VORLAGEN aus dem „German Defence"-Deck als `SEED_PLAYS` in spielzuege.html (Name-Check-Migration nach Firebase wie bei den Drills, inkl. Dedup nur über Seed-Namen + Einmal-Flag gegen value-Listener-Races — beim ersten Test entstanden 45 Duplikate, Dedup räumt das selbst auf): Birdie, RHS Arrow, 49 Tiger Bomb, 56 Bulldoze Birdie (5 Phasen mit Carry), 49 Dingaan Birdie + 49 Bull Birdie (Gassen-Exits, 5 Phasen), LHS Buffalo, MS Park Birdie, Melbourne. Jede Vorlage: volle XV, 3–5 Phasen, Kick-Phase mit neuem kickTo/kickType, Landephase, deutsche Phasen-Notizen. Neue Kategorie „kick" (Chip, Filter, Formular, Badge-Farbe hellblau) + „Duplizieren"-Button pro Spielzug-Karte (Vorlagen-Workflow: kopieren → anpassen; Backlog-Punkt Spielzug-Vorlagen erledigt). Getestet via Playwright gegen Live-Firebase.
- **03.08.2026**: KICK-VISUALISIERUNG in spielzuege.html (Backlog-Punkt erledigt): Pro Phase kann der Ballträger jetzt statt eines Passes einen Kick spielen — `ball.kickTo` (Empfänger/Jäger) + `ball.kickType` (hoch/grubber/lang). Editor: neue Dropdowns „Kick an:" + Kick-Art (nur sichtbar wenn Kick gesetzt); Pass und Kick schließen sich gegenseitig aus; Folgephase bekommt den Kick-Empfänger automatisch als Carrier. Statische Ansicht: gebogene blaue gestrichelte Linie mit Pfeil + Label (Hoher Ball/Grubber/Langer Kick). Animation: hoher Ball mit Parabel (Ball skaliert + Schatten am Boden, Landung bei 85 % der Phase), langer Kick flacher (75 %), Grubber taumelt mit Hüpfern am Boden (65 %); Kicks dürfen — anders als Pässe — nach vorne gehen. Getestet per Playwright (Trainer-Session + lokaler Test-Spielzug, Screenshots hoch/grubber ok). Alte Spielzüge unverändert (Feld optional).
- **02.08.2026 (3)**: „German Defence"-Deck (Sharks-System, 62 Folien + 15 Videos) ausgewertet: Komplette deutsche Übersetzung inkl. Video-Spielzug-Beschreibungen und 11 eingebetteten Original-Diagrammen als ~/Downloads/German-Defence-Uebersetzung.html (bewusst NICHT im Repo — fremdes Coaching-Material, Repo ist öffentlich). Daraus 8 neue Startformationen in spielzuege.html (FORMATIONS + Dropdown): restart_50/restart_22/restart_goal (Anstoß-Annahmen) + scrumd_lhs_small/lhs_big/mitte/rhs_big/rhs_small (Scrum-Defence-Aufstellungen).
- **02.08.2026 (2)**: Trainingsrhythmus zurück auf Di+Fr (Steffen, „ab jetzt wieder di und fr"): countTrainings auf Di+Fr umgestellt, synthetische Trainings-Generierung in „Nächste Termine" wieder aktiviert mit den alten Zeiten/Orten (Di 19:00 Hohen Neuendorf + Stammtisch, Fr 18:30 Hennigsdorf, 1. Freitag im Monat = Teamabend/training-social). Badge-Rendering für training/training-social war noch vorhanden.
- **02.08.2026**: Trainingseinheit Di 04.08. (19:00, Hohen Neuendorf, 120 min) im Trainingsplan angelegt — Fokus „Passen unter Druck → erster Kontakt": Passstaffel mit Hütchen-Ansage → Farbsignal-Pass (2 auf 3/4) → Farb-Scan-Touch → Kontakt-Kondi Schild-Schieben (3er-Gruppen, 45 s) → Tackle-Progression → Ruck-Clear-out → Cool-down. Dafür 5 neue Drills in uebungen.html (SEED_DRILLS) + Firebase: „Passstaffel mit Hütchen-Ansage" (handling, erster Drill dieser Kategorie), „Farbsignal-Pass (2 auf 3 oder 4)" (entscheidung), „Schild-Schieben (Kontakt-Kondi 1v1)" (kondition, erster Drill dieser Kategorie, ohne Ball — Renderer verkraftet das), „Tackle-Technik 1v1 (Progression)" + „Ruck: Ablage + Clear-out (1+1)" (kontakt, erste Kontakt-Drills). Insgesamt jetzt 25 Drills. Session + Drills per Skript (Anonymous-Auth-REST wie scrape-spielerplus.js) direkt in Firebase geschrieben, Blocks mit drillRef verknüpft.
- **29.07.2026 (Nachmittag)**: Saisonwechsel-Feinschliff: (1) Neuer Spieler Julius Kayser (id 71, Jg. 2009, 3. Reihe/Flanker, U18, SpielerPlus-Name „Schmarni (JFK)") in kader.html, KADER (common.js → ?v=8-Bump überall), beide NAME_MAPs + Firebase players_meta/71. (2) Veraltete Saisonziele-Rückrunden-Sektion komplett entfernt (kommt neu, wenn Steffen Ziele 2026/27 definiert); Teams-Karten neutralisiert; „Nächste Termine" zeigt jetzt Spiele aus data/liga.json bis Saisonende (synthetische Trainings-Generierung mit altem Di+Fr-Rhythmus entfernt — echter Rhythmus ist Mi+Fr, Zeiten/Orte offen); countTrainings auf Mi+Fr; Kader-Header 2026/27. (3) Design: CATS-Kategoriefarben in uebungen.html abgedunkelt (weißer Badge-Text jetzt WCAG-tauglich), drawZones akzeptiert rgba-Farben (Mittellinien-Bug Touch Rugby 2 Bälle behoben), Beteiligungs-Podium mit Gold/Silber/Bronze-Gradient-Medaillen.
- **29.07.2026**: SAISON-SYNC 2026/27 (GitHub Actions, täglich 05:30 UTC + manuell): (1) `sync-liga.js` holt Spielplan/Ergebnisse/Tabellen ohne npm-Deps — 2. Bundesliga Nord/Ost von rugbydeutschland.org (Next.js-Flight-JSON im HTML, Liga 2162, ohne Saison-ID = aktuelle Saison; Zeitzonen-Falle: start_date-Offset ist gelogen, Zeit = Ortszeit; "gespielt" = score1 vorhanden, completed-Flag unbrauchbar), Regionalliga von bits-rugby-ls.de (offene SportsPress-REST-API, League-ID saisonabhängig → dynamische Auflösung über /teams?search=Oberhavel; Saison 2026/27 dort noch nicht angelegt → leerer Normalzustand, füllt sich automatisch). Ergebnis: `data/liga.json` im Repo (Firebase-Regeln blocken neue Pfade), Actions-Job committed bei Änderung. (2) index.html rendert Saison-Badge, Spielpläne, Tabellen, Nächstes-Spiel-Karten + Countdown aus data/liga.json (Platzhalter als file://-Fallback); RL-Quelllink von totem rl-no.de auf bits-rugby-ls.de. (3) `scrape-spielerplus.js`: SEASON_START-Filter (22.07.2026), Jahres-Inferenz statt hartem YEAR, Secrets via Env (GitHub: SPIELERPLUS_EMAIL/PASSWORD), CI-Chromium via SP_BROWSER_CHANNEL; NAME_MAP +'Lukas R'/+'Berni'(skip). (4) `season-reset.js`: 20 Alt-Sessions nach `trainingsbeteiligung-archiv-2025-26.json` archiviert, /trainingsbeteiligung startet bei null; erste 3 neue Sessions (22./24./29.07.) live. Risiko dokumentiert: bits-rugby-ls.de ist privat/inoffiziell — einzige maschinenlesbare RL-Quelle.
- **22.02.2026**: Alle 3 Seiten erstellt, Navigation in allen bestehenden Seiten ergänzt
- **22.02.2026**: Trainingsplan hinter Trainer-PIN-Gate gesetzt (nur Steffen sieht die Seite)
- **22.02.2026**: Cross-References: Trainingsplan-Blöcke können Spielzüge & Videos verknüpfen
- **22.02.2026**: Spielzüge: Gedränge-Formation korrigiert (1,2,3 oben), Ball-Icon sichtbar, Startformationen (Offen/Scrum/Lineout/Backs/Forwards), Spieler hinzufügen/entfernen im Editor
- **23.02.2026**: Pass-Animation: Ball fliegt als gerade Linie rückwärts (Rugby-Regel), Abwurf bei 15% / Fang bei 55% der Phasendauer
- **23.02.2026**: Nahtlose Phasen-Übergänge: Überschuss wird mitgenommen, lineare Spielerbewegung statt easeInOut
- **23.02.2026**: Trainingsbeteiligung-Seite: Anwesenheit bei Training & Spielen, Ranking-Tabelle, Einheiten-Übersicht, Seed-Daten vom 18.02. und 20.02.
- **23.02.2026**: Kader ↔ Beteiligung verknüpft: Klickbare Namen in Beteiligung → springt zum Spieler im Kader (mit Highlight). Kader zeigt Training-/Spiel-Statistik pro Spieler.
- **25.02.2026**: Übungsbibliothek (uebungen.html): Separate Drill-Seite mit Canvas-Visualisierung, Kategoriefilter, Trainer-Modus (CRUD, Drag&Drop), Firebase-Persistenz. Erster Drill: "Ball-Klau" (Warm-Up). Navigation in allen 8 bestehenden Seiten aktualisiert.
- **26.02.2026**: 6 weitere Warm-Up Drills: Ball-Klau (2 Bälle), Endzone, Schwänzchen-Fangen, Rondo (Rugby), Sumo-Ring, King of the Hill. Farbige Zonen (grün für Endzone), kontextabhängige Legende (Ball/Kegel/Passweg/Sperrzone nur wenn vorhanden), automatische Seed-Migration in Firebase.
- **28.02.2026**: CSS-Refactoring: Gemeinsame Styles aus 9 Dark-Theme-Seiten in `common.css` ausgelagert. 920 Zeilen Duplikation entfernt, 121 Zeilen zentral. Vorteil: Farben, Navigation, Login, Header, Footer etc. müssen nur noch an einer Stelle geändert werden statt in 9 Dateien.
- **01.03.2026**: Viererraute-Formationen aus dem Ruck: "Salz" (9 direkt an Raute, ohne Verbinder) und "Pfeffer" (mit Verbindungsspieler 10 zwischen 9 und Raute). Raute-Positionen: 1=Spitze vorne, 2=links, 3=rechts, 4=hinten.
- **01.03.2026**: Koordinaten Rugby-regelkonform korrigiert: Alle Raute-Positionen hinter der Ruck-Linie (größere y-Werte), kein Forward-Pass möglich. Ruck links auf dem Feld (x=0.28, y=0.45), Raute rechts daneben. Salz: 9 bei (0.28,0.52), Raute bei y=0.52–0.68. Pfeffer: zusätzlich Verbinder 10 bei (0.40,0.54), Raute bei y=0.54–0.70.
- **03.03.2026**: 7 weitere Warm-Up Drills via Agententeam (Researcher + Planner + Builder + Kontrolleur): Jailbreak (Kreis-Ausbruch mit Two-Hand Touch), Possession Game/Schnappball (5v5, 10 Pässe), One-Hand Possession (einhändiges Handling), Double Touch (2 verschiedene Touches), Touch Rugby mit 2 Bällen (simultanes Angreifen), Breakout Circle (physischer Kreisdurchbruch), Atom-Spiel (Gruppen bilden auf Zuruf). Insgesamt jetzt 14 Warm-Up Drills.
- **29.07.2026**: LIGHT-THEME-UMSTELLUNG der gesamten Website (13 Seiten + common.css) via Agententeam (3 Developer parallel). Neue Palette in common.css (:root): heller Grund #eef2f6, weiße Karten, dunkler Text #1a2733, Akzente auf Vereinsfarben abgedunkelt (--accent #1b8a3e, --accent-blue #1a5fb4, --warning #b57708, --danger #d03030, --success #2e9e4f). Alle rgba(255,255,255,x)-Ränder/Hover auf rgba(0,0,0,y) gedreht, Modal-Overlays aufgehellt, Schatten auf blaustichige Light-Schatten. Canvas: Umgebung hell (#dce5ed), Spielfeld-Grün frischer (#3e8e57), Feldlinien-Alphas angehoben. Cache-Bust common.css?v=8 in allen Seiten. Nicht angefasst: meeting-agenda.html + rugby-warmup-guide.html (Standalone-Einzeldokumente ohne common.css). Verifiziert per Headless-Chrome-Screenshots aller Seiten nach Login.
- **29.07.2026**: Neue Kategorie "Entscheidung" (#1abc9c) mit 6 spielbasierten Entscheidungs-Drills: Entscheidungs-Wellen (3v2/3v1 mit Trainer-Call), Farb-Scan-Touch (Farbe rufen vor dem Pass), Türchen-Spiel/Gate Game (Tore mit Punktwerten), Offload-Touch (2-Sekunden-Entscheidung), Unterzahl-Touch (6v4 gegen Drift), Breakout mit Zahlen-Call (Chaos-Start). Neu: `sources`-Feld pro Drill — Quell-Links (Rugby Coach Weekly, Sportplan, Rugby Toolbox) werden im Drill-Info-Panel als "Quellen"-Liste angezeigt. Insgesamt jetzt 20 Drills.

## Offene Ideen / Backlog

### Offene Punkte (Stand 04.09.2026)
- **`permission_denied at /lineup_history`** auf `aufstellung.html`: Die Firebase-Regeln geben den Pfad nicht frei, Speichern/Laden der Aufstellungs-Historie funktioniert deshalb nicht. Gegengeprüft mit der unveränderten Version aus HEAD — identischer Fehler, also **Bestandsproblem**, nicht von der Zusammenlegung verursacht. Fix = Pfad in den Firebase-Rules freigeben.
- **Nicht eingepflegte Spieler**: „Henri" taucht in der Trainingsbeteiligung auf (anwesend in 3 von 17 Einheiten, u.a. am 04.09.), steht aber in keiner Kaderliste und in keiner NAME_MAP — vermutlich Neuzugang, Nachname bei Steffen offen. Analog fehlt „Mateusz Grzelak" (in der NAME_MAP gemappt) im KADER-Array. Ebenfalls Bestand, nicht durch die Zusammenlegung entstanden.
- **DSGVO — `players_meta`**: In Firebase liegen für 15 der ausgeschiedenen Spieler noch Geburtsdaten (`geb`), die nirgends mehr angezeigt werden. Steffen wurde gefragt, Entscheidung (löschen vs. aufbewahren) steht aus.

### Weitere Startformationen
- **Viererraute** (Diamond): 4 Spieler in Rautenformation
- **22er Ports mit Viererraute und Dreier-Position**: Spezifische Formation für 22m-Restarts
- Weitere Formationen per Spracheingabe beschreiben → Steffen spricht Vorgaben rein

### SpielerPlus-Integration — Trainingsbeteiligung & Spielstatistik
- Steffen schickt **Screenshots von SpielerPlus** → Daten werden ausgelesen
- Pro Spieler erfassen:
  - Anzahl Trainingseinheiten (anwesend / gesamt)
  - Trainingsquote in Prozent
  - Anzahl Spiele (anwesend / gesamt)
  - Spielquote in Prozent
- Übersicht als Tabelle/Ranking im Team Hub (eigene Seite oder Erweiterung von kader.html)
- Historischer Verlauf über die Saison
- Firebase-Pfad: `/trainingsbeteiligung`

### Playbook-Erweiterungen
- Gegnerische Spieler (andere Farbe) für Verteidigungsszenarien
- Export als GIF/Video für WhatsApp-Gruppe

## Technische Architektur

### Stack
- Standalone HTML mit Inline JS (kein Build-Tool)
- Gemeinsame CSS-Styles in `common.css`, seitenspezifische Overrides inline
- Firebase Compat SDK v10.14.1 (app + auth + database)
- Anonymous Auth nach Team-Login
- LocalStorage als Offline-Fallback
- Helles Design (Light Theme) mit CSS Custom Properties — Umstellung 29.07.2026, vorher Dark
- Responsive (Mobile + Desktop)

### Firebase-Config
```javascript
firebase.initializeApp({
    apiKey: "AIzaSyAuHnKJHDOQ5y9nUbmZQV9UlSKO2LQqbvc",
    authDomain: "rugby-team-hub.firebaseapp.com",
    databaseURL: "https://rugby-team-hub-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rugby-team-hub",
    storageBucket: "rugby-team-hub.firebasestorage.app",
    messagingSenderId: "484420740610",
    appId: "1:484420740610:web:65c1dbf3aadb985281e91b"
});
```

### Firebase Datenbank-Struktur
```
rugby-team-hub/
  videos/
    -NxAbc123/
      title, url, platform, category, description, createdAt
  trainingsplaene/
    -NxDef456/
      date, startTime, duration, location
      blocks/
        0/ { name, type, duration, description, playRef?, videoRef? }
  spielzuege/
    -NxGhi789/
      name, category
      phases/
        0/ { players: {9: {x,y}, 10: {x,y}...}, ball: {carrier, passTo}, notes }
```

### Spielzug-Animation (spielzuege.html)
- Normalisierte Koordinaten (0.0–1.0) für Auflösungsunabhängigkeit
- `requestAnimationFrame` mit linearer Interpolation für nahtlose Phasen-Übergänge
- Pointer Events API (unified touch + mouse) für Editor
- `touch-action: none` auf Canvas um Scroll-Konflikte zu vermeiden
- devicePixelRatio-Skalierung für Retina-Displays
- Pass-Animation: Gerade Linie, Ball fliegt von Abwurfposition (15%) zu Fangposition (55%)
- Spieler bewegen sich durchgängig (0%→100%), Pass passiert während der Laufbewegung
- 5 Startformationen: Offen, Scrum, Lineout, Backs, Forwards
- Spieler hinzufügen/entfernen pro Phase

### Muster für neue Seiten
Jede Seite folgt dem gleichen Template:
1. `<link rel="stylesheet" href="common.css">` im Head einbinden
2. Login-Gate mit gehashtem Zugangscode (Klartext nur in ZUGANGSDATEN.md)
3. Trainer-Bar mit PIN-Eingabe (PIN nur in ZUGANGSDATEN.md)
4. Seitenspezifische CSS-Overrides im `<style>`-Tag (z.B. Container-Breite)
5. Firebase Init + Anonymous Auth
6. CRUD-Operationen über Firebase Realtime Database
7. LocalStorage-Fallback
8. Responsive Grid/Cards
