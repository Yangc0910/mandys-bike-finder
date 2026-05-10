# PRD v0.4 — Action, Reporting, and Retention Features

Status: Current historical record  
Current source of truth: `docs/PRD.md`

## Summary

Version v0.4 turned Mandy's Bike Finder from a pure analysis tool into a parent decision assistant that helps the user decide what to do next, what to ask, how to message the seller, and how to keep or share the recommendation.

## Child Profile Style Preference

Gender/style preference was added to the child profile:

- Boy-style.
- Girl-style.
- All good / no preference.

This is not meant to stereotype children. It exists because used listings often contain terms such as "girls bike," "boys mountain bike," "princess bike," or "Barbie-like bike," and those labels can affect whether a child likes the bike and whether the design has long-term appeal.

## Dimension-Level Assessments

Dimension-level qualitative assessments were added:

- Fit.
- Price.
- Condition.
- Brand.
- Color/kid appeal.
- Risk.

These dimensions help parents see why the overall recommendation is green, yellow, or red.

## Internal Scores, Qualitative UI

Internal scores can exist for implementation, but user-facing output should remain qualitative. The app should not expose precise numeric scores because they imply a level of accuracy the MVP does not have.

## Negotiation Boost

Negotiation Boost was added to help generate concise seller follow-up messages. It supports common parent needs such as asking whether the bike is available, asking safety questions, making a lower offer, confirming pickup, and walking away politely.

## Email Report

Email report was added so users can keep a record or share the recommendation with a spouse or family member. This creates practical user value beyond the one-time analysis screen.

## Backend Metadata Logging

Backend metadata logging was added to support future analytics and monetization. The product should learn which recommendations are created and emailed, while minimizing unnecessary personal data.

## Privacy Principle

Store buckets instead of unnecessary precise child data. For example, store a height bucket rather than exact child height when logging report metadata.
