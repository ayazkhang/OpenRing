# Part 3 — Debugging

## Issue A — Missing or duplicated sensor data after sync

Ring team says collection looks fine, so problem is probably sync → API → DB → UI.

Possible causes:
- Client retries with a new batch id → duplicates
- Upload fails and client doesn't retry → missing data
- Timezone / filter issues on the dashboard
- Missing unique constraint on batch id

How I'd debug:
1. Pick one bad session
2. Compare counts: mobile queue vs API logs vs DB vs what the UI shows
3. Check if duplicates share the same batch id
4. Replay one saved payload against staging

Tools: client logs, API logs, SQL counts (`group by batch_id`), browser network tab, CSV export

What I'd change:
- Keep idempotent batch id (done in this project)
- Client only drops queued data after a clear server ack
- Show last sync / gap warnings on the dashboard

## Issue B — Slow dashboard and exports on bigger studies

Likely:
- Loading all readings at once
- Missing indexes
- Sync CSV download timing out

Quick fixes:
- Add indexes on session + timestamp
- Paginate or downsample the dashboard
- Stream / limit exports

Later:
- Background export job + download link
- Partition big reading tables
- Read replica for heavy reporting

## Issue C — Signup / onboarding broken after a release

Possible causes:
- Frontend/API mismatch after deploy
- Auth / WordPress config (redirect URLs, cookies)
- Slow page / big JS bundle
- CDN serving mixed old/new assets

What I'd do:
1. Roll back or turn off the feature flag if conversion dropped hard
2. Reproduce in browser (console + network)
3. Check error tracking and the signup funnel in analytics
4. Confirm env/config for auth and the website

To reduce risk next time:
- Smoke test signup in CI / staging
- Staged rollout
- Monitor the onboarding funnel
