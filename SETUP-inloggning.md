# Inloggning till internportalen — vad som behöver göras

Steg 1 av säkerhetsarbetet: **datalåset**. Portalens sidor kräver inloggning
med jobbadress, och databasen släpper bara in inloggade `@nordicta.com`-konton.
Sidorna som HTML-filer ligger fortfarande publikt på GitHub Pages — det är
steg 2 (Cloudflare Access) som gömmer själva sidorna.

Filen som gör jobbet är `portal-auth.js` i repo-roten. Den läggs in med en rad
i varje sida som pratar med Supabase och behöver inga andra ändringar i sidan.

---

## A. Gör detta i Supabase innan inloggningen kan användas

Allt sker på https://supabase.com/dashboard/project/ruznxfmqarwlkyntxliq

### A1. Lägg koden i BÅDA mejlmallarna (obligatoriskt)

Supabase väljer mall efter situation:

| Situation | Mall som skickas |
|---|---|
| Adressen har aldrig loggat in förut | **Confirm signup** |
| Adressen har loggat in tidigare | **Magic Link** |

Därför måste **båda** innehålla `{{ .Token }}`, annars kommer bara en klickbar
länk och koden syns aldrig.

**Authentication** → **Emails** → redigera fliken **Confirm signup** och sedan
fliken **Magic Link**. Klistra in samma innehåll i båda:

```html
<h2>Inloggning till Nordicta internportal</h2>
<p>Din engångskod är:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>Koden gäller i 60 minuter. Har du inte begärt den kan du ignorera mejlet.</p>
```

Spara varje flik för sig.

### A2. Rätta Site URL (annars pekar länkarna på localhost:3000)

**Authentication** → **URL Configuration**

- **Site URL:**
  `https://coordinator-lang.github.io/internportal/Städföretag/Städföretag_v6.1.html`
- **Redirect URLs** → *Add URL*:
  `https://coordinator-lang.github.io/internportal/**`

Site URL flyttas till portalens startsida när inloggningen finns på alla sidor.
Med rätt Site URL fungerar både engångskoden och länken i mejlet.

### A3. Se till att mejlen når kollegorna (viktigast)

Supabases inbyggda utskick (avsändare `noreply@mail.app.supabase.io`) är
begränsat till några få mejl i timmen och går i många projekt **bara till
adresser som är medlemmar i Supabase-kontot**. Det räcker för din egen test men
inte för arbetslaget. Sätt upp egen SMTP:

**Authentication** → **Emails** → **SMTP Settings** → *Enable Custom SMTP*.

| | Fördel | Att tänka på |
|---|---|---|
| **Resend** (resend.com) | Gratis 3 000 mejl/mån, klart på 10 min | Nytt konto, domänen bör verifieras |
| **Microsoft 365** (smtp.office365.com:587) | Ni har det redan | SMTP AUTH är ofta avstängt i tenanten och måste slås på av admin |

Avsändaradress: t.ex. `no-reply@nordicta.com`.

### A4. Testa

Öppna Städföretag-sidan, skriv din jobbadress, klicka **Skicka engångskod**,
skriv in de sex siffrorna. Kommer du in är steg 1 klart att rullas ut på resten
av sidorna.

---

## B. Microsoft-inloggning (valfritt, men trevligare)

Ger knappen "Logga in med Microsoft" i stället för e-postkod, och ärver den
MFA/Authenticator-policy ni redan har i Microsoft 365. Kräver någon med
adminrättigheter i Entra ID.

1. https://portal.azure.com → **Microsoft Entra ID** → **App registrations** → **New registration**
   - Namn: `Nordicta internportal`
   - Konton: *Accounts in this organizational directory only*
   - Redirect URI: **Web** → `https://ruznxfmqarwlkyntxliq.supabase.co/auth/v1/callback`
2. Kopiera **Application (client) ID** och **Directory (tenant) ID**.
3. **Certificates & secrets** → **New client secret** → kopiera värdet direkt
   (det visas bara en gång).
4. I Supabase: **Authentication** → **Sign In / Providers** → **Azure** → slå på,
   klistra in Client ID, Secret och `https://login.microsoftonline.com/<TENANT-ID>`
   som Azure Tenant URL.
5. Säg till mig — jag sätter `AZURE_ENABLED = true` i `portal-auth.js` så
   knappen dyker upp.

---

## C. SQL som låser databasen — kör FÖRST när inloggningen är testad

Kör detta i **SQL Editor** när du har loggat in med koden minst en gång och
inloggningen finns på alla sidor. Innan dess slutar sidorna fungera för alla.

```sql
-- Öppna policyerna från första omgången tas bort
drop policy if exists "read"   on public.stad_leverantorer;
drop policy if exists "insert" on public.stad_leverantorer;
drop policy if exists "update" on public.stad_leverantorer;

-- RLS på samtliga tabeller (inventory och overrides saknar det i dag)
alter table public.inventory            enable row level security;
alter table public.overrides            enable row level security;
alter table public.riktpris_manual      enable row level security;
alter table public.workflow_suggestions enable row level security;
alter table public.stad_leverantorer    enable row level security;

-- En regel per tabell: bara inloggade konton på @nordicta.com
do $$
declare t text;
begin
  foreach t in array array['stad_leverantorer','inventory','overrides',
                           'riktpris_manual','workflow_suggestions']
  loop
    execute format('drop policy if exists "nordicta_all" on public.%I', t);
    execute format($f$create policy "nordicta_all" on public.%I
      for all to authenticated
      using ((auth.jwt() ->> 'email') like '%%@nordicta.com')
      with check ((auth.jwt() ->> 'email') like '%%@nordicta.com')$f$, t);
  end loop;
end $$;
```

Efter det: Advisor-varningarna om `public.overrides` och `public.inventory`
försvinner, och den publika nyckeln blir värdelös utan en giltig inloggning.

**Kontrollera först:** om något Make-scenario eller annan integration skriver
till dessa tabeller med den publika nyckeln slutar det fungera. Edge Functions
använder service-nyckeln och påverkas inte.

---

## D. Att veta

- **Sessionslängd:** 24 timmar, satt i `portal-auth.js` (`MAX_SESSION_HOURS`).
  Man loggar alltså in en gång per dygn.
- **Vilka släpps in:** alla som kan ta emot mejl på `@nordicta.com`. Vill ni ha
  en namngiven lista i stället byter vi domänvillkoret mot en tabell med
  tillåtna adresser.
- **Utloggning:** knappen nere till höger på sidorna.
- **Reservväg:** `Städföretag/Städföretag_v6.html` (utan inloggning) ligger kvar
  och nås direkt via adressen om något krånglar under övergången.
- **Delad fil:** `portal-auth.js` versionsstämplas inte i filnamnet — den ligger
  på ett fast namn eftersom alla sidor pekar på den. Historiken finns i git.
