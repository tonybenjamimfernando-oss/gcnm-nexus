import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import SectionHeading from "@/components/ui/SectionHeading";
import Spinner from "@/components/ui/Spinner";
import ListingCard from "@/components/listings/ListingCard";
import RoomModules from "@/components/rooms/RoomModules";
import { listListings } from "@/lib/api";
import type { ListingView } from "@/lib/api";
import { useCurrency } from "@/lib/currency";
import { formatMoney, formatNumber, listingKindLabel } from "@/lib/format";
import { findRoom } from "@/lib/rooms";

const TRUST_POINTS = [
  "Vendedores com documentacao validada e selo visivel no anuncio.",
  "Avaliacoes publicas de compradores, com denuncia de abuso em um clique.",
  "Contactos e dados fiscais guardados em area privada, nunca expostos no catalogo.",
  "Ofertas de origem externa identificadas como tal, com a fonte declarada.",
];

export default function RoomDetail() {
  const params = useParams();
  const slug = params.slug || "";
  const room = findRoom(slug);
  const { currency, convertFrom } = useCurrency();
  const [items, setItems] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    function load() {
      let active = true;
      setLoading(true);
      async function run() {
        const rows = await listListings({ room: slug, limit: 24 });
        if (!active) return;
        setItems(rows);
        setLoading(false);
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [slug],
  );

  if (!room) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Sala nao encontrada"
          description="Escolha uma das salas comerciais disponiveis."
          action={
            <GlowButton to="/salas" size="sm">
              Ver as salas
            </GlowButton>
          }
        />
      </div>
    );
  }

  const Icon = room.icon;
  const priced = items.filter(function withPrice(item) {
    return item.price !== null;
  });
  const prices = priced
    .map(function convert(item) {
      return convertFrom(item.price === null ? 0 : item.price, item.currency);
    })
    .sort(function asc(a, b) {
      return a - b;
    });
  const average =
    prices.length > 0
      ? prices.reduce(function sum(acc, value) {
          return acc + value;
        }, 0) / prices.length
      : null;
  const sellers = Array.from(
    new Set(
      items.map(function owner(item) {
        return item.ownerId;
      }),
    ),
  ).length;
  const cities = items.reduce<Record<string, number>>(function count(acc, item) {
    const key = item.city || "Sem local";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCities = Object.keys(cities)
    .sort(function desc(a, b) {
      return cities[b] - cities[a];
    })
    .slice(0, 4);
  const byKind = ["product", "service", "request", "opportunity"].map(function entry(kind) {
    return {
      kind,
      count: items.filter(function match(item) {
        return item.kind === kind;
      }).length,
    };
  });
  const logistics = items.filter(function related(item) {
    const text = (item.title + " " + item.category + " " + item.description).toLowerCase();
    return (
      text.indexOf("frete") !== -1 ||
      text.indexOf("transport") !== -1 ||
      text.indexOf("entrega") !== -1 ||
      text.indexOf("logistic") !== -1 ||
      text.indexOf("armazem") !== -1 ||
      text.indexOf("carga") !== -1
    );
  });

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to="/salas"
        className="inline-flex items-center gap-2 text-xs font-bold text-haze-300 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Todas as salas
      </Link>

      <GlassCard tone="strong" className="relative mt-5 overflow-hidden p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(420px 200px at 12% 0%, " + room.accent + "33, transparent 72%)" }}
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-ink-950/50"
            style={{ boxShadow: "0 0 40px -10px " + room.accent + "99" }}
          >
            <Icon className="h-8 w-8" style={{ color: room.accent }} />
          </span>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">{room.name}</h1>
            <p className="mt-2 text-sm text-haze-300">{room.tagline}</p>
            <p className="mt-1 text-xs text-haze-500">{room.audience}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:w-80">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <p className="font-display text-lg font-extrabold text-white">{items.length}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-haze-500">ofertas</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <p className="font-display text-lg font-extrabold text-white">{sellers}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-haze-500">vendedores</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <p className="font-display text-lg font-extrabold text-white">
                {average === null ? "-" : formatMoney(average, currency)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-haze-500">preco medio</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Modulos da sala"
          title="Dez funcionalidades prontas"
          description="Cada modulo abre exatamente o que promete: catalogo, pedidos, servicos, comparador, tendencias, logistica, pagamento e confianca."
        />
        <div className="mt-6">
          <RoomModules room={room} />
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Montra"
          title={"O que esta ativo em " + room.name}
          action={
            <GlowButton to={"/explorar?sala=" + room.slug} variant="glass" size="sm">
              Ver tudo na sala
            </GlowButton>
          }
        />
        {loading ? <Spinner label="A carregar a sala" /> : null}
        {!loading && items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Sala ainda sem ofertas"
              description="Seja o primeiro a acompanhar esta sala. A publicacao de anuncios entra na proxima fase."
              action={
                <GlowButton to="/planos" size="sm">
                  Ver planos de vendedor
                </GlowButton>
              }
            />
          </div>
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.slice(0, 8).map(function render(item) {
              return <ListingCard key={item.id} item={item} />;
            })}
          </div>
        ) : null}
      </section>

      <section id="tendencias" className="mt-16 scroll-mt-28">
        <SectionHeading
          eyebrow="Tendencias"
          title="Precos, procura e cidades"
          description="Calculado a partir das ofertas ativas nesta sala e apresentado na moeda escolhida."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <GlassCard className="p-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">
              <TrendingUp className="h-4 w-4 text-glow-400" />
              Faixa de preco
            </span>
            <p className="mt-3 font-display text-xl font-extrabold text-white">
              {prices.length > 0
                ? formatMoney(prices[0], currency) + " - " + formatMoney(prices[prices.length - 1], currency)
                : "Sem dados"}
            </p>
            <p className="mt-1 text-xs text-haze-500">{prices.length} ofertas com preco definido</p>
          </GlassCard>
          <GlassCard className="p-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">
              <MapPin className="h-4 w-4 text-glow-400" />
              Cidades com mais atividade
            </span>
            <div className="mt-3 grid gap-1.5">
              {topCities.length === 0 ? (
                <p className="text-sm text-haze-300">Sem dados ainda.</p>
              ) : (
                topCities.map(function render(city) {
                  return (
                    <p key={city} className="flex items-center justify-between text-sm text-haze-300">
                      <span>{city}</span>
                      <span className="font-bold text-white">{cities[city]}</span>
                    </p>
                  );
                })
              )}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">Composicao da sala</span>
            <div className="mt-3 grid gap-1.5">
              {byKind.map(function render(entry) {
                return (
                  <p key={entry.kind} className="flex items-center justify-between text-sm text-haze-300">
                    <span>{listingKindLabel(entry.kind)}</span>
                    <span className="font-bold text-white">{formatNumber(entry.count)}</span>
                  </p>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      <section id="logistica" className="mt-16 scroll-mt-28">
        <SectionHeading
          eyebrow="Logistica"
          title="Entrega, transporte e armazenagem"
          description="Servicos desta sala ligados a movimentacao de carga."
          action={
            <GlowButton to={"/explorar?sala=" + room.slug + "&tipo=service"} variant="glass" size="sm">
              Ver servicos
            </GlowButton>
          }
        />
        {!loading && logistics.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Sem servicos de logistica nesta sala"
              description="Assim que houver ofertas ligadas a transporte ou armazenagem, aparecem aqui."
              action={
                <GlowButton to="/explorar?tipo=service" size="sm">
                  Ver todos os servicos
                </GlowButton>
              }
            />
          </div>
        ) : null}
        {logistics.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {logistics.slice(0, 4).map(function render(item) {
              return <ListingCard key={item.id} item={item} />;
            })}
          </div>
        ) : null}
      </section>

      <section id="confianca" className="mt-16 scroll-mt-28">
        <SectionHeading
          eyebrow="Confianca"
          title="Como protegemos quem negocia"
          action={
            <GlowButton to="/planos" variant="glass" size="sm">
              <ShieldCheck className="h-4 w-4" />
              Ver planos
            </GlowButton>
          }
        />
        <GlassCard className="mt-6 p-6">
          <div className="grid gap-3 md:grid-cols-2">
            {TRUST_POINTS.map(function render(point) {
              return (
                <p key={point} className="flex items-start gap-3 text-sm leading-6 text-haze-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
                  {point}
                </p>
              );
            })}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
