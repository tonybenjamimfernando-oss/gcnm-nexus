import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Coins, Search } from "lucide-react";
import { CURRENCIES, PRIORITY_CURRENCIES, currencyName } from "@/lib/currencies";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";

export default function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    function listen() {
      if (!open) return;
      function onDown(event: MouseEvent) {
        if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
      }
      function onKey(event: KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return function stop() {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    },
    [open],
  );

  const list = useMemo(
    function build() {
      const term = query.trim().toLowerCase();
      if (term.length === 0) return PRIORITY_CURRENCIES;
      return CURRENCIES.filter(function match(code) {
        return code.toLowerCase().indexOf(term) !== -1 || currencyName(code).toLowerCase().indexOf(term) !== -1;
      }).slice(0, 60);
    },
    [query],
  );

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={function toggle() {
          setOpen(function next(value) {
            return !value;
          });
        }}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold text-haze-100 transition hover:border-glow-400/50",
          compact ? "px-2" : "",
        )}
        aria-label="Escolher moeda"
      >
        <Coins className="h-4 w-4 text-glow-400" />
        {currency}
        <ChevronDown className="h-3.5 w-3.5 text-haze-500" />
      </button>

      {open ? (
        <div className="glass-strong absolute right-0 z-50 mt-2 w-72 rounded-2xl p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
            <input
              value={query}
              onChange={function change(event) {
                setQuery(event.target.value);
              }}
              placeholder="Procurar moeda"
              className="h-10 w-full rounded-xl border border-white/10 bg-ink-900/60 pl-9 pr-3 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
            />
          </div>
          <div className="mt-3 max-h-64 overflow-y-auto pr-1">
            {list.map(function render(code) {
              const active = code === currency;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={function pick() {
                    setCurrency(code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                    active ? "bg-glow-500/20 text-white" : "text-haze-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span className="truncate">
                    <span className="font-bold">{code}</span>
                    <span className="ml-2 text-xs text-haze-500">{currencyName(code)}</span>
                  </span>
                  {active ? <Check className="h-4 w-4 text-glow-400" /> : null}
                </button>
              );
            })}
            {list.length === 0 ? <p className="px-3 py-6 text-center text-xs text-haze-500">Sem resultados.</p> : null}
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-4 text-haze-500">
            {CURRENCIES.length} moedas ISO. Precos convertidos a taxas de referencia.
          </p>
        </div>
      ) : null}
    </div>
  );
}
