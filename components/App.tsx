"use client";

import { useState } from "react";
import { OperatorConsole } from "@/components/OperatorConsole";
import { ParentApp } from "@/components/ParentApp";
import { CalendarIcon, ResetIcon } from "@/components/icons";
import { StoreProvider, useStore } from "@/lib/store";
import { describeClock, type ClockMode } from "@/lib/time";

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { reset, tickets, clock, setClock } = useStore();
  const [view, setView] = useState<"parent" | "operator">("parent");
  const open = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="flex h-dvh flex-col bg-[#f1efe9]">
      <header className="flex items-center gap-3 border-b border-stone-300/60 bg-[#f1efe9] px-4 py-2.5 lg:px-6">
        <div className="hidden min-w-0 flex-1 sm:block">
          <div className="truncate text-sm font-semibold text-stone-800">
            AI Front Desk <span className="font-normal text-stone-500">· prototype for early-education centers</span>
          </div>
          <div className="hidden text-xs text-stone-500 sm:block">
            Fictional center & families. The parent app (left) and the director&apos;s console (right) share live state.
          </div>
        </div>

        {/* View switch on small screens */}
        <div className="flex rounded-xl bg-stone-200/70 p-0.5 text-sm lg:hidden">
          {(["parent", "operator"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`relative rounded-lg px-3 py-1 ${view === v ? "bg-white font-medium text-stone-900 shadow-sm" : "text-stone-500"}`}
            >
              {v === "parent" ? "Parent" : "Director"}
              {v === "operator" && open > 0 && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-stone-200" />
              )}
            </button>
          ))}
        </div>

        <label
          className="ml-auto flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 text-xs text-stone-500 hover:bg-stone-200 sm:ml-0 sm:px-2"
          title="The time the front desk thinks it is. Pinned to a school-day morning by default."
        >
          <CalendarIcon className="hidden h-3.5 w-3.5 sm:block" />
          <select
            value={clock}
            onChange={(e) => setClock(e.target.value as ClockMode)}
            className="w-[7.5rem] min-w-0 truncate bg-transparent text-stone-700 outline-none sm:w-auto"
          >
            <option value="morning">Demo clock: {describeClock("morning")}</option>
            <option value="live">Real time: {describeClock("live")}</option>
          </select>
        </label>
        <ResetButton onReset={reset} />
      </header>

      <main className="flex min-h-0 flex-1 gap-6 lg:p-6">
        <section
          className={`${view === "parent" ? "flex" : "hidden"} min-h-0 w-full flex-col lg:flex lg:w-[400px] lg:shrink-0`}
        >
          <div className="hidden pb-2 text-center text-xs font-medium uppercase tracking-wider text-stone-500 lg:block">
            Parent&apos;s phone
          </div>
          <div className="min-h-0 flex-1 overflow-hidden lg:rounded-[2.25rem] lg:border-[10px] lg:border-stone-900 lg:shadow-2xl">
            <ParentApp />
          </div>
        </section>

        <section
          className={`${view === "operator" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col lg:flex`}
        >
          <div className="hidden pb-2 text-xs font-medium uppercase tracking-wider text-stone-500 lg:block">
            Director&apos;s console
          </div>
          <div className="min-h-0 flex-1 overflow-hidden bg-[#fbfaf7] lg:rounded-3xl lg:shadow-xl lg:ring-1 lg:ring-stone-200">
            <OperatorConsole />
          </div>
        </section>
      </main>
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="hidden text-stone-500 sm:inline">Reset all demo data?</span>
        <button
          onClick={() => {
            onReset();
            setConfirming(false);
          }}
          className="rounded-lg bg-stone-900 px-2 py-1 text-white"
        >
          Reset
        </button>
        <button onClick={() => setConfirming(false)} className="px-1 text-stone-500">
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-stone-200"
      title="Reset demo data"
    >
      <ResetIcon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Reset demo</span>
    </button>
  );
}
