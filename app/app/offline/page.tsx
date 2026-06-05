import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Offline</p>
          <h1 className="mt-3 text-2xl font-bold">Mandy&apos;s Bike Finder needs a connection</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Saved browser data may still be available, but screenshot extraction, link analysis, and email reports need the server. Reconnect and reload to keep checking the listing.
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-sm font-bold text-white"
            href="/"
          >
            Back to bike check
          </Link>
        </div>
      </section>
    </main>
  );
}
