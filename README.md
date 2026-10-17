# Aasra

**AI Saathi for Gig Workers**

A multilingual companion for Indian gig and informal workers: earnings tracking, practical AI guidance, document explanations, and editable grievance drafts.

## Accounts and saved records

Open **Account & backup** to create an account with an email, username and password. Sign in using the **username and password**. Passwords require 12–128 characters and are hashed by Better Auth. Email verification and password-recovery delivery are not configured yet; the signup form says so.

When signed in, earnings, completed chat messages, and grievance forms/drafts are saved in Neon Postgres under the authenticated account. They load again after refresh and on another device. Pasted document text and unsent questions remain session-only. Wait for **All changes saved to your account** before refreshing; failed saves preserve screen work and expose Retry. A stale-tab conflict stops saving and asks you to copy unsaved work before reloading.

Guest mode keeps earnings in validated browser localStorage. Guest chats/documents/grievances clear on refresh. Localhost and the deployed URL have separate browser storage. **Import device earnings** shows the local record count and asks for confirmation before importing; it never silently merges someone else's records or deletes the original device copy. Sign out clears account work from the screen and restores guest device entries.

The public GitHub repository contains source code only. Passwords, database contents, API keys, and `.env.local` are never committed.

## Local setup

Use **Node.js 24.x LTS** and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
# Configure the values below privately, then:
npm run db:migrate
npm run dev
```

On macOS/Linux use `cp` instead of `Copy-Item`. If Vercel already manages the database, use `npx vercel env pull .env.local` instead of replacing existing private configuration. Set the local `BETTER_AUTH_URL` to `http://localhost:3000`. Open [localhost:3000](http://localhost:3000).

