# Aasra account-storage rollout

Updated 17 October 2026 (Asia/Kolkata).

- Requested public repository verified: https://github.com/vaibhav91-dev/aasra
- Vercel project created and linked: `pwp3/aasra` (Hobby), Next.js, Node 24.x.
- Production is live: https://aasra-one.vercel.app (Vercel status READY).
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

- Source pushed successfully to public repository main. Production runtime commit: d702c38bede3a54ec98d3e0cff9331dbf648b1a9.
- Production deployment dpl_5qeU8XH9EmbaERAWQXEVympBznye is READY; Vercel production build passed.
- Public homepage, account configuration and auth health returned HTTP 200.
- Real production database tests passed: account creation, earnings/chat/grievance persistence, revision conflict handling, account isolation, hashed passwords, logout and username/password re-login. Disposable test accounts were cleaned up.
- All four real production Gemini requests passed with nonempty responses: Hindi assistant, English earnings explanation, Punjabi document explanation and Hindi grievance draft. No mock AI was used.
- Production browser rendered the dashboard and account dialog with labeled username/password controls and recovery limitations. Account persistence was exercised through real HTTP requests; hydration/autosave/remount behavior through component tests.
- Automatic GitHub deployments remain pending repository access: GitHub login is connected, but Vercel git connect still fails. User was asked to grant the Vercel GitHub App access to this repository. CLI production deployment is already working.

## Remaining product limitations

Email verification, password-reset email delivery and account deletion self-service are not configured. Use strong unique passwords. The UI explains recovery limitations. Public AI endpoint infrastructure abuse controls/provider quotas/billing alerts require operator attention; alerts are not spending caps. Preview/Development and Production currently share the provisioned demo database; use separate database branches before a broader rollout.

See README for setup, privacy and maintenance. VERIFICATION.md documents the original session-only MVP and is historical; this report supersedes its original deployment-access blocker and sensitive-state persistence behavior.

