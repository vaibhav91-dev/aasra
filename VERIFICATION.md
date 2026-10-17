# Aasra verification

Checked locally on **17 October 2026 (Asia/Kolkata)** using Node 24.22.0, npm 11.19.1, and the production Next.js build. The brief was executed in phases; each phase's targeted checks passed before the next implementation phase.

## Final automated results

| Command                       | Result                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                | PASS, no disabled lint rules                                                                                                                                         |
| `npm run typecheck`           | PASS, strict TypeScript                                                                                                                                              |
| `npm test`                    | PASS, **31 tests across 4 files**                                                                                                                                    |
| `npm run build`               | PASS without `GEMINI_API_KEY`; `/api/ai` is dynamic Node.js                                                                                                          |
| `npm audit --omit=dev --json` | PASS, zero reported production vulnerabilities                                                                                                                       |
| Full `npm audit --json`       | One unpatched advisory in `braces`, propagated through five development dependency nodes in the ESLint chain. No patched release available when checked; see README. |

Tests cover decimal-to-paise conversion and rejection, positive bounds, income/expense/net arithmetic, zero and negative net, seven-day filtering and empty days, India midnight and year boundaries, invalid dates, validated storage, corrupt/extra/duplicate data, failed storage writes, API schemas, summary consistency, unsupported roles/languages/fields, request size/origin/JSON, missing configuration, provider credential/model/quota/timeout/network/malformed/empty/blocked responses, and server-controlled instructions.

Component tests additionally exercise document privacy consent → explanation → fact selection and confirmation → prefilled grievance → generation → editable draft → copy success and failure → regeneration with form preserved; chat retry in the selected language, clear, unsupported voice hiding; actual tracker persistence failures; and corrupt storage preservation. **All provider responses in these tests are mocks inside test files.** There is no mock AI path in the application.

## Browser checks actually performed

The in-app browser loaded the local **production server**. Disposable QA records were entered through the real UI and removed afterward.

| Check                                 | Result / evidence                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Honest first-use state                | Zero recorded totals, empty chart/list, useful add action, and the warning that zero recorded is not zero actual earnings                                               |
| Add income and expense                | ₹850.50 income and ₹100.25 expense yielded ₹750.25 net on the dashboard                                                                                                 |
| Edit                                  | Income edited to ₹900.50; totals updated                                                                                                                                |
| Delete                                | Native confirmation dialog appeared; confirmed deletion removed the expense and updated totals                                                                          |
| Earnings persistence                  | Both entries and the correct totals survived full refresh                                                                                                               |
| Hindi persistence                     | Hindi navigation/form text and selected language survived refresh                                                                                                       |
| Punjabi                               | Gurmukhi navigation, forms and statuses rendered; document `lang` changed to `pa`                                                                                       |
| Earnings sharing                      | Review dialog showed actual seven-day totals and daily records before confirmation                                                                                      |
| Direct confirmation behavior          | Final build's Share summary & explain immediately requested AI and showed the missing-key error without a second click                                                  |
| Chat error and retry                  | Missing-key error displayed; typed question remained; Retry ran                                                                                                         |
| Document errors                       | Reviewed pasted text remained after the configuration error                                                                                                             |
| Navigation state                      | Pasted document text remained when navigating away and back                                                                                                             |
| Refresh clears sensitive session text | Document text became empty and privacy checkbox unchecked after full refresh                                                                                            |
| Grievance error                       | A completed form retained its facts on a missing-key response                                                                                                           |
| Keyboard                              | Enter activated Earnings and Overview navigation; focus moved to main; native date controls accepted keyboard input; delete dialog initially focused Cancel             |
| Mobile                                | Dashboard and Document Help inspected at 360×800; mobile navigation rendered. Final dashboard document width was 360 at viewport width 360, without horizontal overflow |
| QA cleanup                            | All disposable entries removed on both tested local origins; final dashboard is empty                                                                                   |

Screenshots: [desktop](./screenshots/desktop.jpg), [mobile](./screenshots/mobile.jpg). Temporary viewport override was reset. The local preview was retained at [localhost:3000](http://localhost:3000).

## Actual HTTP checks against the production server

| Request                          | Observed         |
| -------------------------------- | ---------------- |
| `GET /`                          | 200              |
| Valid `POST /api/ai` without key | 503, `CONFIG`    |
| Unknown task / invalid JSON      | 400, `INVALID`   |
| 97,000-byte request              | 413, `TOO_LARGE` |
| Cross-origin request             | 403, `ORIGIN`    |

Every tested AI error response carried `Cache-Control: no-store, max-age=0` and a sanitized structured code.

## Not verified / blocked

- **Real Gemini success**: no key was configured. No live earnings guidance, model language compliance, successful document explanation, or generated grievance was claimed. The successful connected workflow/copy paths were verified only in component tests with test-only mocked provider calls.
- **Vercel deployment**: no connected Vercel tool, installed CLI, token, saved CLI auth directory, linked project, or Git remote was available. Nothing was deployed, and there is no deployed URL. README has the exact remaining import/environment/deployment/verification steps.
- **Voice**: feature detection and unsupported-browser hiding were tested. No microphone permissions were requested; actual speech recognition, denied permission and no-speech cases were reviewed in code, not manually exercised.
- **Storage failures**: verified through automated tests, not by changing browser/system storage permissions.
- No full screen-reader audit, formal WCAG certification, all-browser/device matrix, or exhaustive enlarged-text audit was performed.
- Public endpoint abuse controls, provider quotas, billing alerts, and actual account/model access require operator configuration. Origin checks are not complete abuse protection.
