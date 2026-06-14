"use client";

import { useEffect, useState } from "react";

import {
  APP_LOCALE_STORAGE_KEY,
  resolveAppLocale,
  type AppLocale,
} from "@/lib/app-store-i18n";

import OfflineRecovery from "./OfflineRecovery";

export default function OfflineContent() {
  const [locale, setLocale] = useState<AppLocale>("en");
  const zh = locale === "zh-Hans";

  useEffect(() => {
    setLocale(resolveAppLocale(
      window.localStorage.getItem(APP_LOCALE_STORAGE_KEY),
      window.navigator.language,
    ));
  }, []);

  return (
    <main className="app-native-shell app-safe-shell min-h-screen px-4 py-8">
      <section className="mx-auto grid min-h-[78vh] max-w-xl place-items-center">
        <div className="app-native-group w-full">
          <div className="app-native-row grid justify-items-center px-6 py-8 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-amber-200 bg-amber-50 text-amber-700" aria-hidden="true">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M4 4l16 16" />
              </svg>
            </span>
            <p className="mt-4 text-xs font-bold tracking-[0.04em] text-amber-700">{zh ? "当前离线" : "You're offline"}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-[var(--app-text-strong)]">
              {zh ? "部分自行车评估需要联网" : "Some bike checks need a connection"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {zh
                ? "已保存的骑手资料和历史可能仍可在本设备使用。AI 截图识别和其他服务器功能需要网络连接。"
                : "Saved Profile and History data may still be available on this device. AI screenshot extraction and other server actions need internet access."}
            </p>
          </div>
          <div className="app-native-row">
            <h2 className="text-sm font-bold text-[var(--app-text-strong)]">{zh ? "已保存时仍可使用" : "Available when already saved"}</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-5 text-[var(--app-text)]">
              <li className="flex gap-2"><span className="font-bold text-emerald-600" aria-hidden="true">✓</span>{zh ? "骑手资料和尺寸建议" : "Child Profile and fit guidance"}</li>
              <li className="flex gap-2"><span className="font-bold text-emerald-600" aria-hidden="true">✓</span>{zh ? "历史和已保存的建议快照" : "History and saved recommendation snapshots"}</li>
              <li className="flex gap-2"><span className="font-bold text-amber-600" aria-hidden="true">!</span>{zh ? "AI 识别会等待重新联网" : "AI extraction waits until you reconnect"}</li>
            </ul>
            <OfflineRecovery locale={locale} />
          </div>
        </div>
      </section>
    </main>
  );
}
