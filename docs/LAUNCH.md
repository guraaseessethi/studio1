# Launch guide

No secrets belong in this file. Put values in Vercel and `.env.local`.

## 1. Sanity

1. Project and dataset: project ID goes in `NEXT_PUBLIC_SANITY_PROJECT_ID`, dataset `production` (public).
2. API token: sanity.io/manage → project → API → Tokens → add token with **Editor** access. Save it as `SANITY_API_WRITE_TOKEN` in Vercel and in `.env.local`. It is only ever used on the server.
3. Add the owner: sanity.io/manage → Members → invite their email as **Editor**. They sign in to the Studio with Sanity's own login.
4. CORS origins (API → CORS origins), each with **Allow credentials** on:
   - `http://localhost:3000`
   - the Vercel URL, e.g. `https://<project>.vercel.app`
   - the live domain once connected, e.g. `https://www.<domain>`
   (The website only talks to Sanity from the server, so these matter for any browser-side Sanity call you add later. The hosted Studio needs no entry.)
5. Seed starter content (after the token is in `web/.env.local`): `cd web && npm run seed`.

## 1b. Studio (owner's editing screen)

1. `cd studio && cp .env.example .env`, fill in the project ID.
2. Use Node 22.12 or newer (`nvm use` / `fnm use` reads `.nvmrc`).
3. `npx sanity login`, then `npm run deploy`. The Studio goes live at `https://studio-1-barbershop.sanity.studio` (free Sanity hosting). If that name is taken, change `studioHost` in `studio/sanity.cli.ts`.
4. Put that URL in the website's `STUDIO_URL` variable, so "Open in Studio" links in booking emails work.
5. Send the owner that URL. They sign in with the Sanity account you invited.

## 2. Vercel (website)

Import the GitHub repo and set **Root Directory** to `web`. Then add these environment variables:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_WRITE_TOKEN` | Editor token from step 1 |
| `SANITY_REVALIDATE_SECRET` | Any long random string (same as webhook 1) |
| `SANITY_BOOKING_WEBHOOK_SECRET` | A different long random string (same as webhook 2) |
| `RESEND_API_KEY` | From resend.com → API Keys |
| `BOOKING_FROM_EMAIL` | `onboarding@resend.dev` until the domain is verified, then `bookings@<domain>` |
| `STUDIO_URL` | The hosted Studio URL from step 1b, no trailing slash |
| `NEXT_PUBLIC_SITE_URL` | Final site URL, no trailing slash |
| `PAYMENTS_HELCIM_ENABLED` | `false` |
| `HELCIM_API_TOKEN` | leave empty until Helcim is built |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | optional, for rate limiting across serverless instances |

Generate a secret with `openssl rand -hex 32`.

## 3. Sanity webhooks (sanity.io/manage → API → Webhooks)

**Webhook 1: revalidate public content**

- URL: `https://<domain>/api/revalidate`
- Dataset: `production` · Trigger on: Create, Update, Delete · HTTP method: POST
- Filter: `_type in ["siteSettings","service","barber","gallery","review","pickerChip","contacts"]`
- Projection: `{_type}`
- Secret: the value of `SANITY_REVALIDATE_SECRET`

**Webhook 2: booking status emails**

- URL: `https://<domain>/api/booking-status`
- Dataset: `production` · Trigger on: Update only · HTTP method: POST
- Filter: `_type == "booking"`
- Projection: `{_id}`
- Secret: the value of `SANITY_BOOKING_WEBHOOK_SECRET`

Test it: change a test booking (with an email address) to Confirmed in the Studio. The customer should get one email. Changing it again does not send a second one. If nothing arrives, open the webhook's attempt log in Sanity.

## 4. Resend (email)

1. resend.com → Domains → add the domain (use a subdomain such as `send.<domain>` if the owner prefers).
2. Resend shows the exact records to add. Typically: a TXT record for SPF, a TXT or CNAME record for DKIM (`resend._domainkey`), and an MX record for bounces. Resend puts the MX and SPF on a `send` subdomain, so the owner's normal email at the root domain is not touched. Copy the values exactly from Resend's page.
3. Optional: a `_dmarc` TXT record, e.g. `v=DMARC1; p=none;`.
4. When Resend says Verified, set `BOOKING_FROM_EMAIL=bookings@<domain>` and redeploy.

Until then, Resend only delivers to the Resend account owner's own address, so customers and barbers will not receive emails.

Free limits: 100 emails a day, 3,000 a month. Each booking sends up to three emails (customer, owner, chosen barber).

## 5. Domain on GoDaddy (A and CNAME only)

Do not change nameservers. Changing them can break the owner's email. Only edit records.

1. Vercel → project → Settings → Domains → add `<domain>` and `www.<domain>`. Vercel shows the exact record values for this project. Use those.
2. GoDaddy → DNS → Records:
   - Edit or add the `A` record, name `@`, to the IP Vercel shows (commonly `76.76.21.21`). Delete GoDaddy's default "Parked" `A` record first.
   - Edit or add the `CNAME` record, name `www`, to the value Vercel shows (commonly `cname.vercel-dns.com`).
3. Leave every existing `MX`, `TXT` and other `CNAME` record alone. Those run the owner's email.
4. In Vercel, set one of the two domains to redirect to the other. Vercel issues the HTTPS certificate once DNS resolves (minutes to a few hours).
5. After it is live, update `NEXT_PUBLIC_SITE_URL`, the Sanity CORS list and both webhook URLs to the final domain.

The old GoDaddy URLs `/meet-our-team`, `/gallery` and `/contact-us-1` redirect (301) to the matching homepage sections.

## 6. Waiting on the owner

- [ ] Logo: which one is current (Instagram badge or the old-site emblem), plus a vector or high-res file
- [ ] Barber portraits, titles, working days, what each is best at, one-line bio, email for alerts (Sultan, Tushar, Vitaliy, Saijan). Confirm Brian and Hassan have left
- [ ] The Interac e-Transfer email (online e-Transfer stays hidden until it is entered in Contacts) and whether autodeposit is on
- [ ] Owner email for new booking alerts
- [ ] Which Google and Booksy reviews can be quoted, copied word for word with first name and last initial. Reviews stay hidden until then
- [ ] What the higher price tier gets you (e.g. $37 vs $57). Today it reads "Longer appointment"
- [ ] Are "Scissor Cut / long hair" and "Long Hair" the same service, and does he offer braids
- [ ] Cancellation policy wording, and the e-Transfer deadline wording (both appear in emails as `[Ask: ...]` until set)
- [ ] Is "spicy T" OK to use for Tushar (not shown anywhere yet)
- [ ] Walk-ins: promote them or appointments only
- [ ] Real shop photos (Instagram or a 30-minute shoot) to replace the stock placeholders in the gallery and barber cards
- [ ] Opening year, if the About copy should mention it
- [ ] GoDaddy login and whether email runs on that domain
