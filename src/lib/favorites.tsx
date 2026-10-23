import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const KEY = "gcnm:favorites";

export type FavoriteEntry = {
  id: string;
  title: string;
  cover: string;
  price: number | null;
  currency: string;
  city: string | null;
  country: string | null;
  kind: string;
  savedAt: string;
};

type FavoritesValue = {
  items: FavoriteEntry[];
  ids: string[];
  has: (id: string) => boolean;
  toggle: (entry: FavoriteEntry) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

function readStored(): FavoriteEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(function valid(item) {
      return Boolean(item) && typeof item.id === "string";
    }) as FavoriteEntry[];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteEntry[]>(readStored);

  useEffect(
    function persist() {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        return;
      }
    },
    [items],
  );

  const value = useMemo<FavoritesValue>(
    function build() {
      return {
        items,
        ids: items.map(function id(entry) {
          return entry.id;
        }),
        has: function has(id) {
          return items.some(function match(entry) {
            return entry.id === id;
          });
        },
        toggle: function toggle(entry) {
          setItems(function next(current) {
            const exists = current.some(function match(item) {
              return item.id === entry.id;
            });
            if (exists) {
              return current.filter(function keep(item) {
                return item.id !== entry.id;
              });
            }
            return [entry].concat(current);
          });
        },
        remove: function remove(id) {
          setItems(function next(current) {
            return current.filter(function keep(item) {
              return item.id !== id;
            });
          });
        },
        clear: function clear() {
          setItems([]);
        },
        count: items.length,
      };
    },
    [items],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites fora do FavoritesProvider");
  return value;
}
