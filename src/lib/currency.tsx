import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isKnownCurrency } from "./currencies";
import { convert, formatMoney } from "./format";
import { BASE_CURRENCY } from "./rates";

const KEY = "gcnm:currency";

type CurrencyValue = {
  currency: string;
  setCurrency: (code: string) => void;
  convertFrom: (amount: number, from: string) => number;
  money: (amount: number | null | undefined, from?: string) => string;
};

const CurrencyContext = createContext<CurrencyValue | null>(null);

function readStored(): string {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored && isKnownCurrency(stored)) return stored;
  } catch {
    return BASE_CURRENCY;
  }
  return BASE_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(readStored);

  useEffect(function persist() {
    try {
      window.localStorage.setItem(KEY, currency);
    } catch {
      return;
    }
  }, [currency]);

  const value = useMemo<CurrencyValue>(function build() {
    return {
      currency,
      setCurrency: function set(next) {
        if (isKnownCurrency(next)) setCurrencyState(next);
      },
      convertFrom: function convertFrom(amount, from) {
        return convert(amount, from || BASE_CURRENCY, currency);
      },
      money: function money(amount, from) {
        if (amount === null || amount === undefined) return "A combinar";
        return formatMoney(convert(amount, from || BASE_CURRENCY, currency), currency);
      },
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency fora do CurrencyProvider");
  return value;
}
