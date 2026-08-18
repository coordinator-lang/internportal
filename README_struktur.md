# Nordicta Internal Website — struktur & versionering

## Mappstruktur

```
Nordicta Internal Website/
├── index.html                  ← startsidan (ligger kvar i roten, navet)  ← AKTUELL
├── index_v1.0.html             ← arkiv (innan unified header)
├── README_struktur.md          ← den här filen
│
├── jourschema/
│   ├── jourschema_v1.0.html    ← original (innan ombyggnad)
│   ├── jourschema_v2.0.html    ← 3-kolumnslayout (stor ändring)
│   ├── jourschema_v2.1.html    ← + klickbara veckor i kalendern (liten ändring)
│   ├── jourschema_v3.0.html    ← Kommande veckor: majoritet/klick/scroll + sticky sidokolumner (stor ändring)
│   ├── jourschema_v3.1.html    ← unified header (liten ändring)
│   └── jourschema_v4.0.html    ← redigeringslås (flytande lås, auto-lås 30s) (stor ändring)  ← AKTUELL
│
├── Städföretag/
│   ├── Städföretag_v5.html     ← original
│   ├── Städföretag_v5.1.html   ← unified header (liten ändring)
│   ├── Städföretag_v5.2.html   ← + Staddags Sollentuna m.m. (liten ändring)
│   ├── Städföretag_v5.3.html   ← kommuner + företag i bokstavsordning (liten ändring)
│   ├── Städföretag_v5.4.html   ← mobiloptimering: fryst namnkolumn (liten ändring)
│   ├── Städföretag_v5.5.html   ← + telefon på Aurora Städ; telefon visas före note-märket (liten ändring)
│   ├── Städföretag_v5.6.html   ← + Masouds Städservice AB (Oskarshamn) (liten ändring)
│   └── Städföretag_v5.7.html   ← + Lilla Edet (ny kommun) + Irma Städservice (liten ändring)  ← AKTUELL
│
├── Nordicta_Protocol/
│   ├── Nordicta_Protocol_i_web_form_v4.html     ← original
│   └── Nordicta_Protocol_i_web_form_v4.1.html   ← unified header (liten ändring)  ← AKTUELL
│
├── Inventarielista/
│   ├── inventarie_v1.0.html    ← original
│   └── inventarie_v1.1.html    ← unified header (liten ändring)  ← AKTUELL
│
├── Forslag/                              ← Förbättringsförslag (Workflow Suggestions)
│   ├── forslag_v1.1.html        ← formuläret (skriv-sidan)
│   ├── forslag_v1.2.html        ← + "See all suggestions"-knapp på tack-skärmen
│   ├── forslag_v1.3.html        ← omstylad till portal-tema (header/IBM Plex/slate)
│   ├── forslag_v1.4.html        ← Workflow improvements-sektionen borttagen (mer fokus på interna sidan)  ← AKTUELL
│   ├── forslag-viewer_v1.0.html ← viewern (läs-sidan, portal-stil, boxar)
│   ├── forslag-viewer_v1.1.html ← + ta bort-förslag med bekräftelse
│   ├── forslag-viewer_v1.2.html ← länkar till form v1.2
│   ├── forslag-viewer_v1.3.html ← länkar till form v1.3
│   └── forslag-viewer_v1.4.html ← länkar till form v1.4  ← AKTUELL
│
├── Anvandbar_information/
│   └── anvandbar-information.html       ← STABILT FILNAMN (permanent länk, aldrig 404) — skrivs över vid ny version; git = arkiv
│
├── Hyresvardsformular/
│   └── hyresvardsformular_v43.html      ← fristående hyresvärdsformulär (postar till Make-webhook)
│
├── Bostadskalkylator/
│   └── bostadskalkylator.html           ← PERMANENT LÄNK + själva kalkylatorn (stabilt filnamn, skrivs över vid ny version)
│
├── annonsimport/                        ← GEMENER (skiftläge viktigt! webbläsartillägget hämtar update-URL:en /internportal/annonsimport/version.json med gemener)
│   ├── annonsimport.html                ← STABILT FILNAMN (permanent länk, aldrig 404) — AI-annonsimport → HV-Databas; versioneras separat i källmappen "Nordicta annonsimport\", skrivs över vid ny version
│   ├── version.json                     ← tilläggets auto-update-manifest (version + zip-filnamn); uppdateras från "Nordicta annonsimport\update\"
│   ├── nordicta-annonsimport-chrome.zip ← Chrome/Edge-tillägget (från "Nordicta annonsimport\dist\")
│   └── nordicta-annonsimport-firefox.zip ← Firefox-tillägget (från "Nordicta annonsimport\dist\")
│
├── Riktprisdatabas/
│   └── riktprisdatabas.html             ← STABILT FILNAMN (permanent länk, aldrig 404) — sökbar riktprisdatabas för AM; versioneras separat i källmappen "Nordicta riktprisdatabas\", skrivs över vid ny version
│
├── Stadkalkylator/
│   └── stadkalkylator.html              ← STABILT FILNAMN (permanent länk, aldrig 404) — kundpris städ vid avflytt + offertförfrågan; versioneras separat i källmappen "Nordicta slutstädkalkylator\" (senaste stadkalkylator_v4.html), skrivs över vid ny version
│
├── Inflytt_Utflytt/
│   └── inflytt-utflytt-guide_v3.9.html  ← workflow-guide för in-/utflytt, hostad oförändrad (har egen "← Internportal"-länk; versionshanteras separat)
│
└── SOP/
    ├── sop_v1.0.html                    ← arkiv
    ├── sop_v1.1.html                    ← arkiv
    ├── sop_v1.2.html                    ← sökbar SOP 2026, portal-stil, emoji-fri (nummer-badges/glyf-cirklar/SVG-lupp)  ← AKTUELL
    └── sop-alt_v1.0.html                ← ALTERNATIV stilvariant i formulärens husstil (lila/guld/DM Sans) — samma innehåll, EJ länkad från index
```

