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
      <div className="mx-auto max-w-3xl text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-300">
          <Globe2 className="h-3.5 w-3.5 text-glow-400" />
          Global commerce network map
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
          O mercado global
          <span className="block text-glow-400 neon">em camadas.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-haze-300 md:text-base">
          Compre, venda e negocie entre paises dentro de salas comerciais por sector: produtos, servicos e pedidos de
          compra no mesmo espaco, com precos na sua moeda e vendedores verificados.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <GlowButton to="/salas" size="lg">
            Explorar as 12 salas
            <ArrowRight className="h-4 w-4" />
          </GlowButton>
          <GlowButton to="/planos" variant="glass" size="lg">
            Ver planos e precos
          </GlowButton>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-haze-500">
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

      <div className="mt-14">
        <FloatingLayers sample={sample} stats={stats} />
      </div>
    </section>
  );
}
