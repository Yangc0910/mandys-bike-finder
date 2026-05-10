# PRD v0.2 — Shift to Web MVP

Status: Historical  
Primary platform direction at the time: Web MVP  
Current status: Superseded by v0.4, but the web-first decision remains current

## Summary

The platform shifted from an iOS app to a web MVP. This made the project more practical as a first product-building exercise and reduced the setup burden before learning from actual user workflows.

## Product Name Direction

The product name direction became Mandy's Bike Finder. The Mandy story made the product feel concrete and personal: the tool was inspired by helping Mandy find the right used bike, while also becoming useful to other parents facing similar marketplace decisions.

## Product Story Added

The product story shifted from a generic kids bike advisor to a personal parent helper. This clarified the emotional center of the product: parents are not optimizing a spreadsheet; they are trying to make a safe, practical, good-enough choice for a child.

## Price Reference Became More Important

Price reference checking became more important because a web app can more easily use replaceable search providers or retailer references later. The product should help parents compare a used asking price with trusted new-bike reference ranges.

## Web-Friendly Listing Input

Listing input changed to web-friendly flows:

- Paste a listing link first.
- Upload a screenshot when the link cannot be read.
- Use manual input as a reliable fallback.

The product should not depend on automatic Facebook Marketplace or Craigslist scraping.

## Trusted Retailer References

Online price lookup should use trusted retailers, not marketplace prices. Trusted references include Walmart, Target, Amazon, Dick's Sporting Goods, REI, Costco, Sam's Club, and official bike brand websites.

## Search Provider Abstraction

Google search was considered, but implementation should use a replaceable search provider abstraction so the product is not locked to a single provider or API. The app should also work in fallback mode without live search.

## Manual Fallback Importance

Manual input and fallback modes were considered important because marketplace links may be inaccessible, screenshots may be unclear, and families still need the tool to work even when external APIs fail.
