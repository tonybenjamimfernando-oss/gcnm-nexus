import { Coins, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import type { ListingView, PlatformStats } from "@/lib/api";
import { useCurrency } from "@/lib/currency";
import { formatCompact, listingKindLabel } from "@/lib/format";

type Props = {
  sample: ListingView | null;
  stats: PlatformStats;
};

export default function FloatingLayers({ sample, stats }: Props) {
  const { money, currency } = useCurrency();

  return (
    <div className="stage relative mx-auto w-full max-w-4xl">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl md:h-96 md:w-96"
        style={{ background: "radial-gradient(circle, rgba(45,123,253,0.35), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="glass-strong layer-1 relative z-10 rounded-[2rem] p-3 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)] md:p-5">
        <div className="flex items-center gap-2 px-2 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-glow-500" />
          <span className="ml-3 text-[11px] font-bold uppercase tracking-[0.24em] text-haze-500">
            Mercado global
          </span>
          <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-haze-300 sm:inline-flex">
            <Coins className="h-3 w-3 text-glow-400" />
            {currency}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <div className="glass-deep overflow-hidden rounded-3xl md:col-span-3">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={sample ? sample.cover : "https://picsum.photos/seed/gcnm-hero/1200/750"}
                alt={sample ? sample.title : "Oferta em destaque"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  {sample ? listingKindLabel(sample.kind) : "Produto"}
                </span>
                <h3 className="mt-2 font-display text-base font-extrabold leading-5 text-white">
                  {sample ? sample.title : "Ofertas verificadas em 12 salas comerciais"}
                </h3>
                <p className="neon mt-1 font-display text-2xl font-extrabold text-white">
                  {sample ? money(sample.price, sample.currency) : "-"}
                </p>
                <p className="mt-1 text-xs text-haze-300">
                  {sample ? (sample.city || "Sem local") + (sample.country ? " - " + sample.country : "") : "Mercado global"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:col-span-2">
            <div className="glass rounded-3xl p-4">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-haze-500">
                <TrendingUp className="h-3.5 w-3.5 text-glow-400" />
                Salas ativas
              </span>
              <p className="mt-2 font-display text-2xl font-extrabold text-white">{stats.rooms}</p>
              <p className="mt-1 text-xs text-haze-500">{stats.listings} ofertas publicadas</p>
            </div>
            <div className="glass rounded-3xl p-4">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-haze-500">
                <Coins className="h-3.5 w-3.5 text-glow-400" />
                Moedas suportadas
              </span>
              <p className="mt-2 font-display text-2xl font-extrabold text-white">{stats.currencies}</p>
              <p className="mt-1 text-xs text-haze-500">Precos na moeda do visitante</p>
            </div>
            <div className="glass rounded-3xl p-4">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-haze-500">
                <ShieldCheck className="h-3.5 w-3.5 text-mint-400" />
                Vendedores verificados
              </span>
              <p className="mt-2 font-display text-2xl font-extrabold text-white">{stats.verifiedSellers}</p>
              <p className="mt-1 text-xs text-haze-500">Documentacao validada pela equipa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="float-a absolute -left-4 top-16 hidden w-44 xl:block">
        <div className="glass-strong rounded-3xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">Salas comerciais</span>
          <p className="mt-2 font-display text-xl font-extrabold text-white">12 sectores</p>
          <p className="mt-1 text-[11px] leading-4 text-haze-300">Cada sala com 10 modulos prontos a usar.</p>
        </div>
      </div>

      <div className="float-b absolute -right-6 top-40 hidden w-48 xl:block">
        <div className="glass-strong rounded-3xl p-4">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">
            <Sparkles className="h-3.5 w-3.5 text-glow-400" />
            Alcance
          </span>
          <p className="mt-2 font-display text-xl font-extrabold text-white">{formatCompact(stats.listings * 42)}</p>
          <p className="mt-1 text-[11px] leading-4 text-haze-300">visualizacoes por mes nas salas.</p>
        </div>
      </div>
    </div>
  );
}
