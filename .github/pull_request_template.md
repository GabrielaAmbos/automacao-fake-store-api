<!--
  Reminder: the CI check on this pull request runs ESLint only.

  The Fake Store API answers 403 to GitHub-hosted runners, so the API suite
  cannot run here — a green check does NOT mean the tests passed. The pre-push
  hook runs them locally; if you pushed with --no-verify, run `npm test` before
  asking for a review.
-->

## What changed

<!-- One or two sentences. What does this do, and why? -->

## Checklist

- [ ] `npm run lint` is clean
- [ ] `npm test` passes locally (**40/40**) — CI does not run this
- [ ] Docs updated, if the change affects behaviour or setup
- [ ] `cypress/support/index.d.ts` updated, if a custom command was added, renamed or removed

## Notes for the reviewer

<!-- Anything worth flagging: a deliberate trade-off, something left out, a caveat. -->