| Variable                | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Pooled Postgres URL for request traffic, supplied by Neon/Vercel                |
| `DATABASE_URL_UNPOOLED` | Direct URL for schema migrations                                                |
| `BETTER_AUTH_SECRET`    | Strong random secret, at least 32 characters; server-only                       |
| `BETTER_AUTH_URL`       | Exact local or production origin; Preview uses Vercel's own deployment hostname |
| `GEMINI_API_KEY`        | Server-only key from [Google AI Studio](https://aistudio.google.com/apikey)     |
| `GEMINI_MODEL`          | Defaults to `gemini-3.5-flash-lite`                                             |

Missing database/auth settings leave device earnings usable and show an honest cloud configuration message. Missing Gemini configuration produces a clear error; no fake AI response is generated. Builds do not require secrets. Never prefix secrets with `NEXT_PUBLIC_` or paste them into chat.

The default model was selected from [Google's official stable model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), checked 17 October 2026, for low latency and cost. Access and quotas depend on the Google project. There is no silent provider/model fallback.

## Architecture

- Next.js App Router, strict TypeScript, Tailwind CSS 4, Lucide React, npm lockfile.
- Better Auth with its username plugin; HTTP-only session cookies; database-backed auth rate limits. Each data endpoint verifies the session and derives ownership from it, never a client-supplied user ID.
- Neon Postgres through `pg`, with a small reusable pool and Vercel's pool lifecycle helper. Runtime SQL is parameterized. `aasra_worker_data` stores a validated versioned JSON snapshot per user. Revision checks reject stale writes with 409 instead of silently overwriting newer records.
- `scripts/migrate.ts` uses Better Auth's version-matched migration planner plus the worker-data table. It runs explicitly after project/environment verification, uses the direct connection when available, and is not run on every request or deployment build. Review schema changes before applying them to an existing production database.
- Gemini is called only through the Node.js `POST /api/ai` route with native server `fetch`; prompts and keys stay server-side.
- No separate backend, Docker, writable server disk, static export, database proxy service, or client-side database credentials.

## Connected workflows

1. Add income/expenses → accurate seven-day dashboard → Explain my earnings → review the exact calculated summary → confirm sharing with Google Gemini → grounded guidance.
2. Earnings payment concern → enter or confirm the amount and facts → grievance form. Recording gaps are never treated as proof of nonpayment.
3. Paste redacted document text → confirm privacy review → explanation → choose source facts yourself → confirm transfer → review prefilled grievance → generate → edit → copy. Nothing is submitted externally.
4. Change English/Hindi/Punjabi → navigation, forms, errors, prompts and subsequent AI responses use the selected language. Hindi uses Devanagari; Punjabi uses Gurmukhi.
5. Voice appears only in supported browsers. Click to listen, stop, and review editable recognized text before sending. It can require a browser speech service and internet access.

## Financial correctness

Amounts are integer paise, accepting positive decimal strings with at most two decimal places. Each entry is capped at ₹10 lakh and there are at most 10,000 entries. Calendar dates use `YYYY-MM-DD`; reporting uses `Asia/Kolkata`, today plus the preceding six days, including zero-entry days. All-time entries are separately labeled. Code computes income, expense, net and daily totals; negative net is allowed. Zero recorded earnings never claims the worker earned nothing.

Device records contain only an ID, income/expense type, amount, date and predefined category. Storage validation rejects malformed JSON, unknown entry fields, bad IDs/categories/dates/amounts and duplicate IDs. Failed writes never claim success, and the earnings form remains available. Delete requires confirmation.

## Privacy and safety

Signed-in records contain private earnings, chat and grievance content. They are accessible to the account and server/database administrators under the hosting providers' policies; they are not end-to-end encrypted. Avoid identity numbers, bank details and unnecessary personal information. Pasted document text is not saved. Text submitted for AI is transmitted to Google Gemini under Google's applicable service terms. Browser speech services can process voice separately.

Guest localStorage is device/browser-specific, unencrypted, and accessible to others using the profile. It is not a cloud backup. The keys are `aasra-earnings-v1` and `aasra-language`. If corrupt device records are detected, they are not overwritten; preserve anything needed before removing that key through browser site-storage controls.

AI is not a verified legal/benefits source. No live legal or scheme retrieval is performed. Check official sources; the assistant must not invent citations, deadlines, eligibility, evidence, legal sections or earnings. Document text is untrusted material, not system instructions. System prompts reduce some risks but do not guarantee accuracy or injection resistance. Grievances are drafts only; no employer or external organization is contacted.

## Request limits and errors

AI: 96,000-byte streamed request limit before JSON parsing; 3,000 characters per user message; at most 20 history messages and 24,000 history characters; 8,000 document characters; bounded grievance fields; 2,200 output tokens; 25-second provider timeout within a 30-second Vercel function. No automatic provider retries or parallel model calls. Explicit retry retains work. Clear the conversation when its limit is reached.

Account endpoints: 16,000-byte auth body bound; 2,500,000-byte saved snapshot bound; strict snapshot shape and field/history limits; per-user authorization; revision conflict detection. Saved partial grievance forms can be incomplete, but generation separately validates all required facts.

Errors are sanitized and AI/account responses are non-cacheable. API failures distinguish invalid data, size/origin rejection, missing configuration, server credential/model problems, quota, timeout, upstream/empty output, missing sign-in and stale versions. Raw HTML is never rendered. Response headers include `nosniff`, frame denial and a conservative referrer policy. Sensitive prompts, passwords and database URLs are not logged by application code.

### Public endpoint controls

Auth rate limits use Postgres so they survive separate server instances. Their source-address accuracy depends on trusted proxy forwarding. The AI endpoint remains publicly callable and has no durable application rate limiter; cross-origin checks and UI submission locks do not prevent scripted abuse or provider charges. The data endpoint requires login but also benefits from infrastructure limits.

Configure a [Vercel WAF rate-limit rule](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) for `POST /api/ai` and appropriate account/data routes before broad public sharing. Monitor false positives on shared worker networks. Regional counters are not a global cost cap. In-memory rate limiting would not be reliable across Vercel instances.

Review [Gemini project rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), set available quotas, restrict the key to its intended service and configure billing alerts. **Alerts are notifications, not hard spending caps.** Revoke/rotate compromised credentials. Email verification/password-reset delivery, account deletion self-service and stronger public abuse controls remain future hardening work.

## Validation

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

ESLint runs directly, not deprecated `next lint`. Vitest covers financial/date/storage boundaries, API schemas and provider failure cases, connected document/grievance editing/copy/regeneration, account ownership and revision checks, and client cloud hydration/autosave/restoration/conflicts. Provider responses are mocked **only in tests**.

With a real configured database and a running local server:

```powershell
npm run test:live
```

This opt-in integration test creates two disposable QA accounts, exercises real authentication, hashed password storage, persistence, isolation, stale-write rejection and re-login, then removes only those account IDs. It never generates a fake AI response inside the app. `TEST_BASE_URL` can select the deployed application.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for current deployment/verification results, [PROGRESS.md](./PROGRESS.md) for the phase plan, and [VERIFICATION.md](./VERIFICATION.md) for the initial MVP baseline. Formatting: `npx prettier --write app components lib scripts tests *.ts *.mjs *.json *.md`.

## Vercel deployment and future updates

1. Push the source and lockfile to your GitHub repository, excluding `.env.local`, `.vercel`, credentials, `node_modules` and `.next`.
2. Import/link the project in the intended Vercel team. Choose **Next.js**, root directory containing `package.json`, **Node.js 24.x**, standard `npm ci` / `npm run build`, and framework-managed output. No `vercel.json` is needed.
3. Connect a Neon Postgres database through Vercel Marketplace. Use separate branches/databases for preview and production when operating beyond a demo.
4. Configure the private database/auth/Gemini environment variables above. Set production `BETTER_AUTH_URL` to the actual deployment domain; development to localhost. Preview uses `VERCEL_URL`. Generate secrets privately; do not commit or transmit them in command arguments.
5. Pull Development environment variables into ignored local configuration, verify required keys by name without printing values, then explicitly run `npm run db:migrate` against the intended database.
6. Run validation, deploy with Vercel's Git integration or `npx vercel --prod`, then verify real signup/login, records after refresh, isolation, earnings, document handoff and all AI requests. Redeploy after changing environment variables.
7. Review function statuses and provider usage without logging sensitive request bodies. Configure abuse controls and alerts before public sharing.

If connecting a provider reports **OAuth state not found**, restart its authorization from the connection settings in the same browser session. An old callback cannot recreate the missing state. The official Vercel/Git Credential Manager device flows are alternatives for CLI deployment/push.

## Three-minute demo

Start at the honest empty dashboard, create an account, add disposable income/expense entries, show exact net, refresh and sign in again. Switch to Hindi/Punjabi. Review the earnings-sharing dialog and request real guidance when Gemini is configured. Explain a redacted notice, select confirmed facts, generate an editable grievance and copy it. Show that it has not been submitted. Finish by removing disposable records and signing out.

## Judging priorities

| Priority | Parameter         | Evidence                                                                                                                                                                    |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Code quality      | Strict types, separated UI/translations/finance/storage/auth/validation/provider, reproducible lockfile and readable formatting                                             |
| High     | Problem alignment | Worker-focused multilingual dashboard, earnings, rights/safety/schemes assistance, document help and connected grievance flow                                               |
| Medium   | Security          | Server-only secrets, established password hashing, validated sessions and record ownership, strict bounded bodies, safe text, explicit consent/import and abuse limitations |
| Medium   | Efficiency        | Local calculations, CSS chart, small reusable Postgres pool, bounded AI context/output/timeout, debounced saving and no automatic model retries                             |
| Low      | Testing           | Pure-function, route, provider, UI, account isolation/sync and real-database checks; lint/typecheck/build                                                                   |
| Low      | Accessibility     | Landmarks, labels, keyboard navigation/native dialogs, focus indicators, live statuses, chart text alternative, reduced motion and 360px layouts                            |

A development-only advisory remains in `braces` through ESLint's dependency chain with no patched release available when reviewed. Production dependency audit is clean. No formal accessibility certification or exhaustive browser/screen-reader audit is claimed.
