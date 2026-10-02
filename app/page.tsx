"use client";

import dynamic from "next/dynamic";

// The whole demo lives in localStorage, so render it client-only.
const App = dynamic(() => import("@/components/App"), {
  ssr: false,
  loading: () => <div className="grid h-dvh place-items-center text-sm text-slate-400">Loading front desk…</div>,
});

export default function Page() {
  return <App />;
}
