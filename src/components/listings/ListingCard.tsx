import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Eye, MapPin, ShieldCheck, Star, Sparkles } from "lucide-react";
import type { ListingView } from "@/lib/api";
import { formatNumber, listingKindLabel } from "@/lib/format";
import { useCurrency } from "@/lib/currency";
import { isFeatured } from "@/lib/featured";
import { useFavorites } from "@/lib/favorites";

const KIND_DOT: Record<string, string> = {
  product: "#2d7bfd",
  service: "#8a5cff",
  request: "#ffc46b",
  opportunity: "#6ce0c2",
};

export default function ListingCard({ item }: { item: ListingView }) {
  const { money } = useCurrency();
  const favorites = useFavorites();
  const saved = favorites.has(item.id);
  const dot = KIND_DOT[item.kind] || "#4d93ff";

  function save() {
    favorites.toggle({
      id: item.id,
      title: item.title,
      cover: item.cover,
      price: item.price,
      currency: item.currency,
      city: item.city,
      country: item.country,
      kind: item.kind,
      savedAt: new Date().toISOString(),
    });
  }

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group relative"
    >
      <div className="glass-deep relative overflow-hidden rounded-3xl transition duration-300 group-hover:border-glow-400/40">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={item.cover}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
            {listingKindLabel(item.kind)}
          </span>
          {isFeatured(item) ? (
            <span className="absolute left-3 top-12 inline-flex items-center gap-1 rounded-full border border-glow-400/40 bg-glow-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-glow-400 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Destaque
            </span>
          ) : null}
          <button
            type="button"
            onClick={save}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-ink-950/70 text-white backdrop-blur-md transition hover:border-glow-400/60"
            aria-label={saved ? "Remover dos guardados" : "Guardar anuncio"}
            title={saved ? "Remover dos guardados" : "Guardar"}
          >
            {saved ? <BookmarkCheck className="h-4 w-4 text-glow-400" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-[11px] text-haze-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">
              {item.city || "Sem local"}
              {item.country ? " - " + item.country : ""}
            </span>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(item.views)}
            </span>
          </div>

          <h3 className="mt-2 min-h-11 font-display text-sm font-bold leading-5 text-white transition group-hover:text-glow-400">
            <Link to={"/anuncio/" + item.id} className="line-clamp-2">
              {item.title}
            </Link>
          </h3>

          <p className="neon mt-3 font-display text-xl font-extrabold text-white">{money(item.price, item.currency)}</p>
          {item.price === null && item.budgetMax ? (
            <p className="mt-1 text-xs text-haze-500">Orcamento ate {money(item.budgetMax, item.currency)}</p>
          ) : null}

          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-haze-300">
            {item.ownerVerified ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-mint-400" />
            ) : (
              <span className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{item.ownerName}</span>
            {item.rating ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {item.rating}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
