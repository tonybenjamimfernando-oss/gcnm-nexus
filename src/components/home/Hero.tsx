import { ArrowRight, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import FloatingLayers from "@/components/home/FloatingLayers";
import GlowButton from "@/components/ui/GlowButton";
import type { ListingView, PlatformStats } from "@/lib/api";

type Props = {
  stats: PlatformStats;
  sample: ListingView | null;
};

export default function Hero({ stats, sample }: Props) {
  return (
    <section className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-4xl px-1 text-center">
        <span className="glass inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/[0.06] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100 sm:px-4 sm:text-[11px] sm:tracking-[0.22em]">
          <Globe2 className="h-3.5 w-3.5 text-glow-400" />
          O mercado global de FLOWEBUY
        </span>
        <h1 className="mt-6 font-display text-[2.55rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl md:mt-7 md:text-6xl">
          O mercado global
          <span className="neon mt-1 block text-emerald-300">em camadas.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[0.93rem] leading-7 text-slate-300 sm:text-base sm:leading-7">
          Compre, venda e negocie entre paises dentro de salas comerciais por sector: produtos, servicos e pedidos de
          compra no mesmo espaco, com precos na sua moeda e vendedores verificados.
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 px-5 sm:mt-8 sm:flex-row sm:items-center sm:px-0">
          <GlowButton to="/salas" size="lg">
            Explorar as 12 salas
            <ArrowRight className="h-4 w-4" />
          </GlowButton>
          <GlowButton to="/planos" variant="glass" size="lg" className="price-cta">
            Ver planos e precos
          </GlowButton>
        </div>
        <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400 sm:gap-x-6">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-glow-400" />
            {stats.currencies} moedas
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-mint-400" />
            {stats.verifiedSellers} vendedores verificados
          </span>
          <span>{stats.listings} ofertas ativas</span>
        </div>
      </div>

      <div className="mt-10 sm:mt-14">
        <FloatingLayers sample={sample} stats={stats} />
      </div>
    </section>
  );
}
