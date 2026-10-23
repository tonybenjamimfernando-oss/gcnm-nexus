import { Link } from "react-router-dom";
import { Layers, MapPin, ShieldCheck, Store } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { storeLocation } from "@/lib/stores";
import type { StoreView } from "@/lib/stores";
import { tierLabel } from "@/lib/storeServices";
import { cn } from "@/lib/cn";

const ACCENTS: Record<string, string> = {
  glow: "neo-glow",
  ember: "neo-ember",
  coral: "neo-coral",
  lime: "neo-lime",
};

export default function StoreCard({ store }: { store: StoreView }) {
  return (
    <GlassCard tone="deep" className="card-lift flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("neo grid h-12 w-12 place-items-center rounded-2xl text-white", ACCENTS[store.accent] || "neo-glow")}>
          <Store className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-haze-300">
          {tierLabel(store.tier)}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-extrabold tracking-tight text-white">{store.name}</h3>
      <p className="mt-1 text-sm leading-6 text-haze-300">{store.tagline || store.description || "Loja digital na rede GCNM."}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-haze-500">
        {store.category ? <span className="rounded-full border border-white/10 px-2.5 py-1">{store.category}</span> : null}
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {storeLocation(store) || "Global"}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-haze-500">
        <span className="inline-flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-glow-400" />
          {store.services.length} servicos
        </span>
        <span>{store.listings} ofertas</span>
        {store.ownerVerified ? (
          <span className="inline-flex items-center gap-1 text-mint-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            verificado
          </span>
        ) : null}
      </div>
      <div className="mt-5 pt-1">
        <Link
          to={"/loja/" + store.slug}
          className="neo inline-flex h-10 w-full items-center justify-center rounded-full text-sm font-semibold text-haze-100 transition hover:-translate-y-0.5"
        >
          Abrir loja
        </Link>
      </div>
    </GlassCard>
  );
}
