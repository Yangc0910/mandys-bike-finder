import type { AnalysisResult, ChildProfile, Listing, MeterResult } from "./types";

export type AppLocale = "en" | "zh-Hans";

export const APP_LOCALE_STORAGE_KEY = "mbf.appStore.locale";

const zhHans: Record<string, string> = {
  "Mandy's Bike Finder": "Mandy 自行车助手",
  Profile: "骑手资料",
  Evaluate: "评估",
  History: "历史",
  Settings: "设置",
  Required: "必填",
  Optional: "选填",
  Edit: "编辑",
  Cancel: "取消",
  Copy: "复制",
  "Text / link": "文字 / 链接",
  Manual: "手动输入",
  "Add listing": "添加商品",
  Review: "确认信息",
  Result: "结果",
  "You're offline": "当前离线",
  "Saved Profile, History, and local guidance remain available. AI screenshot extraction waits for a connection.": "已保存的骑手资料、历史记录和本地建议仍可使用。AI 截图识别需要联网。",
  "Back online": "已恢复联网",
  "AI extraction and other server actions are available again.": "AI 识别和其他联网功能现已恢复。",
  "Build a reusable rider profile for clearer fit guidance on every bike check.": "建立可重复使用的骑手资料，让每次选车都获得更准确的尺寸建议。",
  "Your fit starting point": "从合适尺寸开始",
  "Find a bike size that feels manageable now": "找到孩子现在容易掌控的自行车尺寸",
  "Height, age, and riding confidence help Mandy suggest a practical wheel size before you evaluate a listing.": "身高、年龄和骑行熟练度可以帮助 Mandy 在评估商品前推荐合适的轮径。",
  "Add three rider basics": "填写三项基本信息",
  "Height, age, and riding experience are required.": "身高、年龄和骑行经验为必填项。",
  "See a fit-first recommendation": "先看尺寸建议",
  "Get a starting wheel size, bike type, and growth caution.": "获得建议轮径、车型和成长空间提醒。",
  "Reuse it for every check": "每次评估都可重复使用",
  "The profile stays on this device. No account or cloud sync.": "资料仅保存在本设备，无需账号，也不会同步到云端。",
  "Set up rider profile": "建立骑手资料",
  "Saved on this device": "已保存在本设备",
  "Best size to start with": "建议起步尺寸",
  "Fit first": "尺寸优先",
  "Why this size": "为什么推荐这个尺寸",
  "Growth caution": "成长空间提醒",
  "Style guidance": "车型建议",
  "This is a starting point, not a safety guarantee. Confirm standover height, brakes, tires, frame condition, and test-ride comfort before buying.": "这只是选车起点，并非安全保证。购买前请确认跨高、刹车、轮胎、车架状况，并让孩子试骑。",
  "Remove rider profile": "移除骑手资料",
  "Remove this profile from this device?": "从本设备移除这份资料？",
  "Saved History will stay available.": "已保存的历史记录会继续保留。",
  "Keep profile": "保留资料",
  "Update profile": "更新资料",
  "Three required details": "三项必填信息",
  "Edit rider profile": "编辑骑手资料",
  "Set up your rider": "建立骑手资料",
  "Saved locally on this device. No account needed.": "仅保存在本设备，无需账号。",
  "Rider basics": "骑手基本信息",
  "Height, age, and riding experience shape the fit recommendation.": "身高、年龄和骑行经验会影响尺寸建议。",
  Height: "身高",
  Age: "年龄",
  "Riding experience": "骑行经验",
  Beginner: "初学",
  Comfortable: "较熟练",
  Confident: "熟练",
  Advanced: "进阶",
  "Optional personalization": "个性化选项",
  "These details can refine presentation but never block fit guidance.": "这些信息可优化建议，但不会影响基本尺寸判断。",
  "Child name / nickname": "孩子姓名 / 昵称",
  Weight: "体重",
  "Style preference": "风格偏好",
  "Color preference": "颜色偏好",
  "All good / no preference": "都可以 / 无偏好",
  "Boy-style": "偏男孩风格",
  "Girl-style": "偏女孩风格",
  "Save profile": "保存资料",
  "Save the profile first, then continue to Evaluate.": "请先保存资料，再继续评估自行车。",
  "Enter height to estimate bike size.": "请输入身高以估算自行车尺寸。",
  "Check height. Use a child-height value.": "请检查身高，并填写合理的儿童身高。",
  "Enter age to improve the fit recommendation.": "请输入年龄以完善尺寸建议。",
  "Check age. Use a value from 2 to 18.": "请检查年龄，并填写 2 至 18 岁之间的数值。",
  "Choose riding experience.": "请选择骑行经验。",
  "Height value": "身高数值",
  feet: "英尺",
  inches: "英寸",
  "Optional nickname": "选填昵称",
  "Weight value": "体重数值",
  "No larger growth option is recommended now.": "目前不建议选择更大的成长尺寸。",
  "Prioritize fit and manageable controls first.": "优先考虑合适尺寸和容易掌控的操控部件。",
  "One listing at a time": "一次评估一辆车",
  "Add a used-bike listing, confirm the details, then get local fit, value, and risk guidance.": "添加二手自行车商品，确认信息后获得本地尺寸、价格和风险建议。",
  "Profile needed for fit": "需要骑手资料",
  "Save a rider profile first": "请先保存骑手资料",
  "Height, age, and riding experience power the fit recommendation. Listing details you add here will stay available while you switch tabs.": "身高、年龄和骑行经验用于生成尺寸建议。切换页面时，已填写的商品信息会继续保留。",
  "Rider confirmed": "已确认骑手",
  "Choose how to add the listing": "选择添加商品的方式",
  "Start with the information you already have. You can edit every field before analysis.": "从你已有的信息开始，分析前所有字段都可以修改。",
  "Listing input method": "商品输入方式",
  "Attach an image for local preview, then tap AI extraction if you want Mandy to read visible listing details.": "添加图片进行本地预览；如需 Mandy 读取图片中的商品信息，再手动启动 AI 识别。",
  "Save the link as a reference and paste readable listing text. No marketplace page is scraped automatically.": "保存链接作为参考，并粘贴可读的商品文字。App 不会自动抓取平台页面。",
  "Enter details yourself and use local guidance. No AI is required.": "自行输入信息并使用本地建议，无需 AI。",
  "Best when the listing is easiest to capture": "适合直接截图的商品",
  "Choose an image for local preview. AI reads it only after you explicitly request extraction.": "选择图片进行本地预览。只有你明确启动识别后，AI 才会读取图片。",
  "Best when you can copy the listing text": "适合可以复制商品文字的情况",
  "Keep the URL as a reference and paste readable details. Marketplace pages are not scraped automatically.": "保留网址作为参考，并粘贴可读信息。App 不会自动抓取平台页面。",
  "Best when you already know the key details": "适合已经知道关键信息的情况",
  "Enter the price, wheel size, and condition yourself. No AI is needed.": "自行输入价格、轮径和车况，无需 AI。",
  "Choose a listing screenshot": "选择商品截图",
  "Add listing text or a reference link": "添加商品文字或参考链接",
  "Enter the listing details yourself": "手动填写商品信息",
  "Nothing is analyzed or sent to AI just by adding information.": "仅添加信息不会触发分析，也不会发送给 AI。",
  "Choose listing screenshot": "选择商品截图",
  "Replace listing screenshot": "更换商品截图",
  "JPG, PNG, or WEBP · Maximum 5 MB": "JPG、PNG 或 WEBP，最大 5 MB",
  Remove: "移除",
  "Optional AI extraction": "可选 AI 识别",
  "The image stays in local preview until you tap the extraction button. Then the selected screenshot is sent to the server-side AI service and returned as editable fields.": "在你点击识别按钮前，图片只用于本地预览。启动后，所选截图会发送到服务器端 AI，并返回可编辑字段。",
  "Extracting details...": "正在识别信息...",
  "Extract details with AI": "使用 AI 识别信息",
  "Choose a screenshot to enable optional AI extraction.": "选择截图后即可使用可选 AI 识别。",
  "Local analysis is ready. AI screenshot extraction only starts after you tap the AI button.": "本地分析已就绪。只有点击 AI 按钮后才会开始截图识别。",
  "Screenshot fixture loaded for App Store capture. No AI or server processing started.": "已载入 App Store 截图示例，未启动 AI 或服务器处理。",
  "Screenshot removed. You can still paste text or enter details manually.": "截图已移除，你仍可粘贴文字或手动输入信息。",
  "Screenshot attached for local preview only. No AI or server processing started.": "截图仅用于本地预览，未启动 AI 或服务器处理。",
  "Choose a screenshot first, then tap AI extraction.": "请先选择截图，再启动 AI 识别。",
  "Screenshot file is too large. Please upload an image under 5 MB.": "截图文件过大，请上传小于 5 MB 的图片。",
  "AI extraction supports jpg, jpeg, png, and webp screenshots. You can still enter details manually.": "AI 识别支持 JPG、JPEG、PNG 和 WEBP 截图，你也可以继续手动输入。",
  "Sending this screenshot to the server-side AI extraction service. Review the fields after it returns.": "正在将截图发送到服务器端 AI 识别服务。返回后请确认各字段。",
  "AI extraction failed. Manual entry and local analysis are still available.": "AI 识别失败，仍可使用手动输入和本地分析。",
  "Listing link": "商品链接",
  "The link is saved only as reference information. Paste the visible listing text below because marketplace pages may be private, login-gated, or unreadable.": "链接仅作为参考保存。由于平台页面可能需要登录、设为私密或无法读取，请在下方粘贴可见的商品文字。",
  "Listing text": "商品文字",
  "Paste the marketplace title, price, wheel size, condition, or description here.": "在此粘贴平台商品标题、价格、轮径、车况或描述。",
  "Apply pasted text locally": "在本地解析粘贴文字",
  "This parser runs locally and fills the review fields below. It does not call AI.": "解析在本设备完成，并填写下方确认字段，不会调用 AI。",
  "Paste listing text first, then apply it to the editable review fields.": "请先粘贴商品文字，再应用到可编辑的确认字段。",
  "Listing text was parsed locally on this device. Review the fields before analyzing.": "商品文字已在本设备解析，请在分析前确认字段。",
  "Save a child profile first so Mandy can check bike fit.": "请先保存骑手资料，以便 Mandy 检查尺寸是否合适。",
  "Local analysis complete. No screenshot, listing text, or child profile was sent to an AI service for this result.": "本地分析完成。本次结果未将截图、商品文字或骑手资料发送给 AI 服务。",
  "Run an analysis before saving to History.": "请先完成分析，再保存到历史。",
  "Generate a result before copying a seller message.": "请先生成结果，再复制卖家消息。",
  "Seller message copied.": "卖家消息已复制。",
  "Copy is unavailable here. Press and hold the message to select it manually.": "此处无法自动复制，请长按消息并手动选择。",
  "This result is already in History, so the existing saved item was moved to the top.": "这条结果已在历史中，现有记录已移到顶部。",
  "Saved to History on this device.": "已保存到本设备的历史记录。",
  "Start with price, wheel size, and condition if known.": "如已知，请先填写价格、轮径和车况。",
  "More detail can improve the usefulness of the recommendation, but every field remains editable and optional.": "信息越完整，建议越有帮助；所有字段都可编辑且为选填。",
  "Review the listing details": "确认商品信息",
  "Confirm what you know and correct anything extracted or parsed incorrectly.": "确认已知信息，并修正识别或解析不准确的内容。",
  "Bike basics": "自行车基本信息",
  "Price and wheel size are especially useful for fit and value guidance.": "价格和轮径对尺寸与价值判断尤其重要。",
  "Bike title": "商品标题",
  Price: "价格",
  "Wheel size": "轮径",
  Brand: "品牌",
  Model: "型号",
  "Bike type": "车型",
  "Color / style": "颜色 / 风格",
  "Source and condition": "来源和车况",
  "Helpful for pickup context and risk checks.": "有助于了解取车环境和检查风险。",
  "Platform/source": "平台 / 来源",
  Location: "地点",
  "Condition / description": "车况 / 描述",
  "Condition summary": "车况摘要",
  "Hybrid, mountain, cruiser": "混合型、山地、休闲",
  "Blue, step-through, sporty": "蓝色、低跨、运动风格",
  "Nearby city or pickup area": "附近城市或取车区域",
  "Brakes work, tires hold air, light rust, needs tube...": "刹车正常、轮胎保气、轻微锈蚀、需要换内胎……",
  "Good, fair, needs repair": "良好、一般、需要维修",
  "Current status": "当前状态",
  "AI extraction review": "AI 识别确认",
  "Get recommendation": "获取建议",
  "Analyze bike locally": "在本地分析自行车",
  "Save a rider Profile to unlock fit analysis.": "保存骑手资料后即可进行尺寸分析。",
  "Add a screenshot, pasted text, or a few manual listing details first.": "请先添加截图、粘贴文字或填写一些商品信息。",
  "Local analysis stays on this device and does not send your profile or listing to AI.": "本地分析只在本设备进行，不会把骑手资料或商品信息发送给 AI。",
  "Overall recommendation": "总体建议",
  "Fit, deal, and risk": "尺寸、价格与风险",
  "Each status includes the reason behind the recommendation.": "每项状态都包含建议理由。",
  Fit: "尺寸",
  "Deal/value": "价格 / 价值",
  Risk: "风险",
  "What to do next": "下一步怎么做",
  "Use the recommendation as decision support before arranging pickup.": "安排取车前，请将这些建议作为决策参考。",
  "Message the seller": "联系卖家",
  "Ask for the details you still need": "询问仍需确认的信息",
  "Save to History": "保存到历史",
  "Saves this recommendation and listing snapshot on this device.": "将本次建议和商品快照保存在本设备。",
  "Compare the bike checks you saved. These snapshots stay on this device and never re-run analysis when opened.": "查看和比较已保存的评估。这些快照仅保存在本设备，打开时不会重新分析。",
  "Save bikes you want to remember": "保存值得继续考虑的自行车",
  "After evaluating a listing, save its recommendation here to compare later on this device.": "评估商品后，可把建议保存在这里，方便之后在本设备比较。",
  "Evaluate a bike": "评估一辆自行车",
  "Your saved bikes": "已保存的自行车",
  "Tap a star to keep promising bikes easy to spot.": "点击星标，把更有希望的自行车放入候选清单。",
  "Untitled bike listing": "未命名的自行车商品",
  "Not set": "未填写",
  "Your child": "孩子",
  "View saved details": "查看保存详情",
  "Hide saved details": "收起保存详情",
  "Saved snapshot": "已保存快照",
  "Bike details": "自行车详情",
  "Saved recommendation": "已保存建议",
  "Listing snapshot": "商品快照",
  "The listing details saved with this recommendation.": "与本次建议一起保存的商品信息。",
  Source: "来源",
  Screenshot: "截图",
  Reference: "参考链接",
  "Child snapshot": "骑手资料快照",
  "The profile details used when this bike was evaluated.": "评估这辆自行车时使用的骑手资料。",
  "These are the statuses saved with the original recommendation.": "以下为生成原始建议时保存的状态。",
  "Saved seller message": "已保存的卖家消息",
  "Deleting removes only this saved snapshot. It does not change the child profile or other saved bikes.": "删除只会移除这份快照，不会影响骑手资料或其他已保存自行车。",
  "Delete this saved bike": "删除这辆已保存自行车",
  "Evaluation progress": "评估进度",
  "Privacy and controls": "隐私与控制",
  "Privacy, stored data, and app information.": "管理隐私、本地数据和 App 信息。",
  Privacy: "隐私",
  "How your data is handled": "数据如何处理",
  "Privacy summary": "隐私摘要",
  "Child profile and saved evaluations are stored on this device for the App Store MVP. No account or cloud sync is required, and you can clear local data at any time.": "骑手资料和已保存评估会保存在本设备。无需账号或云同步，你可以随时清除本地数据。",
  "AI disclosure": "AI 说明",
  "AI features are optional and must start from a clear user action. Choosing a screenshot or pasting text does not start AI by itself. Local fallback analysis works without AI, provider keys stay server-side, and initial app load does not call OpenAI or an LLM.": "AI 功能为可选项，必须由用户明确启动。选择截图或粘贴文字不会自动调用 AI。本地分析无需 AI，服务密钥保留在服务器端，App 启动时不会调用 OpenAI 或其他大语言模型。",
  "Marketplace disclosure": "平台说明",
  "Links, text, and screenshots are user-provided references. Mandy's Bike Finder does not automatically scrape Facebook, OfferUp, Craigslist, or login-gated marketplace pages, and saved History does not re-fetch marketplace pages.": "链接、文字和截图均由用户提供。Mandy 自行车助手不会自动抓取 Facebook、OfferUp、Craigslist 或需要登录的平台页面，已保存的历史也不会重新访问这些页面。",
  "Privacy policy": "隐私政策",
  "Review the full policy.": "查看完整政策。",
  "Open privacy policy": "打开隐私政策",
  "On this iPhone": "在这台 iPhone 上",
  "Local data controls": "本地数据管理",
  "Stored data": "已存数据",
  "Clear child profile": "清除骑手资料",
  "Clear history": "清除历史",
  "Clear all local data": "清除全部本地数据",
  About: "关于",
  "App information": "App 信息",
  App: "App",
  Mode: "模式",
  Version: "版本",
  Feedback: "反馈",
  "Coming in a later release.": "将在后续版本中提供。",
  Disclaimer: "免责声明",
  "Bike recommendations are decision support only. Parents should inspect fit, brakes, tires, frame condition, and safety before purchase.": "自行车建议仅用于辅助决策。购买前，家长应检查尺寸、刹车、轮胎、车架状况与整体安全性。",
  Language: "语言",
  "Choose app language": "选择 App 语言",
  English: "English",
  "Simplified Chinese": "简体中文",
  "App Store MVP tabs": "App 主导航",
  "App flow": "App 流程",
  Rider: "骑手",
  Listing: "商品",
  Saved: "保存",
};

