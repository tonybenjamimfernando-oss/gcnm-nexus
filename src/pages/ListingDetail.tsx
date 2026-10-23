import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Check, Eye, MapPin, MessageCircle, Send, Share2, ShieldCheck, ShoppingBag, Star, Store } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import ListingGallery from "@/components/listings/ListingGallery";
import MiniMap from "@/components/listings/MiniMap";
import { getListing, listReviews, roomForListing } from "@/lib/api";
import type { ListingView, ReviewView } from "@/lib/api";
import { useCurrency } from "@/lib/currency";
import { useFavorites } from "@/lib/favorites";
import { accountTypeLabel, formatDate, formatMoney, formatMonthYear, formatNumber, listingKindLabel } from "@/lib/format";
import { findRoom } from "@/lib/rooms";
import { startConversation } from "@/lib/messaging";
import { startCheckout } from "@/lib/payments";
import { useSession } from "@/lib/session";

export default function ListingDetail() {
  const params = useParams();
  const id = params.id || "";
  const { money, currency } = useCurrency();
  const favorites = useFavorites();
  const [item, setItem] = useState<ListingView | null>(null);
  const [reviews, setReviews] = useState<ReviewView[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useSession();
  const paid = useSearchParams()[0].get("pago") === "1";
  const isOwner = Boolean(user && item && user.id === item.ownerId);

  async function contact() {
    if (!item) return;
    if (!user) {
      navigate("/entrar?next=/anuncio/" + item.id);
      return;
    }
    try {
      const conversationId = await startConversation(item.id, user.id, item.ownerId);
      navigate("/mensagens/" + conversationId);
    } catch (problem) {
      setContactError(problem instanceof Error ? problem.message : "Nao foi possivel abrir a conversa.");
    }
  }

  async function buy() {
    if (!item || buying) return;
    if (!user) {
      navigate("/entrar?next=/anuncio/" + item.id);
      return;
    }
    setBuying(true);
    setBuyError(null);
    try {
      const url = await startCheckout(item.id);
      window.location.href = url;
      return;
    } catch (problem) {
      setBuyError(problem instanceof Error ? problem.message : "Nao foi possivel iniciar o pagamento.");
    } finally {
      setBuying(false);
    }
  }

  useEffect(
    function load() {
      let active = true;
      setLoading(true);
      async function run() {
        const found = await getListing(id);
        const list = found ? await listReviews(found.id) : [];
        if (!active) return;
        setItem(found);
        setReviews(list);
        setLoading(false);
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [id],
  );

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item ? item.title : "GCNM Nexus", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(function reset() {
        setCopied(false);
      }, 2200);
    } catch {
      setCopied(false);
    }
  }

  if (loading) return <Spinner label="A carregar oferta" />;

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Oferta nao encontrada"
          description="Esta oferta pode ter sido removida ou o endereco esta incompleto."
          action={
            <GlowButton to="/explorar" size="sm">
              Voltar a explorar
            </GlowButton>
          }
        />
      </div>
    );
  }

  const saved = favorites.has(item.id);
  const room = findRoom(roomForListing({ title: item.title, category: item.category, brand: item.brand }));
  const converted = currency !== item.currency && item.price !== null;
  const featureList = item.features
    ? item.features
        .split("|")
        .map(function trim(part) {
          return part.trim();
        })
        .filter(function valid(part) {
          return part.length > 0;
        })
    : [];

  function save() {
    if (!item) return;
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

  const specs = [
    { label: "Marca", value: item.brand || "Nao indicada" },
    { label: "Estado", value: item.condition || "Nao indicado" },
    { label: "Garantia", value: item.warranty || "Nao indicada" },
    { label: "Entrega", value: item.delivery || "A combinar" },
    { label: "Devolucoes", value: item.returnsPolicy || "A combinar" },
    {
      label: "Quantidade",
      value:
        item.quantity === null
          ? item.stock === null
            ? "Sob consulta"
            : formatNumber(item.stock) + " disponiveis"
          : formatNumber(item.quantity) + " unidades",
    },
    { label: "Prazo", value: item.deadline ? formatDate(item.deadline) : "Sem prazo definido" },
    { label: "Publicado", value: formatDate(item.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to="/explorar"
        className="inline-flex items-center gap-2 text-xs font-bold text-haze-300 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar as ofertas
      </Link>

      {paid ? (
        <div className="mt-5 rounded-2xl border border-mint-400/30 bg-mint-400/10 px-4 py-3 text-sm font-semibold text-mint-400">
          Pagamento confirmado. O vendedor recebe a encomenda e entra em contacto para combinar a entrega.
        </div>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ListingGallery images={item.images} title={item.title} />

          <GlassCard className="mt-6 p-5">
            <h2 className="font-display text-lg font-bold text-white">Descricao</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-haze-300">
              {item.description || "Sem descricao detalhada."}
            </p>
          </GlassCard>

          {featureList.length > 0 ? (
            <GlassCard className="mt-4 p-5">
              <h2 className="font-display text-lg font-bold text-white">Caracteristicas</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {featureList.map(function render(feature) {
                  return (
                    <p key={feature} className="flex items-start gap-2 text-sm leading-6 text-haze-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
                      {feature}
                    </p>
                  );
                })}
              </div>
            </GlassCard>
          ) : null}

          <GlassCard className="mt-4 p-5">
            <h2 className="font-display text-lg font-bold text-white">Detalhes da oferta</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {specs.map(function render(entry) {
                return (
                  <div key={entry.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">{entry.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{entry.value}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="mt-4 p-5">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-bold text-white">Avaliacoes</h2>
              {item.rating ? (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {item.rating}
                  <span className="text-xs font-semibold text-haze-500">({item.reviewCount})</span>
                </span>
              ) : (
                <span className="text-xs text-haze-500">Ainda sem avaliacoes</span>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-haze-300">Esta oferta ainda nao recebeu avaliacoes.</p>
              ) : (
                reviews.map(function render(review) {
                  return (
                    <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{review.authorName}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {review.rating}
                        </span>
                        <span className="ml-auto text-[11px] text-haze-500">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-haze-300">{review.comment}</p>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>

          {item.latitude !== null && item.longitude !== null ? (
            <GlassCard className="mt-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-white">Localizacao</h2>
                <Link to="/mapa" className="text-xs font-bold text-glow-400 transition hover:text-white">
                  Ver no mapa
                </Link>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                <MiniMap latitude={item.latitude} longitude={item.longitude} />
              </div>
            </GlassCard>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-28">
            <GlassCard tone="strong" className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-haze-300">
                  {listingKindLabel(item.kind)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-haze-300">
                  {item.category}
                </span>
                {room ? (
                  <Link
                    to={"/salas/" + room.slug}
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-950"
                    style={{ backgroundColor: room.accent }}
                  >
                    {room.name}
                  </Link>
                ) : null}
              </div>

              <h1 className="mt-4 font-display text-2xl font-extrabold leading-8 tracking-tight text-white">
                {item.title}
              </h1>

              <p className="neon mt-4 font-display text-3xl font-extrabold text-white">
                {money(item.price, item.currency)}
              </p>
              {converted ? (
                <p className="mt-1 text-xs text-haze-500">
                  Preco original: {formatMoney(item.price === null ? 0 : item.price, item.currency)} {item.currency}
                </p>
              ) : null}
              {item.price === null && item.budgetMax ? (
                <p className="mt-1 text-xs text-haze-300">Orcamento ate {money(item.budgetMax, item.currency)}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-haze-300">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-glow-400" />
                  {item.city || "Sem local"}
                  {item.country ? ", " + item.country : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-glow-400" />
                  {formatNumber(item.views)} visualizacoes
                </span>
              </div>

              <div className="mt-5 grid gap-2">
                <GlowButton onClick={save} variant={saved ? "glass" : "primary"} className="w-full">
                  {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? "Guardado" : "Guardar oferta"}
                </GlowButton>
                <GlowButton onClick={share} variant="glass" className="w-full">
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Ligacao copiada" : "Partilhar oferta"}
                </GlowButton>
                <GlowButton to={"/explorar?vendedor=" + item.ownerId} variant="ghost" className="w-full">
                  <Store className="h-4 w-4" />
                  Ver mais deste vendedor
                </GlowButton>
                {!isOwner && (item.kind === "product" || item.kind === "service") && item.price !== null ? (
                  <GlowButton onClick={buy} variant="primary" className="w-full">
                    <ShoppingBag className="h-4 w-4" />
                    {buying ? "A abrir pagamento..." : "Comprar agora"}
                  </GlowButton>
                ) : null}
                {!isOwner && item.kind !== "request" ? (
                  <GlowButton onClick={contact} variant="glass" className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    Contactar vendedor
                  </GlowButton>
                ) : null}
                {!isOwner && item.kind === "request" ? (
                  <GlowButton to={"/anuncio/" + item.id + "/propostas"} variant="glass" className="w-full">
                    <Send className="h-4 w-4" />
                    Enviar proposta
                  </GlowButton>
                ) : null}
                {isOwner && item.kind === "request" ? (
                  <GlowButton to={"/anuncio/" + item.id + "/propostas"} variant="glass" className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    Ver propostas recebidas
                  </GlowButton>
                ) : null}
                {isOwner ? (
                  <GlowButton to={"/publicar?id=" + item.id} variant="ghost" className="w-full">
                    Editar anuncio
                  </GlowButton>
                ) : null}
                {contactError ? (
                  <p className="text-xs text-amber-400">{contactError}</p>
                ) : null}
                {buyError ? (
                  <p className="text-xs text-amber-400">{buyError}</p>
                ) : null}
              </div>

              {item.isExternal ? (
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-haze-300">
                  Oferta de origem externa{item.sourceStore ? " em " + item.sourceStore : ""}. Confirme condicoes no
                  anuncio original antes de negociar.
                </p>
              ) : null}
            </GlassCard>

            <GlassCard className="mt-4 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 font-display text-sm font-extrabold text-glow-400">
                  {item.ownerName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-sm font-bold text-white">{item.ownerName}</p>
                    {item.ownerVerified ? <ShieldCheck className="h-4 w-4 shrink-0 text-mint-400" /> : null}
                  </div>
                  <p className="mt-0.5 text-xs text-haze-500">
                    {accountTypeLabel(item.ownerType)}
                    {item.ownerCity ? " - " + item.ownerCity : ""}
                  </p>
                  {item.ownerSince ? (
                    <p className="mt-1 text-[11px] text-haze-500">Membro desde {formatMonthYear(item.ownerSince)}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <GlowButton to="/planos" variant="glass" size="sm" className="w-full">
                  Promover esta oferta
                </GlowButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
