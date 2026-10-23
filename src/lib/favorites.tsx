import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const KEY = "gcnm:favorites";

type FavoritesValue = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  count: number;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(function text(item) {
      return typeof item === "string";
    }) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(readStored);

  useEffect(function persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      return;
    }
  }, [ids]);

  const value = useMemo<FavoritesValue>(function build() {
    return {
      ids,
      has: function has(id) {
        return ids.indexOf(id) !== -1;
      },
      toggle: function toggle(id) {
        setIds(function next(current) {
          return current.indexOf(id) === -1 ? current.concat([id]) : current.filter(function keep(item) {
            return item !== id;
          });
        });
      },
      clear: function clear() {
        setIds([]);
      },
      count: ids.length,
    };
  }, [ids]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites fora do FavoritesProvider");
  return value;
}