const analysisLabels: Record<string, string> = {
  "Wheel size not detected": "未识别到轮径",
  "Good size match": "尺寸匹配良好",
  "May fit with test ride": "试骑后可能合适",
  "Likely size mismatch": "尺寸可能不合适",
  "Price unclear": "价格不明确",
  "Looks reasonable": "价格看起来合理",
  "Fair if condition checks out": "车况良好则价格尚可",
  "Price looks high": "价格偏高",
  "Repair risk": "存在维修风险",
  "Condition sounds promising": "车况描述较好",
  "Condition needs confirmation": "需要确认车况",
  "Brand unknown": "品牌未知",
  "Higher-quality brand": "质量较好的品牌",
  "Mid-level brand": "中档品牌",
  "Entry-level brand": "入门品牌",
  "Brand needs context": "需要更多品牌信息",
  "Neutral preference": "无明显风格限制",
  "Likely appealing": "可能符合偏好",
  "Style likely matches": "风格可能匹配",
  "Check with child": "建议和孩子确认",
  "High uncertainty": "不确定性较高",
  "Missing key details": "缺少关键信息",
  "Lower price confidence": "价格判断可信度较低",
  "Low obvious risk": "暂未发现明显风险",
  "Probably skip": "建议跳过",
  "Ask more before deciding": "先询问更多信息",
  "Worth contacting": "值得联系卖家",
};

