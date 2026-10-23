import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Bookmark, LogOut, Megaphone, ShieldCheck, Store, UserRound, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { getProfile, listMyListings } from "@/lib/api";
import type { ListingView } from "@/lib/api";
import type { ProfileRow } from "@/lib/demo";
import { useCurrency } from "@/lib/currency";
import { useFavorites } from "@/lib/favorites";
import { useSession } from "@/lib/session";
import { accountTypeLabel, formatMonthYear, listingKindLabel, statusLabel } from "@/lib/format";

export default function Panel() {
  const { user, ready, signOut, configured } = useSession();
  const favorites = useFavorites();
  const { money } = useCurrency();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [mine, setMine] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    function load() {
      if (!user) return;
      let active = true;
      async function run() {
        const result = await Promise.all([getProfile(user ? user.id : ""), listMyListings(user ? user.id : "")]);
        if (!active) return;
        setProfile(result[0]);
        setMine(result[1]);
        setLoading(false);
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [user],
  );

  if (!ready) return <Spinner label="A verificar sessao" />;
  if (!user) return <Navigate to="/entrar?next=/painel" replace />;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Painel</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {profile ? profile.company_name || profile.display_name : user.email || "A minha conta"}
          </h1>
          <p className="mt-2 text-sm text-haze-300">{user.email}</p>
        </div>
        <GlowButton
          onClick={function out() {
            signOut();
          }}
          variant="glass"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </GlowButton>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <GlassCard className="p-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-haze-500">
            <UserRound className="h-4 w-4 text-glow-400" />
            Perfil
          </span>
          <p className="mt-3 font-display text-lg font-extrabold text-white">
            {profile ? accountTypeLabel(profile.account_type) : "Membro"}
          </p>
          <p className="mt-1 text-xs text-haze-500">
            {profile && profile.city ? profile.city + (profile.country ? ", " + profile.country : "") : "Sem local indicado"}
          </p>
          {profile ? (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-haze-300">
              {profile.is_verified ? <ShieldCheck className="h-4 w-4 text-mint-400" /> : null}
              {profile.is_verified ? "Vendedor verificado" : "Verificacao pendente"}
            </p>
          ) : null}
          {profile ? (
            <p className="mt-1 text-[11px] text-haze-500">Membro desde {formatMonthYear(profile.created_at)}</p>
          ) : null}
        </GlassCard>

        <GlassCard className="p-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-haze-500">
            <Megaphone className="h-4 w-4 text-glow-400" />
            Anuncios
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold text-white">{loading ? "-" : mine.length}</p>
          <p className="mt-1 text-xs text-haze-500">publicados com o seu perfil</p>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-haze-500">
            <Bookmark className="h-4 w-4 text-glow-400" />
            Guardados
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold text-white">{favorites.count}</p>
          <p className="mt-1 text-xs text-haze-500">ofertas guardadas neste dispositivo</p>
        </GlassCard>
      </div>

      <GlassCard tone="strong" className="mt-6 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Store className="h-4 w-4 text-glow-400" />
          <p className="text-sm text-haze-300">
            Publicar anuncios, mensagens e propostas entram na proxima fase. Nesta base ja pode explorar, comparar,
            guardar e acompanhar o mercado.
          </p>
          <GlowButton to="/planos" variant="glass" size="sm" className="ml-auto">
            Ver planos
          </GlowButton>
        </div>
      </GlassCard>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Ofertas guardadas</h2>
        {favorites.items.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Ainda sem ofertas guardadas"
              description="Use o marcador nos cartoes para guardar as ofertas que quer comparar mais tarde."
              action={
                <GlowButton to="/explorar" size="sm">
                  Explorar ofertas
                </GlowButton>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {favorites.items.map(function render(entry) {
              return (
                <GlassCard key={entry.id} className="flex flex-wrap items-center gap-4 p-4">
                  <img src={entry.cover} alt={entry.title} className="h-14 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={"/anuncio/" + entry.id}
                      className="block truncate font-display text-sm font-bold text-white hover:text-glow-400"
                    >
                      {entry.title}
                    </Link>
                    <p className="mt-1 text-xs text-haze-500">
                      {listingKindLabel(entry.kind)} - {entry.city || "Sem local"}
                    </p>
                  </div>
                  <span className="font-display text-sm font-extrabold text-white">{money(entry.price, entry.currency)}</span>
                  <button
                    type="button"
                    onClick={function remove() {
                      favorites.remove(entry.id);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-haze-300 transition hover:border-glow-400/50 hover:text-white"
                    aria-label="Remover dos guardados"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Os meus anuncios</h2>
        {loading ? <Spinner /> : null}
        {!loading && mine.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Ainda sem anuncios publicados"
              description="A publicacao de anuncios entra na proxima fase. Entretanto, explore as salas e guarde ofertas."
              action={
                <GlowButton to="/explorar" size="sm">
                  Explorar ofertas
                </GlowButton>
              }
            />
          </div>
        ) : null}
        {!loading && mine.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {mine.map(function render(item) {
              return (
                <GlassCard key={item.id} className="flex flex-wrap items-center gap-4 p-4">
                  <img src={item.cover} alt={item.title} className="h-14 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={"/anuncio/" + item.id}
                      className="block truncate font-display text-sm font-bold text-white hover:text-glow-400"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-haze-500">
                      {statusLabel(item.status)} - {item.city || "Sem local"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-haze-300">
                    {item.views} vistas
                  </span>
                </GlassCard>
              );
            })}
          </div>
        ) : null}
      </section>

      {!configured ? (
        <p className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-400">
          Este ambiente esta em modo demonstracao: a ligacao ao Supabase nao esta configurada.
        </p>
      ) : null}
    </div>
  );
}
