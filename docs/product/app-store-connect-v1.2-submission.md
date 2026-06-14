# App Store Connect Submission Package v1.2

Status: Submitted to App Review; waiting for review

Build: `1.2 (5)`

## Release Status

Updated on June 14, 2026:

- Pull request `#2` merged into `main` at commit `eb551c7`.
- Vercel production deployment `dpl_GNuw7geVAacs8HjFNaaEzvYpNgne` reached `READY` and serves `app.mandysbikefinder.com`.
- The public website deployment `dpl_Bnoz2LECcHTAssjKmHXmAF3xZxhd` also reached `READY`.
- Production `/`, `/privacy`, `/offline`, and `/api/status` returned `200`.
- Settings reports App Store MVP version `1.2`.
- Hosted browser acceptance saved two new evaluations without replacing the existing evaluation; all three remained after reload.
- English and Simplified Chinese switching persisted after reload.
- No browser-console errors or Vercel production error/fatal logs were found during the acceptance pass.
- App Store Connect completed processing `1.2 (5)` at 12:12 AM EDT, but the build remained unavailable because its export-compliance answer was missing.
- The export-compliance answer was completed on June 14. App Store Connect then reported `1.2 (5)` as Testing in the `Internal Testing` group with one tester.
- Added `ITSAppUsesNonExemptEncryption = false` to the native Info.plist so future builds do not stop at the same compliance gate.
- Six Simplified Chinese native source screenshots and final marketing exports were generated at `1320 x 2868`. The final PNG files are RGB with no alpha channel.
- The paired physical iPhone reports Mandy's Bike Finder version `1.2`, build `5`, after updating without deleting the app.
- Device-container inspection confirmed the existing version 1.1 child profile and saved History evaluation remained present after the TestFlight update.
- App Store Connect version `1.2` was created with build `1.2 (5)`, English and Simplified Chinese metadata, localized release notes, review notes, and the Simplified Chinese subtitle.
- The Simplified Chinese product page currently inherits the accepted English screenshots. The six localized Chinese screenshot exports remain ready for a later metadata update.
- Version `1.2 (5)` was submitted to App Review at 3:16 PM EDT on June 14, 2026. App Store Connect reports `Waiting for Review` and notes that review may take up to 48 hours.

## English (U.S.)

### What's New

Mandy's Bike Finder 1.2 makes saved bike decisions more reliable and adds Simplified Chinese:

- Keep multiple similar bike evaluations without one replacing another.
- See model and location details more clearly in History.
- Switch between English and Simplified Chinese.
- Use localized fit, value, risk, seller-message, privacy, and offline guidance.
- Benefit from additional regression coverage for saved decisions and language selection.

### Promotional Text

Compare used kids bike listings with clearer saved decisions and a new Simplified Chinese experience.

### Subtitle

Check fit, value, and risk

## Simplified Chinese

### 本次更新

Mandy's Bike Finder 1.2 提升了已保存评估的可靠性，并新增简体中文：

- 多个相似的自行车评估现在可以分别保存，不会互相覆盖。
- 在历史记录中更清楚地查看型号和地点。
- 可在英文和简体中文之间切换。
- 适配度、价格、风险、卖家消息、隐私和离线说明均支持中文。
- 增加了保存记录和语言选择的回归测试。

### 推广文本

更清楚地评估儿童二手自行车的适配度、价格和风险，并可靠保存每次决定。

### 副标题

评估适配度、价格与风险

### 关键词

儿童自行车,自行车尺寸,二手自行车,适配度,价格评估,家长,单车,购买建议

### 描述

Mandy's Bike Finder 帮助家长在浏览儿童二手自行车时，更快、更清楚地做出判断。

创建孩子的身高、年龄和骑行经验资料，然后通过截图、粘贴链接或文字，或手动输入信息来评估一辆自行车。应用会提供关于尺寸适配、价格、风险和下一步行动的实用建议。

主要功能：

- 孩子资料保存在你的设备上。
- 支持通过截图、链接、文字或手动信息评估车辆。
- 可选的 AI 截图信息提取，仅在你主动操作后运行。
- 无需 AI 也可进行本地适配度、价格和风险分析。
- 提供清晰的建议和实用检查步骤。
- 生成可编辑的卖家询问信息。
- 在设备上保存评估和候选车辆。
- 可在英文和简体中文之间切换。
- 在设置中查看隐私说明并清除本地数据。

无需注册账户或订阅。应用不会自动抓取交易平台页面。AI 截图提取只有在你明确点击后才会开始。

Mandy's Bike Finder 仅提供决策辅助。购买前请务必亲自检查车辆尺寸、刹车、轮胎、车架状况和骑行舒适度。

## App Review Notes

- No account, payment, subscription, or in-app purchase is required.
- Child profiles and saved evaluations remain stored locally on the device.
- Version 1.2 fixes an issue where distinct listings with similar summary fields could replace one another in History.
- The app does not automatically scrape marketplace pages.
- AI screenshot extraction begins only after the user explicitly requests it.
- English and Simplified Chinese can be selected in Settings.
- Existing version 1.1 local data remains compatible with version 1.2.

## TestFlight Acceptance

- Upgrade from `1.1 (4)` to `1.2 (5)` without deleting the app.
- Confirm the existing Profile and History remain available.
- Save two similar listings with different model or location values; both must remain.
- Re-save an exact listing; it must not create a duplicate.
- Switch to Simplified Chinese, force-quit, and relaunch; the language must persist.
- Review Profile, Evaluate, Result, History, Settings, Privacy, and Offline screens.
- Confirm no unexpected permission prompts appear.

## Submission Checks

- [x] Select build `1.2 (5)` after Apple makes it available.
- [x] Add the Simplified Chinese localization in App Store Connect.
- [x] Capture localized Chinese screenshots.
- [x] Confirm support and privacy URLs remain available.
- [x] Recheck the submission against App Store Connect validation and complete export compliance.
- [x] Confirm the physical TestFlight upgrade preserves existing version 1.1 local data.
- [x] Submit version `1.2 (5)` to App Review.

Current App Store Connect status: `Waiting for Review`.

Localized screenshot files:

- Native sources: `artifacts/app-store/v1.2/zh-Hans/source/`
- Final marketing exports: `artifacts/app-store/v1.2/zh-Hans/final/`
- Export command: `npm run export:app-store-screenshots:zh-Hans`
