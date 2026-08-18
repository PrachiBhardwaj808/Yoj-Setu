import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPing } from '../services/pingService';

// ─────────────────────────────────────────────────────────────────────────────
// LandingPage.jsx — the home page, rendered at the '/' route
//
// DEMONSTRATES THE STATUS STATE MACHINE PATTERN used throughout this app:
//   status: 'idle' | 'loading' | 'success' | 'error'
//
//   'idle'    — nothing has happened yet
//   'loading' — an async operation (API call, etc.) is in progress
//   'success' — operation completed successfully
//   'error'   — operation failed; show a human-readable message
//
//   This exact same pattern is used in PhoneNumberForm and OtpVerification.
//   Keeping the pattern consistent across the app means you only need to learn
//   it once, and it behaves predictably everywhere.
//
// This page shows a simple hero and a "ping the backend" status badge so you
// can see the state machine in action with real (or failing) network requests.
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [pingStatus, setPingStatus] = useState('idle');
  const [pingMsg, setPingMsg] = useState('');

  async function checkBackend() {
    setPingStatus('loading');
    setPingMsg('');
    try {
      const result = await getPing();
      setPingStatus('success');
      setPingMsg(result);
    } catch {
      setPingStatus('error');
      setPingMsg('Backend is offline or not reachable (expected during frontend-only development).');
    }
  }

  // Check backend status once when the page first loads
  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-16">

      {/* ── Hero ── */}
      <div className="text-center max-w-2xl mx-auto">
        {/* Flag-inspired decoration */}
        <div className="flex justify-center gap-1 mb-6">
          <div className="w-8 h-2 rounded-full bg-orange-500" />
          <div className="w-8 h-2 rounded-full bg-white border border-slate-200" />
          <div className="w-8 h-2 rounded-full bg-green-600" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          Connecting citizens with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
            government schemes
          </span>
        </h1>

        <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
          Yojsetu makes it easy to discover, apply for, and track government welfare
          schemes — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 rounded-xl bg-orange-500 text-white font-semibold text-base
              hover:bg-orange-600 transition-all duration-150 shadow-md hover:shadow-lg active:scale-95"
          >
            Get started — it's free
          </Link>
          <Link
            to="/schemes"
            className="px-8 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base
              hover:border-slate-400 hover:bg-slate-100 transition-all duration-150"
          >
            Browse schemes
          </Link>
        </div>
      </div>

      {/* ── Backend status badge (demonstrates the status state machine) ── */}
      <div className="mt-16 w-full max-w-sm">
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3
          text-sm transition-colors duration-300
          ${pingStatus === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : pingStatus === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {pingStatus === 'loading' && (
              <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            )}
            {pingStatus === 'success' && <span>🟢</span>}
            {pingStatus === 'error'   && <span>🔴</span>}
            {pingStatus === 'idle'    && <span>⚪</span>}
            <span className="font-medium">
              {pingStatus === 'loading' && 'Checking backend…'}
              {pingStatus === 'success' && `Backend: ${pingMsg}`}
              {pingStatus === 'error'   && 'Backend: offline'}
              {pingStatus === 'idle'    && 'Backend: —'}
            </span>
          </div>
          <button
            onClick={checkBackend}
            disabled={pingStatus === 'loading'}
            className="text-xs underline opacity-60 hover:opacity-100 disabled:opacity-30 transition-opacity"
          >
            Retry
          </button>
        </div>
        <p className="mt-1.5 text-xs text-center text-slate-400">
          Status machine demo: idle → loading → success/error
        </p>
      </div>

    </div>
  );
}
