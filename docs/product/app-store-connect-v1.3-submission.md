# App Store Connect Submission Package v1.3

Status: Submitted to App Review; waiting for review

Build: `1.3 (6)`

## Release Status

Updated on July 5, 2026:

- Version 1.3 was implemented and pushed to `main` at commit `348d5be`.
- Vercel production deployment `dpl_Foz6zxF8eDtToPHw4UczfJo4iy3r` reached `READY` and was aliased to `https://app.mandysbikefinder.com`.
- Production `/`, `/privacy`, and `/api/status` returned `200`; `/api/status` reported `ok: true`.
- Hosted browser acceptance at `390 x 844` confirmed the startup entry screen, Rider -> Listing -> Saved flow map, Settings version `1.3`, no Next.js error overlay, and no browser console errors.
- `npm run test`, `NEXT_PUBLIC_APP_STORE_MVP_MODE=true npm run build`, `npm run cap:doctor`, and `npm run cap:sync` passed.
- Generic iOS Release archive with signing disabled passed for version `1.3 (6)`.
- Automatically signed generic iOS Release archive passed for version `1.3 (6)`.
- App Store Connect export/upload succeeded at 11:32 PM EDT on July 4, 2026.
- Apple processing completed, build `1.3 (6)` was selected for App Store version `1.3`, and English plus Simplified Chinese v1.3 release notes were saved.
- Version `1.3 (6)` was submitted to App Review at about 12:01 AM EDT on July 5, 2026. App Store Connect reports one item submitted and says review may take up to 48 hours.

## English (U.S.)

### What's New

Mandy's Bike Finder 1.3 makes the app easier to start and easier to follow:

- Added a short branded startup entry screen.
- Added clearer visual guidance across Profile, Evaluate, History, and Settings.
- Added a Rider -> Listing -> Saved flow map so parents can see where they are in the decision process.
- Added more helpful icons on key actions, review sections, results, saved decisions, and privacy controls.
- Preserved the same local Profile, local History, optional AI extraction, and no-account workflow.

### Promotional Text

A clearer app start and more visual guidance for checking used kids bike fit, value, and risk.

### Subtitle

Check fit, value, and risk

## Simplified Chinese

### 本次更新

Mandy's Bike Finder 1.3 让 App 更容易开始使用，也更容易跟随流程：

- 新增短暂的品牌启动进入画面。
- 在骑手资料、评估、历史记录和设置中加入更清楚的图标引导。
- 新增“骑手 -> 商品 -> 保存”的流程提示，让家长更容易知道当前步骤。
- 在关键操作、确认信息、结果、已保存决定和隐私控制中加入更多视觉提示。
- 保留本地骑手资料、本地历史记录、可选 AI 截图识别和无需账号的使用方式。

### 推广文本

更清楚地开始使用 App，并通过图标引导评估儿童二手自行车的适配度、价格和风险。

### 副标题

评估适配度、价格与风险

## App Review Notes

- No account, payment, subscription, or in-app purchase is required.
- Version 1.3 adds a short startup entry screen, but users can continue without an account and the app still opens into the core Profile/Evaluate/History/Settings workflow.
- Child profiles and saved evaluations remain stored locally on the device.
- The app does not automatically scrape marketplace pages.
- AI screenshot extraction begins only after the user explicitly requests it.
- Local fallback analysis works without AI.
- Existing version 1.2 local data remains compatible with version 1.3.
- The hosted app at `https://app.mandysbikefinder.com` now serves version `1.3`.

## TestFlight Acceptance

- Upgrade from `1.2 (5)` to `1.3 (6)` without deleting the app.
- Confirm existing Profile and History remain available.
- Confirm the startup entry screen appears briefly and then opens Profile.
- Confirm the Rider -> Listing -> Saved flow map is visible and does not truncate on small iPhone widths.
- Complete a manual Evaluate flow and save the result to History.
- Confirm Settings displays version `1.3`.
- Confirm `/privacy`, `/offline`, and local data controls remain reachable.
- Confirm no unexpected account, payment, notification, tracking, microphone, or location prompts appear.

## Submission Checks

- [x] Advance native version metadata to `1.3 (6)`.
- [x] Deploy version `1.3` to `https://app.mandysbikefinder.com`.
- [x] Run automated web tests.
- [x] Run production App Store-mode build.
- [x] Run Capacitor doctor and sync.
- [x] Run unsigned iOS Release archive.
- [x] Run automatically signed iOS Release archive.
- [x] Upload build `1.3 (6)` to App Store Connect.
- [x] Wait for App Store Connect processing to complete.
- [x] Select build `1.3 (6)` in the App Store Connect version record.
- [ ] Complete internal TestFlight upgrade acceptance.
- [x] Submit version `1.3 (6)` to App Review.

Current App Store Connect status: submitted to App Review and waiting for review.
