# BookApp
 
En responsiv CRUD-webbapplikation för böcker och favoritcitat, byggd med **Angular 20** och ett **.NET 9 Minimal API** med JWT-autentisering.
 
🔗 **Live:** https://bookapp-marko.netlify.app
🔗 **API:** https://bookapp-api-marko-guf9bce3chb0dgh8.swedencentral-01.azurewebsites.net
 
> **Kom igång:** registrera ett eget konto på inloggningssidan och logga sedan in.
>
> API:et körs på Azures gratisnivå och går i viloläge efter en stunds inaktivitet. Det första anropet kan därför ta 10–20 sekunder.
 
---
 
## Funktioner
 
**Böcker**
- Lista över alla böcker
- Lägg till, redigera och radera böcker (titel, författare, publiceringsdatum)
- Efter att ett formulär skickats in skickas användaren tillbaka till listan med uppdaterad data
**Mina citat**
- Personlig lista med citat. Varje ny användare får 5 startcitat vid registrering
- Lägg till, redigera (direkt i listan) och radera citat
- Varje användare ser och kan bara ändra sina egna citat
**Autentisering**
- Registrering och inloggning med användarnamn och lösenord
- JWT-token som skickas med automatiskt i varje API-anrop
- Skyddade sidor. Den som saknar giltig token skickas till inloggningssidan
- Automatisk utloggning när token har gått ut
**Design**
- Responsiv layout för mobil, surfplatta och dator med Bootstrap 5
- Navigeringsmeny som fälls ihop till en hamburgermeny på små skärmar
- Ikoner från Font Awesome
- Ljust och mörkt läge. Valet sparas mellan besöken
---
 
## Teknik
 
| Del | Teknik |
|---|---|
| Frontend | Angular 20 (standalone-komponenter, signals), TypeScript |
| Styling | Bootstrap 5.3, Font Awesome (Free) |
| Backend | .NET 9, ASP.NET Core Minimal API |
| Databas | SQLite med Entity Framework Core 9 och migrationer |
| Autentisering | JWT Bearer, lösenord hashade med ASP.NET Core `PasswordHasher` |
| Hosting | Netlify (frontend), Azure App Service (backend) |
 
---
 
## Projektstruktur
 
```
book-app/
├── Api/                      # .NET 9 Minimal API
│   ├── Data/                 # AppDbContext
│   ├── Endpoints/            # Auth-, Book- och QuoteEndpoints
│   ├── Migrations/           # EF Core-migrationer
│   ├── Models/               # Book, Quote, User
│   └── Program.cs            # Konfiguration: CORS, JWT, databas
│
└── Frontend/                 # Angular 20
    ├── public/_redirects     # SPA-routing på Netlify
    └── src/app/
        ├── auth/             # AuthService, interceptor och guard
        ├── pages/            # login, register, book-list, book-form, quotes
        └── services/         # BookService, QuoteService
```
 
---
 
## Köra lokalt
 
### Krav
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) 20.19 eller senare
- Angular CLI 20: `npm install -g @angular/cli@20`
### 1. Backend
```bash
cd Api
 
# Sätt en hemlig nyckel för JWT (minst 32 tecken). Den sparas utanför projektet.
dotnet user-secrets set "Jwt:Key" "byt-ut-mot-en-lang-slumpmassig-nyckel-minst-32-tecken"
 
dotnet run --launch-profile https
```
API:et startar på `https://localhost:8000`. Databasen (`app.db`) skapas automatiskt vid första starten.
 
### 2. Frontend
```bash
cd Frontend
npm install
ng serve -o
```
Appen öppnas på `http://localhost:4200`.
 
---
 
## API-endpoints
 
