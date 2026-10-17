# Aasra

**AI Saathi for Gig Workers**

A mobile-first companion for Indian delivery partners, drivers, daily-wage workers, and other informal workers. Record earnings, understand expenses, ask practical questions, explain a pasted document, and prepare a respectful grievance draft.

## Run locally

Use **Node.js 24.x LTS** and npm. The application uses Next.js App Router, strict TypeScript, Tailwind CSS 4, Lucide, and server-side native `fetch` to Gemini. No database or separate backend is needed.

```powershell
npm ci
Copy-Item .env.example .env.local
# Edit .env.local privately to add your Gemini key.
npm run dev
```

On macOS/Linux use `cp .env.example .env.local` instead. Open [localhost:3000](http://localhost:3000).

The dashboard and earnings tracker work without a Gemini key. AI requests return a clear configuration error until a key is configured. Never paste a key into chat, put it in a `NEXT_PUBLIC_` variable, or commit `.env.local`.

### Gemini setup

1. Obtain a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Review Google's terms, data-use settings, and account billing before sending real worker information.
2. In the ignored `.env.local` file, set `GEMINI_API_KEY` to that key.
3. Set `GEMINI_MODEL=gemini-3.5-flash-lite`, or another supported stable text model available to your account. Restart the local server after changing environment variables.

The default was selected from [Google's official model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), checked on 17 October 2026: a stable model aimed at low latency and low cost. Model access, quotas, and availability depend on your Google project. There is no silent model/provider fallback or fake AI answer.

## Workflows

- **Earnings → guidance:** add income/expenses → dashboard updates → Explain my earnings → inspect the exact seven-day summary → confirm sharing with Google Gemini → read guidance. Individual transactions are not sent.
- **Earnings → grievance:** open a payment concern → enter or confirm the disputed amount and facts → generate a draft. A gap in records is never treated as proof of nonpayment.
- **Document → grievance:** paste redacted text → review the sharing notice and confirm → explain → choose Draft a grievance about this → select relevant source facts yourself → confirm → review the prefilled form → generate → edit → copy. The original source remains available in the fact review dialog.
- **Multilingual help:** English, Hindi (Devanagari), and Punjabi (Gurmukhi) navigation, forms, status messages, prompts, and AI response language. Changing interface language also resets the output-language override for subsequent grievances.
- **Voice:** offered only if the browser exposes speech recognition; click to start, review recognized text in the editable field, then send. Browser/online-service support and microphone permission are required. Voice is never automatically sent.

Nothing submits a complaint, files an application, contacts an employer, or reaches an external organization on the worker's behalf.

## Financial rules and persistence

- Money is stored as integer paise. Positive decimal input accepts up to two places, capped at ₹10 lakh per entry. The tracker permits up to 10,000 entries, keeping all aggregates within safe integer bounds.
- Dates are `YYYY-MM-DD`, valid calendar dates from 1900 through today. Reporting uses `Asia/Kolkata`: today plus the previous six calendar days, including zero-entry days.
- Income, expenses, net, daily figures, and counts are computed in code. Negative net is allowed. All-time records are distinct from seven-day totals. Zero recorded earnings never claims the worker earned nothing.
- `aasra-earnings-v1` stores only a versioned list of ID, type, amount, date, and predefined category. There are no worker/employer names, arbitrary notes, or documents in entries.
- `aasra-language` stores the language preference. These are the only application localStorage keys.
- Data is validated on load, including categories, IDs, bounds, dates, unknown fields, and duplicate IDs. Invalid saved data is not overwritten. Use the browser's site-storage controls to remove the `aasra-earnings-v1` key if corrupt. This deletes local earnings, so preserve anything needed first.
- Failed writes show an error and leave the form intact. Success appears only after a successful storage write. Deletions require confirmation.
- Local storage is device/browser specific, unencrypted, and accessible to other people using that browser profile. There is no cloud backup, account, or cross-device sync. Avoid shared devices for private earnings.
- Chats, pasted documents, fact selections, grievance forms, and drafts stay in React memory across section navigation and are cleared by a full refresh. They are not written to localStorage, cookies, logs, or server storage. Submitted text is transmitted to Google Gemini; Google handles it under the applicable service terms. Browser speech services may process voice separately.

## API and security

`POST /api/ai` in `app/api/ai/route.ts` is a Node.js route with a 30-second function duration. Credentials are checked only when a request arrives, so builds succeed without a key. `lib/gemini.ts` is protected by Next.js's `server-only` import guard.

The discriminated request union allows only `chat`, `earnings-explanation`, `document-explanation`, and `grievance-draft`, the three supported languages, and expected fields. It rejects arbitrary system messages and invalid/oversized inputs. Summary arithmetic and daily totals are checked for consistency on the server; the browser remains the source of recorded data.

Limits: 96,000-byte request body enforced while streaming, before JSON parsing; 3,000 characters per user message; 20 history messages and 24,000 total history characters; 8,000 document characters; grievance field limits shown in forms; 2,200 output tokens; a 25-second provider timeout. There are no automatic retries or parallel AI calls. Explicit UI retry preserves the input. Clear chat when the history limit is reached.

Responses use `Cache-Control: no-store`. Clear cross-origin browser requests are rejected; no permissive CORS headers are set. Provider errors and secrets are not returned or logged. Responses are rendered as safe text, never raw HTML. Headers include `nosniff`, frame denial, and a conservative referrer policy.

| Error code  | HTTP | Meaning                                                     |
| ----------- | ---- | ----------------------------------------------------------- |
| INVALID     | 400  | Invalid JSON, task, fields, roles, dates, amounts, or input |
| TOO_LARGE   | 413  | Request body exceeds the byte limit                         |
| ORIGIN      | 403  | Clearly cross-origin browser request                        |
| CONFIG      | 503  | Missing server Gemini key                                   |
| CREDENTIALS | 503  | Provider rejected the server key; not a user login issue    |
| MODEL       | 503  | Unsupported/unavailable configured model                    |
| QUOTA       | 429  | Provider quota or rate limit                                |
| TIMEOUT     | 504  | Provider timed out                                          |
| UPSTREAM    | 502  | Network, invalid provider JSON, or upstream service failure |
| EMPTY       | 502  | Blocked, empty, truncated, or unusable provider output      |

### Before public use

This unauthenticated MVP has **no durable application rate limiter**. Origin checks and UI submission locks do not prevent scripted abuse, distributed traffic, or provider costs. In-memory limits are unreliable across Vercel instances and restarts and would not solve this problem.

Configure a [Vercel WAF rate-limit rule](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) matching `POST /api/ai` and count requests by source IP, with a conservative limit appropriate for your demo. Test shared-network behavior and monitor false positives. Vercel counters are regional and do not provide a global spending cap. Consider Deployment Protection for a limited judging/demo audience. No external security settings were changed by this project.

Review [Gemini project rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), set available quotas, restrict the API key to the intended service, and configure billing alerts in the linked billing project. **Alerts are notifications, not hard spending caps.** Monitor usage and revoke/rotate a compromised key. Do not log bodies, prompts, documents, drafts, authorization headers, or provider payloads.

System instructions reduce some failure modes; they do not guarantee factual correctness or resistance to prompt injection. This app does not retrieve current authoritative legal or scheme sources. Guidance must be checked with relevant official sources; eligibility, deadlines, legal consequences, and AI-generated drafts require human review.

## Validation

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Lint uses the ESLint CLI (not removed `next lint`). Tests use Vitest, with Node tests for financial/provider/route boundaries and jsdom + Testing Library for connected component workflows. Provider responses are mocked only in tests.

See [VERIFICATION.md](./VERIFICATION.md) for the exact checks performed and their limitations. The project also includes a short phase plan in [PROGRESS.md](./PROGRESS.md).

Formatting: `npx prettier --write app components lib tests *.ts *.mjs *.json *.md`.

## Deploy to Vercel

1. Push this project, including `package-lock.json`, to a Git repository. Exclude `.env.local`, credentials, `node_modules`, and `.next` (already ignored).
2. Import the repository in Vercel under your intended account/team and project.
3. Choose the **Next.js** framework preset and set the project root to the directory containing this `package.json`.
4. Use **Node.js 24.x**, the committed npm lockfile, and standard settings: install `npm ci`, build `npm run build`, framework-managed output directory. Do not use static export.
5. Add server-only `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-3.5-flash-lite` in Vercel environment settings for the intended Preview/Production environments. Do not prefix the key with `NEXT_PUBLIC_`.
6. Deploy. Redeploy after environment changes so functions receive the new configuration.
7. Open the real deployment URL. Repeat earnings add/edit/delete/refresh checks, language persistence, chat in each language, earnings sharing, document fact handoff, draft editing and copy. Verify successful real Gemini requests; a successful page render alone is insufficient.
8. Inspect Vercel function errors/statuses and usage without logging sensitive inputs. Configure abuse controls and billing alerts before sharing publicly.

There is no `vercel.json`: standard Next.js deployment defaults are sufficient. No database, writable server storage, Docker, static-only host, or persistent background server is required.

**Delivery access limits:** no Gemini key, Vercel CLI/token, connected Vercel deployment tool, linked Vercel project, or Git remote was present during implementation. No deployment URL is claimed. Supply credentials through local/Vercel settings, authenticate Vercel under the intended account, and follow the steps above. Do not paste credentials into chat.

## Demo script (about three minutes)

1. Start with the honest empty dashboard. Add your own disposable example income and expense. Show exact net calculations, edit an entry, refresh, and distinguish recorded data from actual earnings.
2. Switch to Hindi or Punjabi. Choose Explain my earnings and inspect the data-sharing review. With a real configured key, generate grounded guidance.
3. Paste a short redacted payment notice. Review privacy, request its explanation, choose relevant facts yourself, and transfer them into a grievance.
4. Complete the employer, date, and desired resolution; confirm facts. Generate, edit, and copy the draft. Point out that it has not been submitted.
5. Show an AI error with the key removed in a separate local demo session; the input and earnings remain usable. Remove disposable demo entries afterward.

## Judging priorities

| Priority | Parameter         | Implementation                                                                                                                                                             |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Code quality      | Strict types; separated UI, translations, finance, storage, schemas, prompts, server-only provider; readable formatting; reproducible lockfile                             |
| High     | Problem alignment | Worker-focused dashboard; multilingual earnings, safety/rights/schemes chat, documents, and grievances; connected consent/fact-review workflows                            |
| Medium   | Security          | Server-only key; streaming byte limit; strict server validation; untrusted-source separation; safe text rendering; session-only sensitive text; explicit abuse limitations |
| Medium   | Efficiency        | Local deterministic calculations; CSS chart; native fetch; bounded context/output/timeout; no database, chart library, SDK, or automatic retries                           |
| Low      | Testing           | Financial boundaries, storage corruption/failure, API/route validation, provider failure modes, and connected component tests; production build and browser checks         |
| Low      | Accessibility     | Landmarks, labels, headings, keyboard controls and native dialogs, focus indicators, live statuses, chart text equivalent, reduced-motion support, 360px layout            |

## Known limitations

- Real Gemini accuracy, response language, latency, and account/model access require live testing with a configured key. Successful generation was not demonstrated without one.
- Legal/scheme advice is not verified by retrieval. No OCR, uploads, authentication, complaint submission, external contacts, or benefit applications.
- Voice permission/recognition and every browser/device combination are not verified. Speech services can require internet access. Clipboard may fail in insecure/denied contexts; manual copy remains available.
- A full accessibility certification, screen-reader audit, and every enlarged-text/browser combination were not performed.
- A development-only npm audit advisory remains in `braces` through ESLint's dependency chain, with no patched `braces` release available at review time. Production dependency audit was clean. Do not apply the audit's suggested major downgrade of Next's lint config. Recheck upstream updates before future maintenance.
- No durable endpoint abuse protection is configured. Shared-device storage and unencrypted earnings remain privacy considerations.

## Source map

`app/` — entry, metadata, global styles and API route. `components/` — shared shell, dashboard/tracker, assistant, document flow, grievance and native dialog. `lib/` — translations, pure finance, storage codec, validated request types, prompts, Gemini, client transport. `tests/` — Node and component tests.
