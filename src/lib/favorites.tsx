import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearSavedFor, listSavedIds, listingsByIds, saveListingFor, unsaveListingFor } from "./api";
import type { ListingView } from "./api";
import { useSession } from "./session";
import { isSupabaseReady } from "./supabase";

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

function entryOf(view: ListingView): FavoriteEntry {
  return {
    id: view.id,
    title: view.title,
    cover: view.cover,
    price: view.price,
    currency: view.currency,
    city: view.city,
    country: view.country,
    kind: view.kind,
    savedAt: new Date().toISOString(),
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [items, setItems] = useState<FavoriteEntry[]>(readStored);
  const inAccount = Boolean(user) && isSupabaseReady;

  useEffect(
    function keepLocal() {
      if (inAccount) return;
      try {
        window.localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        return;
      }
    },
    [items, inAccount],
  );

  useEffect(
    function followAccount() {
      if (!user || !isSupabaseReady) return;
      const userId = user.id;
      let active = true;
      async function run() {
        const local = readStored();
        for (const entry of local) {
          await saveListingFor(userId, entry.id);
        }
        if (local.length > 0) {
          try {
            window.localStorage.removeItem(KEY);
          } catch {
            return;
          }
        }
        const ids = await listSavedIds(userId);
        const views = await listingsByIds(ids);
        if (!active) return;
        const index = new Map<string, ListingView>();
        for (const view of views) index.set(view.id, view);
        setItems(
          ids
            .map(function entry(id) {
              const view = index.get(id);
              return view ? entryOf(view) : null;
            })
            .filter(function present(entry): entry is FavoriteEntry {
              return entry !== null;
            }),
        );
      }
      run().catch(function keep() {
        return;
      });
      return function stop() {
        active = false;
      };
    },
    [user],
  );

  const value = useMemo<FavoritesValue>(
    function build() {
      function write(id: string, saving: boolean) {
        if (!user || !isSupabaseReady) return;
        const work = saving ? saveListingFor(user.id, id) : unsaveListingFor(user.id, id);
        work.catch(function keep() {
          return;
        });
      }
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
          const exists = items.some(function match(item) {
            return item.id === entry.id;
          });
          setItems(
            exists
              ? items.filter(function keep(item) {
                  return item.id !== entry.id;
                })
              : [entry].concat(items),
          );
          write(entry.id, !exists);
        },
        remove: function remove(id) {
          setItems(
            items.filter(function keep(item) {
              return item.id !== id;
            }),
          );
          write(id, false);
        },
        clear: function clear() {
          setItems([]);
          if (user && isSupabaseReady) {
            clearSavedFor(user.id).catch(function keep() {
              return;
            });
          }
        },
        count: items.length,
      };
    },
    [items, user],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites fora do FavoritesProvider");
  return value;
}
