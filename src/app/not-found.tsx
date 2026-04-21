import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">404</p>
        <h1 className="mt-4 font-serif text-5xl text-slate-950">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The page you requested is not available in this storefront.
        </p>
        <Link
          href="/en"
          className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
