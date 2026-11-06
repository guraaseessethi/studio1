# Studio 1 Barbershop

Website for Studio 1 Barbershop, 279 Yonge St, Unit 5, Barrie, ON. Built by Kooht Studio.

```
studio1/
├── web/      Next.js site, booking API, emails (deploys to Vercel)
├── studio/   Sanity Studio for the owner (deploys to sanity.studio)
└── docs/     Launch guide
```

Two separate packages, each with its own `npm install`. Content and bookings live in Sanity; the site reads them, the Studio edits them.

## Website (`web/`)

```bash
cd web
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

Without `NEXT_PUBLIC_SANITY_PROJECT_ID` the site shows built-in preview content and online booking answers "not switched on yet".

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Production build |
| `npm run seed:dry` | Builds the seed content and prints a summary. No network, no token |
| `npm run seed` | Writes starter content to Sanity. Needs `SANITY_API_WRITE_TOKEN` in `.env.local`. Safe to re-run: it never overwrites existing documents |

## Studio (`studio/`)

Needs Node 22.12 or newer (`.nvmrc` says 22).

```bash
cd studio
npm install
cp .env.example .env         # project ID and dataset
npm run dev                  # http://localhost:3333
npm run deploy               # publishes to https://studio-1-barbershop.sanity.studio (needs `npx sanity login`)
```

The desk is set up for the owner: Bookings (Today, Upcoming, New, Awaiting e-Transfer, Past, All), Barbers (drag to reorder), Services, Gallery, Reviews, Picker chips, then Settings (Site settings, Contacts). Schemas are in `studio/schemaTypes`.

## How it fits together

- **Public content** is read through `web/lib/content/index.ts` (`use cache`, tagged `sanity`). A Sanity webhook calls `/api/revalidate`, so edits go live in seconds.
- **Bookings** are private documents with dotted IDs (`booking.<uuid>`). Sanity never serves dotted IDs to the public API. The site reads and writes them on the server with `SANITY_API_WRITE_TOKEN`.
- **Availability** logic is shared between browser and server (`web/lib/booking/slots.ts`). The browser only receives busy times, never customer details. The server re-checks everything in `web/lib/booking/server.ts` and recalculates prices from Sanity.
- **Payments** are pluggable (`web/lib/payments`). `shop` and `interac` are live. `helcim` is a stub that stays off until `PAYMENTS_HELCIM_ENABLED=true` and `HELCIM_API_TOKEN` are set; its TODO list is in `web/lib/payments/helcim.ts`.
- **Emails** (`web/lib/email`) send through Resend. A failed email never blocks a booking; the result is saved as `emailStatus` on the booking.

Launch steps, webhook settings and DNS are in [docs/LAUNCH.md](docs/LAUNCH.md).
