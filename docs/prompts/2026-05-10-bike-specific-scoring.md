# Bike-Specific Scoring Prompt

Date: 2026-05-10  
Status: Completed

## Prompt Summary

Continue work on Mandy's Bike Finder after the repository baseline was created.

## Original User Request

继续 Mandy's Bike Finder Project 的工作

## Implementation Notes

The work picked up the first near-term roadmap item by adding configurable bike-specific scoring signals:

- Desired bike type keywords.
- Excluded bike type keywords.
- Preferred frame size keywords.
- Preferred wheel size keywords.
- Pickup constraint keywords.

The scoring remains explainable and local. Matching desired types and sizes adds capped bonuses, while excluded types and pickup constraints apply capped penalties. Documentation, example configuration, release notes, and unit tests were updated.

## Follow-Up Decisions

Distance parsing and richer condition parsing remain future work because they need more source-specific listing structure than the current visible-text scorer can reliably infer.
