import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Eye, LayoutGrid, ShieldCheck, Star } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import ListingCard from "@/components/listings/ListingCard";
import ListingFilters from "@/components/listings/ListingFilters";
import type { FilterPatch } from "@/components/listings/ListingFilters";
import { listListings } from "@/lib/api";
import type { ListingView } from "@/lib/api";
import { useCurrency } from "@/lib/currency";
import { formatNumber, listingKindLabel } from "@/lib/format";
import { roomName } from "@/lib/rooms";
import { cn } from "@/lib/cn";

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const { money } = useCurrency();
  const q = params.get("q") || "";
  const room = params.get("sala") || "";
  const kind = params.get("tipo") || "";
  const sort = params.get("ordenar") || "recent";
  const view = params.get("vista") || "grid";
  const seller = params.get("vendedor") || "";

  const [term, setTerm] = useState(q);
  const [items, setItems] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  function patch(next: FilterPatch) {
    const merged = new URLSearchParams(params);
    const map: Record<string, string> = { q: "q", room: "sala", kind: "tipo", sort: "ordenar", view: "vista" };
    Object.keys(next).forEach(function apply(key) {
      const value = (next as Record<string, string | undefined>)[key];
      const name = map[key];
      if (!name) return;
      if (!value || value === "" || (key === "sort" && value === "recent") || (key === "view" && value === "grid")) {
        merged.delete(name);
      } else {
        merged.set(name, value);
      }
    });
    setParams(merged, { replace: true });
  }

  useEffect(
    function sync() {
      setTerm(q);
    },
    [q],
  );

  useEffect(
    function debounce() {
      const handle = window.setTimeout(function apply() {
        if (term !== q) patch({ q: term });
      }, 420);
      return function clear() {
        window.clearTimeout(handle);
      };
    },
    [term],
  );

  useEffect(
    function load() {
      let active = true;
      setLoading(true);
      async function run() {
        try {
          const result = await listListings({ q, room, kind, sort, seller, limit: 24 });
          if (!active) return;
          setItems(result);
          setError(null);
        } catch (problem) {
          if (!active) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel carregar as ofertas.");
        } finally {
          if (active) setLoading(false);
        }
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [q, room, kind, sort, seller],
  );

  function togglePick(id: string) {
    setPicked(function next(current) {
      if (current.indexOf(id) !== -1) {
        return current.filter(function keep(item) {
          return item !== id;
        });
      }
      if (current.length >= 3) return current;
      return current.concat([id]);
    });
  }

  const selected = items.filter(function match(item) {
    return picked.indexOf(item.id) !== -1;
  });

  const rows: Array<{ label: string; render: (item: ListingView) => string }> = [
    {
      label: "Preco",
      render: function price(item) {
        return money(item.price, item.currency);
      },
    },
    {
      label: "Tipo",
      render: function kindOf(item) {
        return listingKindLabel(item.kind);
      },
    },
    {
      label: "Local",
      render: function place(item) {
        return (item.city || "-") + (item.country ? ", " + item.country : "");
      },
    },
    {
      label: "Vendedor",
      render: function owner(item) {
        return item.ownerName;
      },
    },
    {
      label: "Avaliacao",
      render: function rating(item) {
        return item.rating ? String(item.rating) + " (" + item.reviewCount + ")" : "Sem avaliacoes";
      },
    },
    {
      label: "Garantia",
      render: function warranty(item) {
        return item.warranty || "Nao indicada";
      },
    },
    {
      label: "Entrega",
      render: function delivery(item) {
        return item.delivery || "A combinar";
      },
    },
    {
      label: "Disponivel",
      render: function stock(item) {
        return item.stock === null ? "Sob consulta" : formatNumber(item.stock) + " unidades";
      },
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Explorar</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          {seller ? "Ofertas do vendedor" : roomName(room)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-haze-300">
          Filtre por sala, tipo de oferta e cidade. Compare ate tres ofertas lado a lado e guarde as melhores.
        </p>
      </div>

      <ListingFilters
        query={term}
        room={room}
        kind={kind}
        sort={sort}
        view={view}
        resultCount={items.length}
        onChange={patch}
      />

      {seller ? (
        <div className="mt-4">
          <GlowButton to="/explorar" variant="ghost" size="sm">
            Ver todas as ofertas
          </GlowButton>
        </div>
      ) : null}

      {loading ? <Spinner label="A procurar ofertas" /> : null}

      {!loading && error ? (
        <div className="mt-8">
          <EmptyState title="Nao foi possivel carregar" description={error} />
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Sem ofertas com estes filtros"
            description="Tente outra sala, outro tipo de oferta ou limpe a pesquisa."
            action={
              <GlowButton
                size="sm"
                onClick={function reset() {
                  patch({ q: "", room: "", kind: "" });
                }}
              >
                Limpar filtros
              </GlowButton>
            }
          />
        </div>
      ) : null}

      {!loading && !error && items.length > 0 && view === "compare" ? (
        <GlassCard tone="strong" className="mt-6 overflow-hidden p-4 md:p-5">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-glow-400" />
            <p className="text-sm font-bold text-white">Comparador</p>
            <span className="text-xs text-haze-500">{picked.length} de 3 selecionadas</span>
          </div>
          {selected.length < 2 ? (
            <p className="mt-3 text-xs text-haze-300">
              Escolha pelo menos duas ofertas na lista abaixo para ver a comparacao.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <tbody>
                  <tr>
                    <th className="w-40 px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.18em] text-haze-500">
                      Oferta
                    </th>
                    {selected.map(function head(item) {
                      return (
                        <th key={item.id} className="px-3 py-2 text-left text-xs font-bold text-white">
                          <Link to={"/anuncio/" + item.id} className="hover:text-glow-400">
                            {item.title}
                          </Link>
                        </th>
                      );
                    })}
                  </tr>
                  {rows.map(function row(entry) {
                    return (
                      <tr key={entry.label} className="border-t border-white/10">
                        <td className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-haze-500">
                          {entry.label}
                        </td>
                        {selected.map(function cell(item) {
                          return (
                            <td key={item.id + entry.label} className="px-3 py-2 text-sm text-haze-100">
                              {entry.render(item)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(function render(item) {
            const isPicked = picked.indexOf(item.id) !== -1;
            return (
              <div key={item.id} className="flex flex-col gap-3">
                <ListingCard item={item} />
                {view === "compare" ? (
                  <button
                    type="button"
                    onClick={function pick() {
                      togglePick(item.id);
                    }}
                    className={cn(
                      "inline-flex h-10 items-center justify-center gap-2 rounded-full border text-xs font-bold transition",
                      isPicked
                        ? "border-transparent bg-glow-500 text-white"
                        : "border-white/10 bg-white/5 text-haze-300 hover:text-white",
                    )}
                  >
                    {isPicked ? <Check className="h-4 w-4" /> : null}
                    {isPicked ? "Na comparacao" : "Comparar"}
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-haze-500">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {formatNumber(item.views)} visualizacoes
                    </span>
                    {item.ownerVerified ? (
                      <span className="inline-flex items-center gap-1 text-mint-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verificado
                      </span>
                    ) : null}
                    {item.rating ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {item.rating}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
