"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

import {
  APP_LOCALE_STORAGE_KEY,
  resolveAppLocale,
  type AppLocale,
} from "@/lib/app-store-i18n";

const supportEmail = "support@mandysbikefinder.com";

export default function PrivacyContent() {
  const [locale, setLocale] = useState<AppLocale>("en");
  const zh = locale === "zh-Hans";

  useEffect(() => {
    setLocale(resolveAppLocale(
      window.localStorage.getItem(APP_LOCALE_STORAGE_KEY),
      window.navigator.language,
    ));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {zh ? "Mandy 自行车助手" : "Mandy's Bike Finder"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{zh ? "隐私政策" : "Privacy Policy"}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {zh ? "最后更新：2026 年 5 月 30 日" : "Last updated: May 30, 2026"}
        </p>
        <p className="mt-5 text-sm leading-6 text-slate-700">
          {zh
            ? "Mandy 自行车助手帮助家长和监护人评估二手儿童自行车商品。本页说明 App Store 版本的实际隐私处理方式，不构成法律意见。"
            : "Mandy's Bike Finder helps parents and guardians evaluate used kids bike listings. This page explains the practical privacy behavior of the App Store MVP and is not legal advice."}
        </p>

        <PrivacySection title={zh ? "使用哪些数据" : "What Data Is Used"}>
          <ul className="grid gap-2">
            <li>{zh ? "骑手资料，例如年龄、身高、骑行经验，以及选填的体重和偏好。" : "Child profile information, such as age, height, riding experience, optional weight, and preferences."}</li>
            <li>{zh ? "自行车商品信息，例如标题、价格、品牌、轮径、车况、地点、链接、粘贴文字和手动输入内容。" : "Bike listing information, such as title, price, brand, wheel size, condition, location, link, pasted text, and manually entered details."}</li>
            <li>{zh ? "用户选择用于商品评估的截图。仅选择截图不会启动 AI 处理。" : "Screenshots selected by the user for listing review. Selecting a screenshot by itself does not start AI processing."}</li>
            <li>{zh ? "已保存的评估，包括建议、尺寸/价值/风险摘要、卖家消息和少量骑手资料快照。" : "Saved evaluations, including recommendation, fit/value/risk summaries, seller message, and a small child profile snapshot."}</li>
          </ul>
        </PrivacySection>

        <PrivacySection title={zh ? "数据如何使用" : "How Data Is Used"}>
          <ul className="grid gap-2">
            <li>{zh ? "估算二手儿童自行车是否适合孩子。" : "To estimate whether a used kids bike is likely to fit the child."}</li>
            <li>{zh ? "评估价格/价值和实际风险信号。" : "To evaluate deal/value and practical risk signals."}</li>
            <li>{zh ? "生成购买建议和卖家消息草稿。" : "To generate a recommendation and a seller message draft."}</li>
            <li>{zh ? "在设备上保存历史，方便之后比较商品。" : "To save local History on the device so parents can compare listings later."}</li>
          </ul>
        </PrivacySection>

        <PrivacySection title={zh ? "本地存储" : "Local Storage"}>
          <p>
            {zh
              ? "在 App Store 版本中，骑手资料和已保存评估存储在本设备上。无需账号。用户可在设置中清除骑手资料、历史或全部本地数据。"
              : "In the App Store MVP, the child profile and saved evaluations are stored on this device. No account is required. Users can clear the child profile, saved history, or all App Store MVP local data from Settings."}
          </p>
        </PrivacySection>

        <PrivacySection title={zh ? "AI 分析" : "AI Analysis"}>
          <ul className="grid gap-2">
            <li>{zh ? "AI 功能为可选项，只有用户明确操作后才会启动。" : "AI features are optional and only start after a clear user action."}</li>
            <li>{zh ? "仅选择截图不会把图片发送给 AI。" : "Selecting a screenshot alone does not send it to AI."}</li>
            <li>{zh ? "仅粘贴链接或文字不会自动抓取或分析平台页面。" : "Pasting a link or text alone does not automatically scrape or analyze marketplace pages."}</li>
            <li>{zh ? "本地备用分析无需 AI 也可使用。" : "Local fallback analysis can work without AI."}</li>
            <li>{zh ? "OpenAI 等服务密钥保留在服务器端，不包含在 App 安装包中。" : "Provider keys, including OpenAI keys, remain server-side and are not included in the app bundle."}</li>
          </ul>
        </PrivacySection>

        <PrivacySection title={zh ? "平台链接" : "Marketplace Links"}>
          <p>
            {zh
              ? "链接、文字和截图均由用户提供。Mandy 自行车助手不会自动抓取 Facebook、OfferUp、Craigslist 或需要登录的平台页面。已保存的历史不会重新访问平台页面。"
              : "Links, text, and screenshots are user-provided references. Mandy's Bike Finder does not automatically scrape Facebook, OfferUp, Craigslist, or login-gated marketplace pages. Saved History does not re-fetch marketplace pages."}
          </p>
        </PrivacySection>

        <PrivacySection title={zh ? "第三方服务" : "Third-Party Services"}>
          <ul className="grid gap-2">
            <li>{zh ? "Vercel 托管 Web App 和服务器端路由。" : "Vercel hosts the web app and server-side routes."}</li>
            <li>{zh ? "只有在 AI 功能已启用且用户明确启动时，OpenAI 才可能处理商品内容。" : "OpenAI may process listing content only if an AI feature is enabled and the user explicitly starts that action."}</li>
          </ul>
        </PrivacySection>

        <PrivacySection title={zh ? "儿童数据" : "Children's Data"}>
          <p>
            {zh
              ? "本 App 面向做购买决定的家长或监护人。骑手资料仅用于估算自行车尺寸。App Store 版本无需账号，本地骑手资料可随时从设置中清除。"
              : "The app is intended for parents or guardians making purchase decisions. Child profile fields are used to estimate bike fit. The App Store MVP does not require an account, and local child profile data can be cleared from Settings."}
          </p>
        </PrivacySection>

        <PrivacySection title={zh ? "删除数据" : "Data Deletion"}>
          <ul className="grid gap-2">
            <li>{zh ? "在设置中清除已保存的骑手资料。" : "Use Settings to clear the saved child profile."}</li>
            <li>{zh ? "在设置或历史中清除已保存评估。" : "Use Settings or History controls to clear saved evaluations."}</li>
            <li>{zh ? "在设置中清除全部 App 本地数据。" : "Use Settings to clear all App Store MVP local data."}</li>
          </ul>
        </PrivacySection>

        <PrivacySection title={zh ? "联系我们" : "Contact"}>
          <p>
            {zh ? "如有隐私或支持问题，请联系 " : "For privacy or support questions, contact "}
            <a className="font-bold text-brand" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </p>
        </PrivacySection>

        <div className="mt-8">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-sm font-bold text-white" href="/">
            {zh ? "返回 Mandy 自行车助手" : "Back to Mandy's Bike Finder"}
          </Link>
        </div>
      </article>
    </main>
  );
}

function PrivacySection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="mt-7 border-t border-slate-200 pt-5">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}