| Metod | Endpoint | Beskrivning | Kräver inloggning |
|---|---|---|---|
| POST | `/api/auth/register` | Registrera ny användare | Nej |
| POST | `/api/auth/login` | Logga in och få en JWT | Nej |
| GET | `/api/books` | Hämta alla böcker | Ja |
| GET | `/api/books/{id}` | Hämta en bok | Ja |
| POST | `/api/books` | Skapa bok | Ja |
| PUT | `/api/books/{id}` | Uppdatera bok | Ja |
| DELETE | `/api/books/{id}` | Radera bok | Ja |
| GET | `/api/quotes` | Hämta mina citat | Ja |
| POST | `/api/quotes` | Skapa citat | Ja |
| PUT | `/api/quotes/{id}` | Uppdatera citat | Ja |
| DELETE | `/api/quotes/{id}` | Radera citat | Ja |
 
---
 
## Så fungerar autentiseringen
 
1. Vid **registrering** hashas lösenordet med salt (PBKDF2) innan det sparas. Lösenord lagras aldrig i klartext.
2. Vid **inloggning** kontrolleras lösenordet och API:et returnerar en signerad JWT som innehåller användarens id och namn och gäller i 2 timmar.
3. Frontend sparar token i `localStorage`. En **HTTP-interceptor** lägger automatiskt till `Authorization: Bearer <token>` på varje anrop.
4. API:et **validerar signaturen och utgångstiden** på varje anrop. Endpoints med `RequireAuthorization()` svarar 401 utan giltig token.
5. En **route guard** i Angular skyddar sidorna, och interceptorn loggar ut användaren automatiskt om API:et svarar 401.
**Hemligheter:** JWT-nyckeln ligger aldrig i koden. Lokalt används User Secrets och i produktion en miljövariabel i Azure.
 
---
 
## Publicering
 
**Backend: Azure App Service (Windows, gratisnivå F1)**
- Publiceras som *self-contained* (`win-x86`), så att .NET 9-runtimen följer med appen. Det gör appen oberoende av vilka runtimes Azure erbjuder, eftersom .NET 9 nådde end of support i november 2026. F1 kör endast 32-bitarsprocesser, därav x86.
- Migrationer körs automatiskt vid start med `Database.Migrate()`.
- Konfiguration via miljövariabler: `Jwt__Key`, `ConnectionStrings__Default` och `Cors__Origins__0`.
**Frontend: Netlify**
- Byggs automatiskt från `main` (base directory `Frontend`, publish directory `Frontend/dist/Frontend/browser`).
- `public/_redirects` gör att direktlänkar och sidomladdning fungerar i en SPA.
**CORS** är konfigurerat så att endast den publicerade frontenden (och `localhost:4200` vid utveckling) får anropa API:et från en webbläsare.
 
---
 
## Designval
 
- **Böcker är gemensamma för alla inloggade användare**, enligt kravet "en lista över alla böcker". **Citat är personliga** ("Mina citat") och kopplade till användaren via token.
- **5 startcitat** skapas vid registrering. Därefter kan användaren lägga till, redigera och ta bort citat fritt.
- **Minimal API utan service-lager.** API:et är litet, så logiken ligger direkt i endpoints som är grupperade per resurs.
- **DTO:er för indata** (`AuthRequest`, `QuoteRequest`) så att klienten inte kan skicka fält som `UserId` eller `PasswordHash`.
- **Manuell validering** i endpoints, eftersom .NET 9 Minimal API inte validerar DataAnnotations automatiskt.
- **Token i `localStorage`**, vilket uppgiften tillät. Det är enkelt men sårbart för XSS. Se förbättringar.
---
 
## Möjliga förbättringar
 
- **Ägarskap för böcker:** alla ser alla böcker, men bara den som lade in en bok kan ändra eller radera den (samma mönster som för citaten).
- **Response-DTO:er**, så att API:et styr exakt vilka fält som skickas ut.
- **Refresh tokens och httpOnly-cookies** i stället för `localStorage`, för bättre skydd mot XSS och längre sessioner.
- **Service-lager och enhetstester** för backend-logiken.
- **Sökning och sortering** i boklistan.
- **En hanterad databas** (till exempel Azure SQL eller PostgreSQL) i stället för SQLite.
 