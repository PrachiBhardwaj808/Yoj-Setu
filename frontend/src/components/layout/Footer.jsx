// ─────────────────────────────────────────────────────────────────────────────
// Footer.jsx — site footer, rendered on every page via AppLayout
//
// Kept intentionally simple. The footer's only job today is:
//   1. Show basic copyright / branding
//   2. Provide a visual "end" to the page so content doesn't float in empty space
// ─────────────────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
        <p>
          © {year}{' '}
          <span className="font-semibold text-slate-700">Yojsetu</span>. All rights reserved.
        </p>
        <p className="text-xs text-slate-400">
          Connecting citizens with government schemes — built with ❤️ for India
        </p>
      </div>
    </footer>
  );
}
