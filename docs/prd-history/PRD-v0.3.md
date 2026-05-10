# PRD v0.3 — Real-World Parent Decision Logic

Status: Historical  
Primary platform direction at the time: Web MVP with parent-centered decision logic  
Current status: Superseded by v0.4

## Summary

Version v0.3 made the product more realistic for parents shopping for children's bikes. The analysis expanded beyond fit and price into the practical reasons a child will or will not use a bike.

## Color and Kid Appeal

Bike color and style were added as key purchase factors. For children's bikes, color and kid appeal strongly affect whether the child will actually use the bike. A bike that is technically the right size and price may still be the wrong purchase if the child dislikes the style or if the design feels too babyish.

## Listing Input Priority

Listing link and screenshot upload were prioritized over manual entry. This better matches the real parent workflow: a parent sees a listing, pastes a link, or shares a screenshot. Manual entry became a fallback rather than the primary path.

## Qualitative Output

A numeric score was replaced by a red/yellow/green qualitative meter. This avoided fake precision and made the recommendation easier to understand:

- Green: worth contacting.
- Yellow: ask more before deciding.
- Red: probably skip.

## API Cost Control

API cost-control requirements were added:

- Per-session limits.
- Global daily limits.
- Caching.
- Fallback mode.

This made cost control a product requirement rather than an afterthought.

## Parent-Centered Deal Logic

Deal logic became more parent-centered. The goal was no longer simply to find the cheapest bike. The product should help parents weigh fit, price, condition, brand, style, and uncertainty before contacting a seller.
