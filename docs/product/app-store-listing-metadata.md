# App Store Listing Metadata Draft

Status: Product draft for App Store Connect preparation  
Last updated: 2026-05-25

## Product Positioning

Mandy's Bike Finder is a mobile decision-support tool that helps parents quickly evaluate whether a used kids bike listing may fit their child, appears reasonably priced, and is worth contacting the seller about.

This draft is intentionally conservative. It should not imply automatic marketplace scraping, guaranteed safety, guaranteed price accuracy, account features, payments, subscriptions, or Bike Scout automation in the first App Store MVP.

## App Name Options

| Option | Notes |
| --- | --- |
| Mandy's Bike Finder | Best first-version choice. Personal, memorable, and already matches the product identity. |
| Mandy Bike Finder | Slightly shorter and easier to type, but less natural than the current brand. |
| Kids Bike Finder | Clear and searchable, but generic and less ownable. |
| Used Kids Bike Check | Very descriptive, but sounds more like a utility than a product brand. |
| Bike Fit Finder for Kids | Clear fit positioning, but underplays value/risk and seller decision support. |

Recommended app name:

> Mandy's Bike Finder

## Subtitle Options

Apple subtitles are short. These should be checked against App Store Connect character limits before submission.

1. Find the right used kids bike
2. Check fit, value, and risk
3. Used bike help for parents
4. Kids bike fit and deal check
5. Decide before you message

Recommended subtitle:

> Check fit, value, and risk

## Short Promotional Text Drafts

Option A:

> Quickly check whether a used kids bike listing may fit your child, looks fairly priced, and is worth contacting the seller about.

Option B:

> A practical helper for parents comparing used kids bikes: profile your child, review a listing, and save the decision for later.

Option C:

> Turn a used bike listing into a clearer yes, maybe, or skip decision before you message the seller.

## Description Draft

Mandy's Bike Finder helps parents make faster, clearer decisions when browsing used kids bike listings.

When you find a bike on a marketplace, parent group, or local listing site, it can be hard to know whether the bike is the right size, whether the price seems reasonable, and what questions to ask before pickup. Mandy's Bike Finder gives you a focused mobile workflow for checking the listing before you contact the seller.

### What It Does

Create a child profile with height, age, and riding experience. Then evaluate one bike listing at a time using a screenshot, pasted link/text, or manual entry. The app provides practical guidance on likely fit, value, risk, and next steps.

### Who It Is For

Mandy's Bike Finder is for parents and guardians shopping for used kids bikes and trying to decide whether a listing is worth pursuing.

### Key Features

- Child bike-fit profile stored on your device.
- Listing evaluation from screenshot reference, pasted link/text, or manual details.
- Local fallback analysis for fit, deal/value, and risk.
- Overall recommendation to help decide whether to contact the seller.
- Seller message draft with practical questions.
- Saved evaluations and shortlist history on your device.
- Settings with privacy information and local data controls.

### Privacy And Local Data

The App Store MVP does not require an account. Child profiles and saved evaluations are stored on your device, and you can clear local data in Settings.

AI features, if enabled, are optional and only start after a clear user action. Selecting a screenshot or pasting text does not automatically send data to AI. Marketplace links and screenshots are treated as user-provided references. The app does not automatically scrape Facebook, OfferUp, Craigslist, or login-gated marketplace pages.

### Important Note

Mandy's Bike Finder provides decision support only. It does not guarantee bike safety, seller reliability, marketplace availability, or exact pricing. Always inspect fit, brakes, tires, frame condition, rust, and ride comfort before purchase.

## Keywords Brainstorm

These are brainstorming ideas, not a final App Store keyword string.

### Kids Bike

- kids bike
- child bike
- youth bike
- bike size
- bike fit
- bicycle fit
- children bicycle

### Used Bike

- used bike
- secondhand bike
- used bicycle
- bike listing
- bike value
- bike deal
- bicycle price

### Parent Decision Support

- parents
- family
- shopping helper
- buying guide
- seller message
- local pickup
- safety checklist

### Marketplace Decision Support

- listing check
- marketplace helper
- used listing
- price check
- risk check
- shortlist
- saved decisions

Avoid relying on competitor or marketplace names as keywords unless reviewed against App Store metadata guidance.

## Screenshot Plan

1. Profile
   - Show child profile with height, age, riding experience, and recommendation summary.
   - Suggested caption: `Start with your child's fit profile`

2. Evaluate
   - Show screenshot/link/text/manual input options and editable listing fields.
   - Suggested caption: `Review one used bike listing at a time`

3. Result
   - Show overall recommendation plus fit, deal/value, risk, and seller message.
   - Suggested caption: `See fit, value, risk, and next questions`

4. History
   - Show saved evaluations with shortlist/favorite state.
   - Suggested caption: `Save bike checks and compare later`

5. Settings / Privacy
   - Show privacy, AI, marketplace disclosure, and local data controls.
   - Suggested caption: `Local data controls stay easy to find`

Screenshot notes:

- Use real app screens, not marketing-only art.
- Do not show Bike Scout, payment, account, email report, PDF export, or automated marketplace search in first-version screenshots.
- Avoid implying automatic marketplace scraping or guaranteed safety.

## App Review Notes Draft

Mandy's Bike Finder App Store MVP is a focused mobile decision-support tool for parents evaluating used kids bike listings.

Review notes:

- No account is required.
- No payment, subscription, or in-app purchase is included in the first App Store MVP.
- The app does not automatically scrape Facebook, OfferUp, Craigslist, or login-gated marketplace pages.
- Marketplace links, pasted text, and screenshots are user-provided references.
- AI, if enabled, only runs after an explicit user action. Initial app load does not call OpenAI or an LLM.
- Local fallback analysis works without AI.
- OpenAI/provider keys remain server-side.
- Child profile and saved evaluations are stored locally on the device.
- Users can clear child profile, history, or all App Store MVP local data from Settings.

Suggested reviewer test path:

1. Open the app.
2. Create a child profile in `Profile`.
3. Go to `Evaluate`.
4. Enter listing details manually.
5. Tap the local evaluate action.
6. Save the result to `History`.
7. Open `Settings` to review privacy disclosures and local data controls.

## Age Rating / Privacy Considerations To Confirm

These are product review questions, not legal conclusions.

- Confirm whether child profile fields affect App Store privacy labels or age-rating answers.
- Confirm whether the app is intended for parents/guardians rather than children.
- Confirm whether optional AI processing is enabled in the first submitted build.
- Confirm whether screenshots are processed only after explicit user action in the shipped build.
- Confirm that no account, payment, subscription, push notification, analytics, or tracking is included in the first App Store MVP.
- Confirm whether web MVP email report features remain outside the App Store MVP surface.
- Confirm public privacy policy URL and final privacy contact email before submission.
- Confirm App Review notes explain local fallback behavior and no automatic marketplace scraping.

## Deferred From First App Store MVP

- Email report.
- PDF export.
- Bike Scout or automatic deal search.
- Marketplace scraping or background monitoring.
- Waitlist.
- Payment/subscription.
- Account/login.
- Push notifications.