const categoryLabels: Record<string, string> = {
  "Balance bike": "平衡车",
  "Training wheels bike": "带辅助轮自行车",
  "Standard kids bike": "标准儿童自行车",
  "Kids cruiser bike": "儿童休闲自行车",
  "Kids mountain bike": "儿童山地车",
  "Hybrid / neighborhood bike": "混合型 / 社区骑行自行车",
};

const preferenceLabels: Record<string, string> = {
  "pink / purple": "粉色 / 紫色",
  "blue / green": "蓝色 / 绿色",
  "red / orange": "红色 / 橙色",
  "black / white / neutral": "黑色 / 白色 / 中性色",
  "bright colors": "鲜艳颜色",
  "mature / simple style": "成熟 / 简洁风格",
  "No preference / all colors are fine": "无偏好 / 所有颜色都可以",
};

export function appText(locale: AppLocale, source: string) {
  return locale === "zh-Hans" ? zhHans[source] || source : source;
}

export function resolveAppLocale(savedLocale?: string | null, browserLanguage?: string): AppLocale {
  if (savedLocale === "zh-Hans" || savedLocale === "en") return savedLocale;
  return browserLanguage?.toLowerCase().startsWith("zh") ? "zh-Hans" : "en";
}

export function localizeRidingExperience(locale: AppLocale, experience?: ChildProfile["experience"]) {
  if (!experience) return locale === "zh-Hans" ? "未填写骑行经验" : "Riding experience not set";
  if (locale === "en") return `${experience.charAt(0).toUpperCase()}${experience.slice(1)} rider`;
  return {
    beginner: "初学骑手",
    comfortable: "较熟练骑手",
    confident: "熟练骑手",
    advanced: "进阶骑手",
  }[experience];
}