> **OBS – Hyresvardsformular/ är MEDVETET INTE länkad** från index eller någon
> annan sida. Den hostas bara så att direkt-URL:en kan delas (t.ex. via WhatsApp)
> och öppnas i en webbläsare. Lägg inte till ett portal-kort för den.

> **Förslags-funktionen (Forslag/) använder Supabase** — samma projekt som resten
> av sajten. Tabellen `workflow_suggestions` måste skapas en gång (SQL i HANDOFF-
> briefen). Formuläret faller tillbaka till en lokal JSON-nedladdning om Supabase
> inte är nåbar. Viewern är publikt läsbar via anon-nyckeln precis som övriga sidor.

Varje sida har fått en egen mapp. **index.html ligger kvar i roten** eftersom
det är startsidan – då fungerar den som nav och länkarna blir enklast. (Lägg den
inte i en undermapp; då slutar den fungera som naturlig ingång.)

## Hur länkarna fungerar nu

- Startsidans kort pekar in i undermapparna, t.ex.
  `jourschema/jourschema_v4.0.html`.
- Varje undersida länkar tillbaka till startsidan med `../index.html`
  (en nivå upp).

**Viktigt:** När du gör en ny version av en sida – uppdatera länken i `index.html`
så den pekar på den nya filen (t.ex. `jourschema_v2.1.html` → `jourschema_v2.2.html`).
Det är en enda rad per sida.

## Versioneringssystem

- **Stor ändring** (ny funktion, ombyggnad av layout): höj huvudversionen
  → v2.0 → **v3.0** → v4.0 …
- **Liten ändring** (justering, fix, mindre tillägg): höj undernumret
  → v2.0 → **v2.1** → v2.2 …

Behåll de gamla filerna i mappen som arkiv – då kan man alltid gå tillbaka.

### Versionshistorik – jourschema
| Version | Ändring | Typ |
|---|---|---|
| v1.0 | Original | – |
| v2.0 | Kalendern i mitten, "Kommande veckor" + "Storhelger" på sidorna | Stor |
| v2.1 | Hela veckor klickbara (klick på veckonummer byter jour för hela veckan) | Liten |
| v3.0 | "Kommande veckor" speglar kalendern (majoritetsfärg), raderna klickbara, scrollbar lista med ~35 veckor (täcker upp till v53). Sidokolumner (Kommande veckor + Storhelger) följer med vid scroll genom kalendern. | Stor |
| v3.1 | Unified header (matchar övriga sidor: centrerad bildlogo, Georgia h1, Städföretags bubble-decor) | Liten |
| v4.0 | Redigeringslås: flytande lås-knapp, allt låst som standard, auto-lås efter 30s inaktivitet (timern förnyas vid varje ändring), manuell låsning | Stor |

### Versionshistorik – Städföretag
| Version | Ändring | Typ |
|---|---|---|
| v5 | Tidigare baseline | – |
| v5.1 | Unified header | Liten |
| v5.2 | Lade till Staddags Sollentuna (Mohammed Raid) i Stockholmsgruppen; kompletterade Hemfrid + SEM Städ & Flytt med Stockholmsgrupp-täckning; fix av räknartext | Liten |
| v5.3 | Alla kommuner (utom Stockholmsgruppen) och alla företag sorteras nu i bokstavsordning (svensk collation) | Liten |
| v5.4 | Mobiloptimering: kompakt + fryst företagskolumn (namn wrappar, telefon på egen rad) så stadskolumnerna blir läsbara medan namnet alltid syns | Liten |
| v5.5 | Lade till telefon (+46 76 079 60 26) på Aurora Städ; telefon-pillen renderas nu före note-märket ("Maries kontakt") | Liten |
| v5.6 | Lade till Masouds Städservice AB (Oskarshamn, 0491-33 330, masoudsstäd.se) | Liten |
| v5.7 | Ny kommun-kolumn Lilla Edet + Irma Städservice i Lilla Edet AB (073-627 05 82, irmastadservice.com) | Liten |

