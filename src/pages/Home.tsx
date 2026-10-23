import { useEffect, useState } from "react";
import { ArrowRight, Coins, ShieldCheck } from "lucide-react";
import Hero from "@/components/home/Hero";
import IncubatorBand from "@/components/home/IncubatorBand";
import RoomsShowcase from "@/components/home/RoomsShowcase";
import Spotlight from "@/components/home/Spotlight";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { listListings, platformStats } from "@/lib/api";
import type { ListingView, PlatformStats } from "@/lib/api";
import { useCurrency } from "@/lib/currency";
import { PLANS } from "@/lib/plans";

const EMPTY_STATS: PlatformStats = { listings: 0, verifiedSellers: 0, rooms: 12, currencies: 0 };

export default function Home() {
  const { money } = useCurrency();
  const [items, setItems] = useState<ListingView[]>([]);
  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(function load() {
    let active = true;
    async function run() {
      try {
        const result = await Promise.all([listListings({ sort: "recent", limit: 8 }), platformStats()]);
        if (!active) return;
        setItems(result[0]);
        setStats(result[1]);
      } catch (problem) {
        if (!active) return;
        setError(problem instanceof Error ? problem.message : "Nao foi possivel carregar o mercado.");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return function stop() {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Nao foi possivel abrir o mercado"
          description={error}
          action={
            <GlowButton to="/salas" size="sm">
              Ver as salas
            </GlowButton>
          }
        />
      </div>
    );
  }

  const paidPlans = PLANS.filter(function paid(plan) {
    return plan.monthlyUsd > 0;
  });

  return (
    <div>
      <Hero stats={stats} sample={items.length > 0 ? items[0] : null} />
      <Spotlight items={items.slice(0, 8)} loading={loading} />
      <RoomsShowcase />
      <IncubatorBand />

      <section className="mx-auto mt-24 max-w-7xl">
        <SectionHeading
          eyebrow="Planos"
          title="Precos na sua moeda, para vender ao mundo"
          description="Comece gratis para comprar e procurar. Vendedores, empresas e redes globais ativam planos com destaque, catalogo organizado e relatorios."
          action={
            <GlowButton to="/planos" variant="glass" size="sm">
              Comparar planos
            </GlowButton>
          }
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {paidPlans.map(function render(plan) {
            return (
              <GlassCard key={plan.id} tone="deep" className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-glow-400">{plan.audience}</p>
                <h3 className="mt-2 font-display text-xl font-extrabold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-haze-300">{plan.tagline}</p>
                <p className="neon mt-4 font-display text-2xl font-extrabold text-white">
                  {money(plan.monthlyUsd, "USD")}
                  <span className="ml-1 text-xs font-semibold text-haze-500">/ mes</span>
                </p>
                <ul className="mt-4 grid gap-2 text-xs text-haze-300">
                  {plan.features.slice(0, 3).map(function render(feature) {
                    return (
                      <li key={feature} className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-400" />
                        {feature}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5">
                  <GlowButton to="/planos" variant="glass" size="sm" className="w-full">
                    Ver detalhes
                  </GlowButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl">
        <GlassCard tone="strong" className="relative overflow-hidden px-6 py-10 text-center md:px-14 md:py-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ background: "radial-gradient(520px 220px at 50% 0%, rgba(45,123,253,0.35), transparent 70%)" }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-300">
              <Coins className="h-3.5 w-3.5 text-glow-400" />
              {stats.currencies} moedas
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-white md:text-4xl">
              Negocie entre paises sem trocar as regras do jogo
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-haze-300">
              Vendedores verificados, avaliacoes publicas e condicoes de entrega declaradas em cada oferta. O preco
              aparece na moeda de quem visita.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <GlowButton to="/explorar" size="lg">
                Explorar ofertas
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
              <GlowButton to="/salas" variant="glass" size="lg">
                Ver as salas
              </GlowButton>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
