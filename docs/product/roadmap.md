# Product Roadmap

## Current Baseline: v0.4

The project has a working local Python prototype for visible-browser listing monitoring, configurable ranking, deduplication, and Gmail summaries.

## Near-Term

- Continue refining bike-specific scoring fields. Bike type, frame size, wheel size, and pickup constraints now have first-pass configurable signals; distance and richer condition parsing still need dedicated treatment.
- Add clearer source adapter conventions for each marketplace or listing page type.
- Improve result summaries so a user can scan title, price, location, score, and reason quickly.
- Add test coverage around source selection and scoring edge cases as preferences become more bike-specific.

## Mid-Term

- Add a lightweight local review workflow for accepted, rejected, and maybe listings.
- Use feedback from reviewed listings to tune scoring weights.
- Introduce saved preference profiles for different search intents.
- Consider a simple local UI once the listing data model stabilizes.

## Later

- Multi-channel notifications if email is no longer enough.
- Richer analytics about which sources produce useful listings.
- A polished app experience for setup, source management, and review.

## Open Product Questions

- Which bike categories matter most first: commuter, road, mountain, kids, cargo, e-bike, or general bargains?
- How should distance and pickup friction affect ranking?
- Which brands, sizes, and condition phrases are strong positive or negative signals for Mandy?
- Should the product optimize for the cheapest bikes, best value, or fastest actionable alerts?
