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
| Weitere Startformationen (Viererraute, 22er Ports) | Offen | — |
| trainingsbeteiligung.html bauen | Fertig | 23.02.2026 |
| Navigation in allen Seiten: Beteiligung-Link | Fertig | 23.02.2026 |
| uebungen.html bauen (Drill-Bibliothek mit Canvas) | Fertig | 25.02.2026 |
| Navigation in allen Seiten: Übungen-Link | Fertig | 25.02.2026 |
| Erster Drill: "Ball-Klau" (Warm-Up) als Seed | Fertig | 25.02.2026 |
| 6 weitere Warm-Up Drills + Farb-Zonen + kontextabhängige Legende | Fertig | 26.02.2026 |
| CSS-Refactoring: common.css für alle 9 Dark-Theme-Seiten | Fertig | 28.02.2026 |
| SpielerPlus-Integration (weitere Screenshots) | Offen | — |

### Changelog
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
- Gemeinsame CSS-Styles in `common.css` (9 Dark-Theme-Seiten), seitenspezifische Overrides inline
- Firebase Compat SDK v10.14.1 (app + auth + database)
- Anonymous Auth nach Team-Login
- LocalStorage als Offline-Fallback
- Dark Theme mit CSS Custom Properties
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
