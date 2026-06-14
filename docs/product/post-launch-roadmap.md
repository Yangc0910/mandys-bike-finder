# Post-Launch Product Roadmap

Last updated: 2026-06-13

## Baseline

Mandy's Bike Finder version 1.0 is live on the App Store and is the stable production baseline.

- Production tag: `v1.0.0-app-store-release`
- Production branch policy: `main` represents the deployable production line.
- Version 1.1 integration branch: `release/v1.1-ui-polish`
- Public web MVP: `https://www.mandysbikefinder.com`
- App Store hosted app: `https://app.mandysbikefinder.com`

## Release Principles

- Prefer small, reversible updates over broad rewrites.
- Preserve local-first utility and explicit AI consent.
- Keep all provider credentials on the server.
- Keep the public web MVP isolated from App Store UI changes.
- Validate each update in preview before merging to production.
- Tag every App Store production version after production verification.

## Version 1.1: App Polish

Primary outcome: make the shipped app feel clearer, calmer, more trustworthy, and more consumer-ready.

Focus:

- GUI and visual-system polish.
- Better mobile interaction and first-time guidance.
- Clearer Evaluate and result flows.
- Better History and Settings trust surfaces.
- Improved launch, loading, offline, and error states.
- Upgraded App Store screenshot presentation.

Non-goals:

- Accounts, cloud sync, subscriptions, payments, Bike Scout automation, marketplace scraping, paid features, major AI changes, or architecture rewrites.

Release readiness:

- Core v1.0 behavior remains intact.
- No automatic initial LLM call.
- No client-side provider secrets.
- Mobile regression and hosted preview verification pass.
- App Store screenshots and release notes are ready.

## Version 1.2: History Reliability And Chinese Localization

Primary outcome: make saved decisions dependable and make the complete App Store workflow usable in Simplified Chinese.

Confirmed scope:

- Fix different listings being merged when their visible summary fields are similar.
- Preserve exact-repeat deduplication and the 10-record local History limit.
- Make similar saved listings easier to distinguish with model and location context.
- Add persistent English / Simplified Chinese language selection.
- Localize the core app shell, analysis results, Privacy, and offline recovery.
- Preserve existing local Profile and History data without migration.

Release proof:

- Three similar listings can be saved and reopened as three correct snapshots.
- Re-saving one exact evaluation does not increase the count.
- English and Chinese flows pass physical-device and hosted regression checks.
- Chinese App Store metadata and screenshots are ready before submission.

Deferred candidates:

- Two-bike comparison.
- History sorting and private saved-item nicknames.
- Accounts, cloud sync, payments, subscriptions, and marketplace automation.

## Version Control Policy

- Stable releases use annotated tags such as `v1.1.0-app-store-release`.
- Release branches use `release/v<major>.<minor>-<theme>`.
- Narrow production fixes use `hotfix/v<major>.<minor>.<patch>-<topic>`.
- Feature/task branches should be short-lived and merge into the active release branch.
- Do not force-push `main`, release tags, or shared release branches.
- A tag is created only from the commit confirmed as deployed and submitted/released.

## Decision Gates

Before starting a new release theme:

1. Confirm the user problem and expected outcome.
2. Confirm that the work fits the intended release scope.
3. Identify affected production guardrails.
4. Split the work into independently reviewable tasks.
5. Define preview, regression, and rollback requirements.
