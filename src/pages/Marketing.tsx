import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import ActionQueue from "@/components/marketing/ActionQueue";
import CadenceWeek from "@/components/marketing/CadenceWeek";
import CampaignBuilder from "@/components/marketing/CampaignBuilder";
import ChannelTraffic from "@/components/marketing/ChannelTraffic";
import EarningsPanel from "@/components/marketing/EarningsPanel";
import MarketingScore from "@/components/marketing/MarketingScore";
import EmptyState from "@/components/ui/EmptyState";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { daysSince, marketingPlan, storeBrief } from "@/lib/marketing";
import type { MarketingInput, StoreBrief } from "@/lib/marketing";
import { listCampaigns, listCommissions, visitTotals } from "@/lib/marketingData";
import type { CampaignView, CommissionView, VisitTotals } from "@/lib/marketingData";
import { listAffiliates, listMyStores, storeServiceState } from "@/lib/stores";
import type { AffiliateView, StoreView } from "@/lib/stores";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

export default function Marketing() {
  const { user } = useSession();
  const [stores, setStores] = useState<StoreView[]>([]);
  const [active, setActive] = useState<StoreView | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignView[]>([]);
  const [visits, setVisits] = useState<VisitTotals>({ total: 0, byChannel: {} });
  const [affiliates, setAffiliates] = useState<AffiliateView[]>([]);
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [gains, setGains] = useState<CommissionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(
    function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      let alive = true;
      async function run() {
        setLoading(true);
        try {
          const mine = await listMyStores(user.id);
          if (!alive) return;
          setStores(mine);
          const first = mine.length > 0 ? mine[0] : null;
          setActive(first);
          const rows = await Promise.all([
            first ? listCampaigns(first.id) : Promise.resolve([] as CampaignView[]),
            first ? visitTotals(first.id) : Promise.resolve({ total: 0, byChannel: {} } as VisitTotals),
            first ? listAffiliates(first.id) : Promise.resolve([] as AffiliateView[]),
            first ? storeServiceState(first.id, first.tier) : Promise.resolve({} as Record<string, boolean>),
            listCommissions(user.id),
          ]);
          if (!alive) return;
          setCampaigns(rows[0]);
          setVisits(rows[1]);
          setAffiliates(rows[2]);
          setServices(rows[3]);
          setGains(rows[4]);
          setError(null);
        } catch (problem) {
          if (!alive) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir o marketing.");
        } finally {
          if (alive) setLoading(false);
        }
      }
      run();
      return function stop() {
        alive = false;
      };
    },
    [user, reload],
  );

  const brief: StoreBrief | null = active
    ? storeBrief({
        id: active.id,
        ownerId: active.ownerId,
        name: active.name,
        slug: active.slug,
        city: active.city,
        category: active.category,
        tagline: active.tagline,
        tier: active.tier,
        url: window.location.origin + "/loja/" + active.slug,
      })
    : null;

  const input: MarketingInput | null =
    active && brief
      ? {
          store: brief,
          listings: active.listings,
          affiliates: affiliates.length,
          services: Object.keys(services).filter(function on(key) { return services[key]; }),
          campaigns: campaigns.length,
          liveCampaigns: campaigns.filter(function live(item) { return item.status === "live"; }).length,
          visits: visits.total,
          channelsUsed: Object.keys(visits.byChannel),
          daysSinceLaunch: daysSince(active.createdAt),
          hasContacts: Boolean(active.contactEmail || active.contactPhone),
          hasDescription: Boolean(active.description),
        }
      : null;

  const tasks = useMemo(
    function plan() {
      return input ? marketingPlan(input) : [];
    },
    [input],
  );

  if (!user) return <Navigate to="/entrar?next=/marketing" replace />;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ember-400">Marketing</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">Centro de marketing da loja</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-haze-300">
        A fila de acoes, o texto de cada canal e a cadencia da semana saem do estado real da loja: o sistema diz o que fazer
        hoje, nao espera que perguntes.
      </p>

      <div className="mt-8">
        {loading ? (
          <Spinner label="A preparar o marketing" />
        ) : error ? (
          <EmptyState
            title="Nao foi possivel abrir o marketing"
            description={error}
            action={
              <GlowButton onClick={function retry() { setReload(reload + 1); }} size="sm">
                Tentar de novo
              </GlowButton>
            }
          />
        ) : !active || !brief || !input ? (
          <EmptyState
            title="Ainda nao tens loja"
            description="O marketing trabalha sobre a tua loja: monta-a em tres passos e esta pagina enche-se sozinha."
            action={
              <GlowButton to="/lojas/montar" size="sm">
                Montar a minha loja
              </GlowButton>
            }
          />
        ) : (
          <div className="grid gap-6">
            {stores.length > 1 ? (
              <div className="scroll-x gap-2 pb-1">
                {stores.map(function render(item) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={function pick() { setActive(item); }}
                      className={cn(
                        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                        active.id === item.id ? "border-glow-400/60 bg-white/10 text-white" : "border-white/10 text-haze-300 hover:text-white",
                      )}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <MarketingScore input={input} tasks={tasks.length} />
            <ActionQueue tasks={tasks} />
            <CampaignBuilder
              store={brief}
              codes={affiliates.map(function code(item) { return item.code; })}
              onSaved={function saved() { setReload(reload + 1); }}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <ChannelTraffic totals={visits} />
              <CadenceWeek />
            </div>
            <EarningsPanel rows={gains} />
          </div>
        )}
      </div>
    </div>
  );
}