### Versionshistorik – Nordicta_Protocol
| Version | Ändring | Typ |
|---|---|---|
| v4 | Tidigare baseline | – |
| v4.1 | Unified header (behåller "Nordicta Guest Care"-tag och legend) | Liten |

### Versionshistorik – Inventarielista
| Version | Ändring | Typ |
|---|---|---|
| v1.0 | Original (första byggnad) | – |
| v1.1 | Unified header | Liten |

### Versionshistorik – Förbättringsförslag (Forslag)
| Version | Ändring | Typ |
|---|---|---|
| forslag v1.1 | Formuläret (skriv-sidan). Egen lila/guld-stil — INTE portal-stil. Supabase-config ifylld, auth till apikey-only. | – |
| forslag v1.2 | + "See all suggestions"-knapp på tack-skärmen (länkar till viewern). FORM_VERSION → v1.2. | Liten |
| forslag v1.3 | Omstylad till portal-temat: unified header (huslogo, mörk bakgrund, orange linje), IBM Plex-typsnitt, slate/orange-palett. Samma fält + logik. FORM_VERSION → v1.3. | Liten |
| forslag v1.4 | "Workflow improvements"-sektionen borttagen (kan återställas senare — DB-kolumnerna category/priority/workflow_pain/workflow_idea finns kvar, JS skickar null). Sektioner omnumrerade 1–4. Undertext omskriven till fokus på interna sidan. FORM_VERSION → v1.4. | Liten |
| viewer v1.0 | Viewern (läs-sidan). Portal-stil: unified header + boxar (klick → detaljpanel, döljer tomma fält). Länkar till formuläret. | – |
| viewer v1.1 | + Ta bort förslag: knapp i detaljpanelen → bekräftelsedialog ("är du säker") → Supabase DELETE. Kräver anon DELETE-policy. | Liten |
| viewer v1.2 | "+ Nytt förslag" pekar nu på form v1.2 (krosslänk). | Liten |
| viewer v1.3 | "+ Nytt förslag" pekar nu på form v1.3 (krosslänk). | Liten |
| viewer v1.4 | "+ Nytt förslag" pekar nu på form v1.4 (krosslänk). | Liten |

### Versionshistorik – Användbar information
| Version | Ändring | Typ |
|---|---|---|
| v1.1 | Referenssidans innehåll inlagt i portal-mallen (unified header/footer, portal-CSS). Alla tax/lag-värden är [PLATSHÅLLARE] tills en ägare fyller i från officiell källa. | – |
| v1.2 | + Moms-sektion: Forenom-tabell (boende/tjänste-moms per land) + allmän tabell över moms på bostadsuthyrning för 12 länder (verifierat via webbsök juni 2026). Övriga fält fortf. platshållare. | Liten |
| v1.3 | + Sektion "Nordictas faktureringsuppgifter" högst upp (fakturaadress + fakturamejl inbox.lev.1324422@arkivplats.se) med kopiera-knappar (clipboard API + execCommand-fallback). | Liten |
| v1.4 | + tredje knapp "Kopiera alla uppgifter" (adress + fakturamejl i ett). **Sidan flyttad till STABILT filnamn `anvandbar-information.html`** (inga versionsnummer i URL → aldrig 404 vid uppdatering). Gamla versionerade filer borttagna; git-historien = arkiv. Rutin: skriv över `anvandbar-information.html`, bumpa bara denna tabell. | Liten |

### Bostadskalkylator
Hostad från användarens egen versionerade fil (senast **v3.4**). Versionshanteras
separat. Har portal-headern med **"← Internportal"-länk** (uppe till vänster) och
**klickbar logga** som länkar hem till `../index.html` — båda dolda i `@media print`
så PDF-exporten förblir ren (tillagt i v3.4).

**PERMANENT LÄNK (viktigt):** Kalkylatorn nås alltid via den stabila URL:en
`Bostadskalkylator/bostadskalkylator.html` — det är den som ska delas och bokmärkas.
Själva kalkylatorn ligger PÅ det stabila filnamnet (ingen redirect), så adressfältet
förblir stabilt och gamla bokmärken 404:ar aldrig.

**Rutin vid ny version:** skriv bara över `bostadskalkylator.html` med innehållet från
den nya versionerade filen → commit/push. Rör INTE filnamnet eller index-kortet.
Versionsarkiv behövs inte i repot — git-historiken + användarens källmapp
(`Nordicta bostadskalkylator\`) bevarar alla versioner.

### Versionshistorik – index (startsidan)
Index versioneras genom arkiverade kopior i roten (`index_v1.0.html`, `index_v1.1.html` etc.).
Live-versionen ligger alltid som `index.html`.

| Version | Ändring | Typ |
|---|---|---|
| v1.0 | Före unified header | – |
| v1.1 | Unified header | Liten |
| v1.2 | + kort för Förbättringsförslag och Användbar information | Liten |

| Version | Ändring | Typ |
|---|---|---|
| v1.0 | Före unified header (gradient bg + logo höger) | – |
| v1.1 | Unified header (samma som alla undersidor); kortlänkar bumpade till v3.1/v5.1/v4.1/v1.1 | Liten |
