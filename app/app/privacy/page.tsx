import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mandy's Bike Finder",
  description: "Privacy policy for Mandy's Bike Finder App Store MVP.",
};

const lastUpdated = "May 30, 2026";
const supportEmail = "support@mandysbikefinder.com";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Mandy&apos;s Bike Finder</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Last updated: {lastUpdated}</p>
        <p className="mt-5 text-sm leading-6 text-slate-700">
          Mandy&apos;s Bike Finder helps parents and guardians evaluate used kids bike listings. This page explains the practical privacy behavior of the App Store MVP and is not legal advice.
        </p>

        <PrivacySection title="What Data Is Used">
          <ul className="grid gap-2">
            <li>Child profile information, such as age, height, riding experience, optional weight, and preferences.</li>
            <li>Bike listing information, such as title, price, brand, wheel size, condition, location, link, pasted text, and manually entered details.</li>
            <li>Screenshots selected by the user for listing review. Selecting a screenshot by itself does not start AI processing.</li>
            <li>Saved evaluations, including recommendation, fit/value/risk summaries, seller message, and a small child profile snapshot.</li>
            <li>Email address only in the web MVP email report flow when that feature is visible and used. Email report is not part of the first App Store MVP surface.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="How Data Is Used">
          <ul className="grid gap-2">
            <li>To estimate whether a used kids bike is likely to fit the child.</li>
            <li>To evaluate deal/value and practical risk signals.</li>
            <li>To generate a recommendation and a seller message draft.</li>
            <li>To save local History on the device so parents can compare listings later.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Local Storage">
          <p>
            In the App Store MVP, the child profile and saved evaluations are stored on this device. No account is required. Users can clear the child profile, saved history, or all App Store MVP local data from Settings.
          </p>
        </PrivacySection>

        <PrivacySection title="AI Analysis">
          <ul className="grid gap-2">
            <li>AI features are optional and only start after a clear user action.</li>
            <li>Selecting a screenshot alone does not send it to AI.</li>
            <li>Pasting a link or text alone does not automatically scrape or analyze marketplace pages.</li>
            <li>Local fallback analysis can work without AI.</li>
            <li>Provider keys, including OpenAI keys, remain server-side and are not included in the app bundle.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Marketplace Links">
          <p>
            Links, text, and screenshots are user-provided references. Mandy&apos;s Bike Finder does not automatically scrape Facebook, OfferUp, Craigslist, or login-gated marketplace pages. Saved History does not re-fetch marketplace pages.
          </p>
        </PrivacySection>

        <PrivacySection title="Third-Party Services">
          <ul className="grid gap-2">
            <li>Vercel hosts the web app and server-side routes.</li>
            <li>OpenAI may process listing content only if an AI feature is enabled and the user explicitly starts that action.</li>
            <li>Resend may process email report content only in the web MVP email report flow when that feature is visible and used outside the first App Store MVP surface.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Children's Data">
          <p>
            The app is intended for parents or guardians making purchase decisions. Child profile fields are used to estimate bike fit. The App Store MVP does not require an account, and local child profile data can be cleared from Settings.
          </p>
        </PrivacySection>

        <PrivacySection title="Data Deletion">
          <ul className="grid gap-2">
            <li>Use Settings to clear the saved child profile.</li>
            <li>Use Settings or History controls to clear saved evaluations.</li>
            <li>Use Settings to clear all App Store MVP local data.</li>
            <li>For web/email features outside the App Store MVP, contact support at <a className="font-bold text-brand" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Contact">
          <p>
            For privacy or support questions, contact <a className="font-bold text-brand" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </p>
        </PrivacySection>

        <div className="mt-8">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-sm font-bold text-white" href="/">
            Back to Mandy&apos;s Bike Finder
          </Link>
        </div>
      </article>
    </main>
  );
}

function PrivacySection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-7 border-t border-slate-200 pt-5">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}