export function localizePreference(locale: AppLocale, value: string) {
  if (locale === "en") return value;
  return preferenceLabels[value] || appText(locale, value);
}

export function localizeCategory(locale: AppLocale, value: string) {
  if (locale === "en") return value;
  return categoryLabels[value] || value;
}

export function localizeWheelSize(locale: AppLocale, value?: string) {
  const wheelSize = String(value || "").trim();
  if (!wheelSize) return appText(locale, "Not set");
  if (locale === "en") return /inch|in\.?|["”]/i.test(wheelSize) ? wheelSize : `${wheelSize} inch`;
  return `${wheelSize.replace(/\s*(?:inch|in\.?|["”])\s*/gi, "").trim()} 英寸`;
}

export function formatLocalizedDate(locale: AppLocale, value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return locale === "zh-Hans" ? "最近保存" : "Saved recently";
  if (locale === "zh-Hans") return `${date.getMonth() + 1}月${date.getDate()}日`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function localizeAnalysisResult(locale: AppLocale, result: AnalysisResult): AnalysisResult {
  if (locale === "en") return result;
  return {
    ...result,
    overall: localizeMeter(result.overall),
    dimensions: {
      fit: localizeMeter(result.dimensions.fit),
      price: localizeMeter(result.dimensions.price),
      condition: localizeMeter(result.dimensions.condition),
      brand: localizeMeter(result.dimensions.brand),
      color: localizeMeter(result.dimensions.color),
      risk: localizeMeter(result.dimensions.risk),
    },
    sellerQuestions: result.sellerQuestions.map(localizeAnalysisText),
    disclaimer: "Mandy 自行车助手提供一般性的尺寸和购买建议。购买前请务必确认实际骑行尺寸、刹车、轮胎和整体安全状况。",
  };
}

export function localizeSellerMessage(locale: AppLocale, listing: Listing) {
  const title = listing.title?.trim() || (locale === "zh-Hans" ? "这辆自行车" : "the bike");
  if (locale === "zh-Hans") {
    return `你好，我对“${title}”很感兴趣。请问可以确认轮径、刹车是否正常，以及轮胎能否正常保气吗？谢谢！`;
  }
  return `Hi, I'm interested in ${title}. Could you confirm the wheel size, whether the brakes work well, and if the tires hold air? Thanks!`;
}

export function localizeRecommendationCopy(
  locale: AppLocale,
  recommendation: {
    category: string;
    wheelSize: string;
    growthOption: string;
    styleRecommendation: string;
    explanation: string;
  },
) {
  if (locale === "en") return recommendation;
  return {
    ...recommendation,
    category: localizeCategory(locale, recommendation.category),
    wheelSize: localizeWheelSize(locale, recommendation.wheelSize),
    growthOption: localizeRecommendationText(recommendation.growthOption),
    styleRecommendation: localizeRecommendationText(recommendation.styleRecommendation),
    explanation: localizeRecommendationText(recommendation.explanation),
  };
}

function localizeMeter(item: MeterResult): MeterResult {
  return {
    ...item,
    label: analysisLabels[item.label] || item.label,
    reasoning: localizeAnalysisText(item.reasoning),
  };
}

function localizeAnalysisText(source: string) {
  return source
    .replace("We couldn't confidently detect the bike wheel size from this listing.", "无法从商品信息中可靠识别自行车轮径。")
    .replace(/(.+?) matches the current recommendation of (.+?)\. (.+)/, "$1 与当前建议的 $2 匹配。$3")
    .replace(/(.+?) is close to the recommendation of (.+?)\. (.+)/, "$1 接近建议的 $2。$3")
    .replace(/(.+?) does not match the current recommendation of (.+?)\./, "$1 与当前建议的 $2 不匹配。")
    .replace("20 inch is the safer starting point for this height range.", "对于这个身高范围，20 英寸是更稳妥的起步尺寸。")
    .replace("Add the asking price to compare against local reference ranges.", "填写售价后可与本地参考价格区间比较。")
    .replace(/Estimated new range is \$(\d+)-\$(\d+)\. At \$(\d+), this may be reasonable if condition is good\./, "估算新品价格约为 $$$1-$$$2。若车况良好，$$$3 的价格可能较合理。")
    .replace(/Estimated new range is \$(\d+)-\$(\d+)\. Confirm condition before paying \$(\d+)\./, "估算新品价格约为 $$$1-$$$2。支付 $$$3 前请先确认车况。")
    .replace(/At \$(\d+), this appears close to the local estimated new range of \$(\d+)-\$(\d+)\./, "$$$1 的售价接近本地估算新品区间 $$$2-$$$3。")
    .replace("The listing suggests repair or safety risk. Confirm brakes, tires, chain, rust, and gears.", "商品描述显示可能存在维修或安全风险，请确认刹车、轮胎、链条、锈蚀和变速系统。")
    .replace("The description includes positive condition signals. Still confirm brakes, tires, chain, and rust.", "描述中包含较好的车况信号，但仍需确认刹车、轮胎、链条和锈蚀情况。")
    .replace("Ask about brakes, tires, chain, rust, gears, and whether the bike is ready to ride.", "请询问刹车、轮胎、链条、锈蚀、变速系统，以及车辆是否可以直接骑行。")
    .replace("Brand is missing, so value and quality are harder to estimate.", "缺少品牌信息，因此较难判断价值和质量。")
    .replace(/(.+?) is generally a stronger kids bike brand if the condition is good\./, "如果车况良好，$1 通常是质量较好的儿童自行车品牌。")
    .replace(/(.+?) can be a reasonable used choice at the right price and condition\./, "若价格和车况合适，$1 可以是合理的二手选择。")
    .replace(/(.+?) is often entry-level, so price and condition matter more\./, "$1 通常属于入门级，因此价格和车况更重要。")
    .replace(/(.+?) is not in the local brand table yet\./, "本地品牌表中暂未收录 $1。")
    .replace("No strong style preference is set, so color is unlikely to block the decision.", "未设置明显风格偏好，因此颜色通常不会影响决定。")
    .replace("The style may be appealing to some kids but may feel too babyish for others.", "这种风格可能吸引部分孩子，但也可能让其他孩子觉得过于幼稚。")
    .replace("Color/style is not a clear match. A quick child check may avoid a disappointing pickup.", "颜色或风格是否匹配并不明确，取车前和孩子确认可以避免失望。")
    .replace("Repair or safety signals appear in the listing.", "商品信息中出现维修或安全风险信号。")
    .replace(/Confirm (.+) before pickup\./, "取车前请确认：$1。")
    .replace("Price estimate uses local fallback ranges, not live retailer search.", "价格估算使用本地参考区间，并非实时零售商搜索结果。")
    .replace("Key fields are present and no repair signals were detected.", "关键信息较完整，暂未发现维修风险信号。")
    .replace("One or more important dimensions has a clear concern.", "一个或多个重要方面存在明显问题。")
    .replace("This could work, but several details should be confirmed first.", "这辆车可能合适，但需要先确认若干细节。")
    .replace("This appears to be a strong candidate based on the confirmed details.", "根据已确认的信息，这辆车值得优先考虑。")
    .replace("Can you confirm the wheel size and whether the bike fits a child around this height?", "可以确认轮径，以及这辆车是否适合这个身高的孩子吗？")
    .replace("Do the brakes work well, do the tires hold air, and is the chain in good shape?", "刹车是否正常、轮胎能否保气、链条状况是否良好？")
    .replace("Is there any rust, damage, or repair needed?", "是否有锈蚀、损坏或需要维修的地方？")
    .replace("Would it be possible for my child to do a quick test ride at pickup?", "取车时可以让孩子简单试骑吗？")
    .replace(/(\d+(?:\.\d+)?)\s*inch/g, "$1 英寸");
}

function localizeRecommendationText(source: string) {
  return source
    .replaceAll("Standard kids bike", "标准儿童自行车")
    .replaceAll("Kids mountain bike", "儿童山地车")
    .replaceAll("Hybrid / neighborhood bike", "混合型 / 社区骑行自行车")
    .replaceAll("Kids cruiser bike", "儿童休闲自行车")
    .replaceAll("Training wheels bike", "带辅助轮自行车")
    .replaceAll("Balance bike", "平衡车")
    .replace(/Consider (\d+) inch only after control and stopping confidence improve\./, "只有在操控和刹停更熟练后，再考虑 $1 英寸。")
    .replace("Consider 26 inch only if the child is confident and can test ride safely.", "只有孩子骑行熟练且能安全试骑时，才考虑 26 英寸。")
    .replace(/(.+?) with practical geometry and neutral long-term style\./, "$1，优先选择实用几何结构和耐看的中性风格。")
    .replace(/Based on height (\d+) cm, age (\d+), and (.+?) riding experience, an? (\d+)-inch standard kids bike is a practical and safe starting point now\./, "根据身高 $1 厘米、年龄 $2 岁和$3骑行经验，$4 英寸标准儿童自行车是目前实用且稳妥的起点。")
    .replace("beginner", "初学")
    .replace("comfortable", "较熟练")
    .replace("confident", "熟练")
    .replace("advanced", "进阶");
}
