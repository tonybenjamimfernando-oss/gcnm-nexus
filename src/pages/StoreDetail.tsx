import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Globe, Layers, Mail, MapPin, Phone, Share2, ShieldCheck, Store as StoreIcon } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import NeoTile from "@/components/ui/NeoTile";
import Spinner from "@/components/ui/Spinner";
import ListingCard from "@/components/listings/ListingCard";
import { getStoreBySlug, joinAsAffiliate, listStoreListings, storeLocation } from "@/lib/stores";
import type { StoreView } from "@/lib/stores";
import type { ListingView } from "@/lib/api";
import StoreSeo from "@/components/stores/StoreSeo";
import { AFFILIATE_LEVELS, firstMonthBonus } from "@/lib/economy";
import { storeBrief } from "@/lib/marketing";
import { formatMoney } from "@/lib/format";
import { serviceLabel, tierLabel } from "@/lib/storeServices";
import { useSession } from "@/lib/session";

export default function StoreDetail() {
  const params = useParams();
  const { user } = useSession();
  const [store, setStore] = useState<StoreView | null>(null);
  const [items, setItems] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const slug = params.slug || "";

  useEffect(
    function load() {
      let active = true;
      async function run() {
        setLoading(true);
        try {
          const found = await getStoreBySlug(slug);
          if (!active) return;
          setStore(found);
          setError(null);
          if (found) {
            const rows = await listStoreListings(found.id);
            if (active) setItems(rows);
          }
        } catch (problem) {
          if (!active) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir a loja.");
        } finally {
          if (active) setLoading(false);
        }
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [slug],
  );

  async function becomeAffiliate() {
    if (!store || !user || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = await joinAsAffiliate(store.id, user.id);
      setCode(created);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel entrar como afiliado.");
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    const link = window.location.origin + "/loja/" + slug + (code ? "?ref=" + code : "");
    navigator.clipboard.writeText(link);
    setCopied(true);
  }

  if (loading) return <Spinner label="A abrir a loja" />;

  if (!store) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Loja nao encontrada"
          description={error || "Este endereco nao corresponde a nenhuma loja publicada na incubadora."}
          action={
            <GlowButton to="/lojas" size="sm">
              Ver todas as lojas
            </GlowButton>
          }
        />
      </div>
    );
  }

  const mine = Boolean(user && user.id === store.ownerId);

  return (
    <div className="mx-auto max-w-7xl">
      <Link to="/lojas" className="inline-flex items-center gap-2 text-xs font-semibold text-haze-500 transition hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar a incubadora
      </Link>

      <GlassCard tone="strong" className="layer-stack relative mt-4 overflow-hidden p-6 md:p-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{ background: "radial-gradient(520px 220px at 12% 0%, rgba(255,153,0,0.24), transparent 70%)" }}
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="neo neo-ember grid h-14 w-14 place-items-center rounded-2xl text-white">
                <StoreIcon className="h-6 w-6" />
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-white md:text-4xl">{store.name}</h1>
                <p className="mt-1 text-sm text-haze-300">{store.tagline || "Loja digital na rede GCNM."}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-haze-500">
              {store.category ? <span className="rounded-full border border-white/10 px-3 py-1 font-semibold text-haze-300">{store.category}</span> : null}
              <><StoreSeo brief={storeBrief({ name: store.name, slug: store.slug, city: store.city, category: store.category, tagline: store.tagline, tier: store.tier, url: window.location.origin + "/loja/" + store.slug })} storeId={store.id} /><span className="rounded-full border border-white/10 px-3 py-1 font-semibold text-haze-300">{tierLabel(store.tier)}</span></>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {storeLocation(store) || "Global"}
              </span>
              {store.ownerVerified ? (
                <span className="inline-flex items-center gap-1 text-mint-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  vendedor verificado
                </span>
              ) : null}
              {store.isExternal ? <span className="text-glow-400">loja externa</span> : null}
            </div>
            {store.description ? <p className="mt-5 text-sm leading-6 text-haze-300">{store.description}</p> : null}
            {mine ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <GlowButton to="/lojas/painel" size="sm" variant="glass">
                  Gerir esta loja
                </GlowButton>
                <GlowButton to="/publicar" size="sm">
                  Adicionar oferta
                </GlowButton>
              </div>
            ) : null}
          </div>
          <div className="grid w-full max-w-xs gap-3">
            {store.contactEmail ? (
              <a href={"mailto:" + store.contactEmail} className="neo flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white transition hover:-translate-y-0.5">
                <Mail className="h-4 w-4 text-ember-400" />
                Falar por email
              </a>
            ) : null}
            {store.contactPhone ? (
              <a href={"tel:" + store.contactPhone} className="neo flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white transition hover:-translate-y-0.5">
                <Phone className="h-4 w-4 text-mint-400" />
                {store.contactPhone}
              </a>
            ) : null}
            {store.website ? (
              <a href={store.website} target="_blank" rel="noreferrer" className="neo flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white transition hover:-translate-y-0.5">
                <Globe className="h-4 w-4 text-glow-400" />
                Site da loja
              </a>
            ) : null}
          </div>
        </div>
      </GlassCard>

      <section className="mt-10">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-white">Servicos ligados</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {store.services.length === 0 ? (
            <GlassCard className="p-5 text-sm text-haze-300">Esta loja ainda nao ligou servicos.</GlassCard>
          ) : (
            store.services.map(function render(service) {
              return <NeoTile key={service} tone="glow" icon={<Layers className="h-4 w-4" />} label="Servico" value={serviceLabel(service)} />;
            })
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-white">Ofertas da loja</h2>
          <GlowButton to="/explorar" variant="quiet" size="sm">
            Ver no mercado
          </GlowButton>
        </div>
        {items.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Catalogo em preparacao" description="Esta loja ainda nao publicou ofertas ligadas a montra." />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(function render(item) {
              return <ListingCard key={item.id} item={item} />;
            })}
          </div>
        )}
      </section>

      {store.affiliateEnabled ? (
        <section className="mt-12">
          <GlassCard tone="strong" className="layer-stack relative overflow-hidden p-6 md:p-8">
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-glow-400">Programa de afiliados</p>
                <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">
                  Traz vendas para esta loja e ganha {store.commission}% de comissao.
                </h2>
                <p className="mt-2 text-sm leading-6 text-haze-300">
                  Gera o teu codigo, partilha o link e acompanha o desempenho. A comissao sobe com as tuas lojas pagas ativas:{" "}
                  {AFFILIATE_LEVELS.map(function show(level) { return level.rate + "%"; }).join(" / ")} — o primeiro mes de cada plano entra
                  como bonus, a partir de {formatMoney(firstMonthBonus("pro"), "USD")}.
                </p>
                {code ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-mint-400/40 bg-mint-400/10 px-3 py-1.5 text-xs font-semibold text-mint-400">
                    <Check className="h-3.5 w-3.5" />
                    O teu codigo: {code}
                  </p>
                ) : null}
                {error ? <p className="mt-3 text-xs text-coral-400">{error}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <GlowButton onClick={becomeAffiliate} variant="glass" size="md" disabled={busy || Boolean(code)}>
                    <Share2 className="h-4 w-4" />
                    {code ? "Ja es afiliado" : "Ser afiliado desta loja"}
                  </GlowButton>
                ) : (
                  <GlowButton to="/entrar" variant="glass" size="md">
                    Entrar para ser afiliado
                  </GlowButton>
                )}
                <GlowButton onClick={copyLink} size="md">
                  <Copy className="h-4 w-4" />
                  {copied ? "Link copiado" : "Copiar link"}
                </GlowButton>
              </div>
            </div>
          </GlassCard>
        </section>
      ) : null}
    </div>
  );
}
