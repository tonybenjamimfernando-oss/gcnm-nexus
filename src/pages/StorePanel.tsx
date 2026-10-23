import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Copy, Layers, Package, Share2, Store as StoreIcon, Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import NeoTile from "@/components/ui/NeoTile";
import Spinner from "@/components/ui/Spinner";
import ServiceGrid from "@/components/stores/ServiceGrid";
import { joinAsAffiliate, listAffiliates, listMembers, listMyStores, setStoreService, storeServiceState } from "@/lib/stores";
import type { AffiliateView, MemberView, StoreView } from "@/lib/stores";
import { tierLabel } from "@/lib/storeServices";
import { useSession } from "@/lib/session";

export default function StorePanel() {
  const { user, ready } = useSession();
  const [stores, setStores] = useState<StoreView[]>([]);
  const [active, setActive] = useState<StoreView | null>(null);
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [affiliates, setAffiliates] = useState<AffiliateView[]>([]);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(
    function load() {
      if (!user) return;
      let alive = true;
      async function run() {
        setLoading(true);
        try {
          const rows = await listMyStores(user ? user.id : "");
          if (!alive) return;
          setStores(rows);
          const first = rows[0] || null;
          setActive(first);
          if (first) {
            const state = await storeServiceState(first.id, first.tier);
            const codes = await listAffiliates(first.id);
            const team = await listMembers(first.id);
            if (!alive) return;
            setServices(state);
            setAffiliates(codes);
            setMembers(team);
          }
          setError(null);
        } catch (problem) {
          if (!alive) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir o painel da loja.");
        } finally {
          if (alive) setLoading(false);
        }
      }
      run();
      return function stop() {
        alive = false;
      };
    },
    [user],
  );

  async function toggleService(key: string, next: boolean) {
    if (!active || busyKey) return;
    setBusyKey(key);
    setError(null);
    const previous = services;
    setServices(Object.assign({}, services, { [key]: next }));
    try {
      await setStoreService(active.id, key, next);
    } catch (problem) {
      setServices(previous);
      setError(problem instanceof Error ? problem.message : "Nao foi possivel guardar o servico.");
    } finally {
      setBusyKey(null);
    }
  }

  function copy(code: string) {
    const link = window.location.origin + "/loja/" + (active ? active.slug : "") + "?ref=" + code;
    navigator.clipboard.writeText(link);
    setCopied(code);
  }

  async function createCode() {
    if (!active || !user) return;
    setError(null);
    try {
      const code = await joinAsAffiliate(active.id, user.id);
      const rows = await listAffiliates(active.id);
      setAffiliates(rows);
      copy(code);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel gerar o codigo.");
    }
  }

  if (!ready) return null;
  if (!user) return <Navigate to="/entrar" replace />;
  if (loading) return <Spinner label="A abrir o painel da loja" />;

  if (stores.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Ainda nao tens loja"
          description={error || "Monta a tua loja em tres passos: identidade, servicos e publicacao."}
          action={
            <GlowButton to="/lojas/montar" size="sm">
              Montar a minha loja
            </GlowButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ember-400">Painel da loja</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">{active ? active.name : "A minha loja"}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-haze-300">
        Ajusta servicos, gera codigos de afiliado e abre a montra publica. Cada alteracao fica guardada na tua conta.
      </p>

      {stores.length > 1 ? (
        <div className="scroll-x mt-5 gap-2">
          {stores.map(function render(store) {
            return (
              <button
                key={store.id}
                type="button"
                onClick={function pick() {
                  setActive(store);
                }}
                className="shrink-0 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-haze-300 transition hover:text-white"
              >
                {store.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NeoTile tone="ember" icon={<StoreIcon className="h-4 w-4" />} label="Estado" value={active ? (active.status === "active" ? "Publica" : "Rascunho") : "-"} hint={active ? "/loja/" + active.slug : ""} />
        <NeoTile tone="glow" icon={<Layers className="h-4 w-4" />} label="Nivel" value={tierLabel(active ? active.tier : "starter")} hint="ajustavel a qualquer momento" />
        <NeoTile tone="lime" icon={<Package className="h-4 w-4" />} label="Ofertas" value={String(active ? active.listings : 0)} hint="ligadas a esta montra" />
        <NeoTile tone="coral" icon={<Users className="h-4 w-4" />} label="Equipa" value={String(members.length + 1)} hint="contigo como proprietario" />
      </div>

      {error ? <p className="mt-4 text-sm text-coral-400">{error}</p> : null}

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-white">Servicos da loja</h2>
          {active ? (
            <div className="flex flex-wrap gap-2">
              <GlowButton to={"/loja/" + active.slug} variant="glass" size="sm">
                Ver montra
              </GlowButton>
              <GlowButton to="/publicar" size="sm">
                Adicionar oferta
              </GlowButton>
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <ServiceGrid
            state={services}
            tier={active ? active.tier : "starter"}
            editable
            busyKey={busyKey}
            onToggle={toggleService}
          />
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard tone="deep" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
              <Share2 className="h-4 w-4 text-glow-400" />
              Codigos de afiliado
            </h2>
            <GlowButton onClick={createCode} variant="glass" size="sm">
              Gerar o meu codigo
            </GlowButton>
          </div>
          <p className="mt-2 text-xs leading-5 text-haze-500">
            Cada afiliado partilha o proprio link. A comissao aplicada e a que esta definida na loja.
          </p>
          <div className="mt-4 grid gap-2">
            {affiliates.length === 0 ? (
              <p className="text-sm text-haze-300">Ainda sem afiliados nesta loja.</p>
            ) : (
              affiliates.map(function render(item) {
                return (
                  <div key={item.id} className="neo flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.code}</p>
                      <p className="text-[11px] text-haze-500">comissao {item.commission}%</p>
                    </div>
                    <button
                      type="button"
                      onClick={function pick() {
                        copy(item.code);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-haze-300 transition hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied === item.code ? "Copiado" : "Copiar link"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        <GlassCard tone="deep" className="p-6">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
            <Users className="h-4 w-4 text-mint-400" />
            Equipa
          </h2>
          <p className="mt-2 text-xs leading-5 text-haze-500">
            {members.length === 0
              ? "A equipa comeca contigo. Os gestores e agentes entram pelo convite da plataforma."
              : members.length + " membros com acesso a loja."}
          </p>
          <div className="mt-4 grid gap-2">
            {user ? (
              <div className="neo flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                <span className="truncate text-sm font-semibold text-white">{user.email}</span>
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-mint-400">proprietario</span>
              </div>
            ) : null}
            {members.map(function render(item) {
              return (
                <div key={item.id} className="flex items-center justify-between rounded-2xl px-4 py-2 text-xs text-haze-300">
                  <span>{item.userId.slice(0, 8)}...</span>
                  <span className="font-semibold uppercase tracking-[0.16em] text-haze-500">{item.role}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <Link to="/lojas" className="text-xs font-semibold text-glow-400 transition hover:text-white">
              Ver a incubadora inteira
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
