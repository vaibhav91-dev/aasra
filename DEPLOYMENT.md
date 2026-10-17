# Aasra account-storage rollout

Updated 17 October 2026 (Asia/Kolkata).

- Requested public repository verified: https://github.com/vaibhav91-dev/aasra
- Vercel project created and linked: `pwp3/aasra` (Hobby), Next.js, Node 24.x.
- Verified project domain: `aasra-one.vercel.app`. A domain assignment alone does not mean deployment is ready; deployment verification is recorded below after publication.
- Neon resource provisioned through Vercel and connected to Aasra. User accepted the provider terms. Private environment variables remain outside Git.
- Better Auth username/password accounts, database-backed auth rate limits and per-user snapshot storage implemented. Application secrets generated privately; no default shared password exists.
- Migration created the auth and worker-data schema. Auth/data configuration verified; no real worker records were used in testing.

## Validation

- Lint and strict typecheck pass.
- 40 automated tests pass across 6 files.
- Production build passes; routes include `/api/auth/[...all]`, `/api/account`, `/api/data`, `/api/ai`.
- Runtime dependency audit: no reported vulnerabilities. The documented development-only `braces` advisory remains.
- Real database integration test passed: unauthenticated access denied; earnings/chat/draft read back from Postgres; stale writes rejected; second account isolated; password hash verified; username/password re-login restored records. Both disposable accounts were removed.
- Cloud hook tests verify hydration, debounced autosave, restoration on remount and preserving unsaved work after revision conflicts. No sensitive data is written to browser storage by cloud sync.

## Publication checks

Git push, actual production publication, browser checks, and real Gemini request results are pending the final publication step. This file is updated with observed results after deployment.

## Remaining product limitations

Email verification, password-reset email delivery and account deletion self-service are not configured. Use strong unique passwords. The UI explains recovery limitations. Public AI endpoint infrastructure abuse controls/provider quotas/billing alerts require operator attention; alerts are not spending caps. Preview/Development and Production currently share the provisioned demo database; use separate database branches before a broader rollout.

See README for setup, privacy and maintenance. VERIFICATION.md documents the original session-only MVP and is historical; this report supersedes its original deployment-access blocker and sensitive-state persistence behavior.
