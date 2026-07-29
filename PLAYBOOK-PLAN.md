# Rugby Team Hub — Gesamtplan

## Context
Digitaler Team Hub für Steffens Rugby-Mannschaft. Enthält Kader, Aufstellung, Mannschaftsrat, und das Playbook (Spielzüge, Trainingsplan, Videos). Steffen ist Trainer, alles wird über eine Firebase Realtime Database synchronisiert.

## Zugang
- **Team-Login**: Passwort `RatPack#26` (SHA-256 gehasht)
- **Trainer-PIN**: `7831` — schaltet Bearbeitungsmodus frei
- **Trainingsplan**: Komplett hinter Trainer-PIN-Gate (Spieler sehen die Seite nicht)

## Seiten-Übersicht

| Seite | Datei | Status | Beschreibung |
|-------|-------|--------|--------------|
| Startseite | index.html | Fertig | News & Navigation |
| Kader | kader.html | Fertig | Spielerliste mit Fotos |
| Aufstellung | aufstellung.html | Fertig | Drag&Drop Aufstellung |
| Mannschaftsrat | mannschaftsrat.html | Fertig | Abstimmungen |
| Spielzüge | spielzuege.html | Fertig | Animierte Spielzug-Visualisierung (Canvas) |
| Trainingsplan | trainingsplan.html | Fertig | Trainingsplanung (nur Trainer) |
| Videos | videos.html | Fertig | Video-Bibliothek |
| Beteiligung | trainingsbeteiligung.html | Fertig | Anwesenheit Training & Spiele |
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
| Trainings wieder in "Nächste Termine" (braucht neuen Wochenrhythmus mit Zeiten/Orten von Steffen; Mi+Fr lt. SpielerPlus) | Offen | — |

### Changelog
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
- Kick-Visualisierung (hohe Bälle, Grubber)
- Export als GIF/Video für WhatsApp-Gruppe
- Spielzug-Vorlagen (Standard-Spielzüge zum Kopieren/Anpassen)

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
2. Login-Gate mit SHA-256 Hash von "RatPack#26"
3. Trainer-Bar mit PIN-Eingabe (7831)
4. Seitenspezifische CSS-Overrides im `<style>`-Tag (z.B. Container-Breite)
5. Firebase Init + Anonymous Auth
6. CRUD-Operationen über Firebase Realtime Database
7. LocalStorage-Fallback
8. Responsive Grid/Cards
