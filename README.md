# Studio 1 Barbershop

Website for Studio 1 Barbershop, 279 Yonge St, Unit 5, Barrie, ON. Built by Kooht Studio.

Next.js (App Router, Cache Components) · Sanity (content and bookings) · Resend + React Email · Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000, Studio at /studio
```

Without `NEXT_PUBLIC_SANITY_PROJECT_ID` the site shows built-in preview content and online booking answers "not switched on yet".

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Production build |
| `npm run seed:dry` | Builds the seed content and prints a summary. No network, no token |
| `npm run seed` | Writes starter content to Sanity. Needs `SANITY_API_WRITE_TOKEN` in `.env.local`. Safe to re-run: it never overwrites existing documents |

## How it fits together

- **Content** lives in Sanity (`sanity/schemaTypes`). The Studio is embedded at `/studio` with a custom desk (`sanity/structure.ts`).
- **Public content** is read once per change through `lib/content/index.ts` (`use cache`, tagged `sanity`). A Sanity webhook calls `/api/revalidate`, so edits go live in seconds.
- **Bookings** are private documents with dotted IDs (`booking.<uuid>`). Sanity never serves dotted IDs to the public API. The server reads and writes them with `SANITY_API_WRITE_TOKEN`.
- **Availability** logic is shared between browser and server (`lib/booking/slots.ts`). The browser only receives busy times, never customer details. The server re-checks everything in `lib/booking/server.ts` and recalculates prices from Sanity.
- **Payments** are pluggable (`lib/payments`). `shop` and `interac` are live. `helcim` is a stub that stays off until `PAYMENTS_HELCIM_ENABLED=true` and `HELCIM_API_TOKEN` are set; its TODO list is in `lib/payments/helcim.ts`.
- **Emails** (`lib/email`) send through Resend. A failed email never blocks a booking; the result is saved as `emailStatus` on the booking.

Launch steps, webhook settings and DNS are in [docs/LAUNCH.md](docs/LAUNCH.md).
