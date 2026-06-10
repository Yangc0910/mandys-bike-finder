# Post-Launch Product Roadmap

Last updated: 2026-06-10

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

## Version 1.2: Evidence-Led Improvements

Version 1.2 should be selected after reviewing v1.1 usage, App Store feedback, support questions, and observed flow friction. Candidate themes may include:

- More useful comparison and shortlist tools within local History.
- Better fit education and seller inspection guidance.
- Accessibility and larger-text refinements.
- Performance and maintainability improvements that do not change provider boundaries.
- Carefully selected sharing/export improvements if privacy and product value are clear.

Version 1.2 should not be assumed to include accounts, payments, subscriptions, or marketplace automation. Those require separate product, privacy, App Store, and architecture decisions.

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
