import { SlidersHorizontal, LayoutGrid, Rows3, Search, X } from "lucide-react";
import Chip from "@/components/ui/Chip";
import { ROOMS } from "@/lib/rooms";
import { cn } from "@/lib/cn";

export type FilterPatch = {
  q?: string;
  room?: string;
  kind?: string;
  sort?: string;
  view?: string;
};

const KINDS = [
  { value: "", label: "Tudo" },
  { value: "product", label: "Produtos" },
  { value: "service", label: "Servicos" },
  { value: "request", label: "Pedidos" },
  { value: "opportunity", label: "Oportunidades" },
];

type Props = {
  query: string;
  room: string;
  kind: string;
  sort: string;
  view: string;
  resultCount: number;
  onChange: (patch: FilterPatch) => void;
};

export default function ListingFilters({ query, room, kind, sort, view, resultCount, onChange }: Props) {
  return (
    <div className="glass-strong rounded-3xl p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
          <input
            value={query}
            onChange={function change(event) {
              onChange({ q: event.target.value });
            }}
            placeholder="Produto, servico, marca ou cidade"
            aria-label="Pesquisar"
            className="h-12 w-full rounded-2xl border border-white/10 bg-ink-900/50 pl-11 pr-10 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={function clear() {
                onChange({ q: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-haze-500 transition hover:text-white"
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-haze-500" />
            <select
              value={sort}
              onChange={function change(event) {
                onChange({ sort: event.target.value });
              }}
              aria-label="Ordenar"
              className="h-11 appearance-none rounded-2xl border border-white/10 bg-ink-900/60 pl-9 pr-8 text-xs font-semibold text-haze-100 outline-none focus:border-glow-400/60"
            >
              <option value="recent">Mais recentes</option>
              <option value="views">Mais vistos</option>
              <option value="price-asc">Preco: menor primeiro</option>
              <option value="price-desc">Preco: maior primeiro</option>
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-ink-900/60 p-1">
            <button
              type="button"
              onClick={function grid() {
                onChange({ view: "grid" });
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition",
                view !== "compare" ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grelha
            </button>
            <button
              type="button"
              onClick={function compare() {
                onChange({ view: "compare" });
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition",
                view === "compare" ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
              )}
            >
              <Rows3 className="h-3.5 w-3.5" />
              Comparar
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-x mt-4 gap-2">
        <Chip active={room === ""} onClick={function all() {
          onChange({ room: "" });
        }}>
          Todas as salas
        </Chip>
        {ROOMS.map(function render(item) {
          return (
            <Chip
              key={item.slug}
              active={room === item.slug}
              onClick={function pick() {
                onChange({ room: item.slug });
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.accent }} />
              {item.name}
            </Chip>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {KINDS.map(function render(item) {
          return (
            <Chip
              key={item.label}
              active={kind === item.value}
              onClick={function pick() {
                onChange({ kind: item.value });
              }}
            >
              {item.label}
            </Chip>
          );
        })}
        <span className="ml-auto text-xs text-haze-500">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </span>
      </div>
    </div>
  );
}
