import { useEffect, useMemo, useState } from "react";
import { Building2, Layers, Search, Sparkles, Store as StoreIcon } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import NeoTile from "@/components/ui/NeoTile";
import Spinner from "@/components/ui/Spinner";
import StoreCard from "@/components/stores/StoreCard";
import { STORE_CATEGORIES, STORE_SERVICES } from "@/lib/storeServices";
import { listStores } from "@/lib/stores";
import type { StoreView } from "@/lib/stores";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

export default function Stores() {
  const { user } = useSession();
  const [items, setItems] = useState<StoreView[]>([]);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    function load() {
      let active = true;
      async function run() {
        setLoading(true);
        try {
          const rows = await listStores({ q: term, category: category || null, limit: 24 });
          if (!active) return;
          setItems(rows);
          setError(null);
        } catch (problem) {
          if (!active) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir a incubadora.");
        } finally {
          if (active) setLoading(false);
        }
      }
      const timer = window.setTimeout(run, term.length > 0 ? 260 : 0);
      return function stop() {
        active = false;
        window.clearTimeout(timer);
      };
    },
    [term, category],
  );

  const countries = useMemo(
    function count() {
      const seen: string[] = [];
      for (const store of items) {
        if (store.country && seen.indexOf(store.country) === -1) seen.push(store.country);
      }
      return seen.length;
    },
    [items],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ember-400">Incubadora de lojas</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Cada afiliado hospeda a sua conta e monta a sua loja.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-haze-300 md:text-base">
            Lojas digitais externas convivem com o mercado da rede: catalogo, mensagens, pagamentos, entregas, reservas,
            equipa, afiliados, analitica e subscricoes. Escolhe o nivel, liga os servicos e publica a tua montra.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <GlowButton to={user ? "/lojas/montar" : "/entrar"} size="lg">
              <StoreIcon className="h-4 w-4" />
              Montar a minha loja
            </GlowButton>
            <GlowButton to={user ? "/lojas/painel" : "/planos"} variant="glass" size="lg">
              {user ? "Painel da loja" : "Ver planos"}
            </GlowButton>
          </div>
        </div>
        <GlassCard tone="strong" className="layer-stack relative overflow-hidden p-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{ background: "radial-gradient(380px 180px at 20% 0%, rgba(124,252,0,0.22), transparent 70%)" }}
          />
          <div className="relative grid gap-3 sm:grid-cols-2">
            <NeoTile tone="ember" icon={<StoreIcon className="h-4 w-4" />} label="Lojas ativas" value={String(items.length)} hint="publicadas na incubadora" />
            <NeoTile tone="glow" icon={<Layers className="h-4 w-4" />} label="Servicos" value={String(STORE_SERVICES.length)} hint="por loja, em tres niveis" />
            <NeoTile tone="lime" icon={<Sparkles className="h-4 w-4" />} label="Setores" value={String(STORE_CATEGORIES.length)} hint="prontos para receber lojas" />
            <NeoTile tone="coral" icon={<Building2 className="h-4 w-4" />} label="Paises" value={String(countries)} hint="entrega internacional" />
          </div>
        </GlassCard>
      </div>

      <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
          <input
            value={term}
            onChange={function change(event) {
              setTerm(event.target.value);
            }}
            placeholder="Procurar loja, sector ou cidade"
            aria-label="Procurar loja"
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
          />
        </div>
        <div className="scroll-x gap-2 pb-1">
          <button
            type="button"
            onClick={function all() {
              setCategory("");
            }}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              category === "" ? "border-glow-400/60 bg-white/10 text-white" : "border-white/10 text-haze-300 hover:text-white",
            )}
          >
            Todas
          </button>
          {STORE_CATEGORIES.map(function render(item) {
            return (
              <button
                key={item}
                type="button"
                onClick={function pick() {
                  setCategory(category === item ? "" : item);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  category === item ? "border-glow-400/60 bg-white/10 text-white" : "border-white/10 text-haze-300 hover:text-white",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <Spinner label="A abrir a incubadora" />
        ) : error ? (
          <EmptyState
            title="Nao foi possivel abrir a incubadora"
            description={error}
            action={
              <GlowButton to="/lojas" size="sm">
                Tentar de novo
              </GlowButton>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Ainda nao ha lojas publicadas"
            description="Se o primeiro a montar uma loja dentro da rede: escolhe o nivel, liga os servicos e publica a tua montra."
            action={
              <GlowButton to={user ? "/lojas/montar" : "/entrar"} size="sm">
                Montar a minha loja
              </GlowButton>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(function render(store) {
              return <StoreCard key={store.id} store={store} />;
            })}
          </div>
        )}
      </div>

      <section className="mt-16">
        <GlassCard tone="strong" className="layer-stack relative overflow-hidden px-6 py-10 md:px-12">
          <div className="relative max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-glow-400">Como funciona</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              Do rascunho a loja aberta em tres passos
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <NeoTile tone="ember" label="01 Identidade" value="Montar" hint="Nome, setor, cidade, moeda e contactos." />
              <NeoTile tone="glow" label="02 Servicos" value="Ligar" hint="Dez servicos, ajustados ao teu nivel." />
              <NeoTile tone="lime" label="03 Publicar" value="Abrir" hint="Montra publica e codigo de afiliado." />
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
