import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Activity, BadgeCheck, BarChart3, CircleDollarSign, Flag, Globe2, Gauge, Megaphone, ShieldAlert, ShoppingBag, Sparkles, TrendingUp, Users, Wallet, XCircle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { currentRole, listPendingListings, listReviewReports, moderateListing, moderateReport, featureListing } from "@/lib/admin";
import type { ReportView } from "@/lib/admin";
import type { ListingRow } from "@/lib/demo";
import { useSession } from "@/lib/session";
import { formatDate, listingKindLabel } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";

type Tab = "anuncios" | "denuncias";

export default function Admin() {
  const { user, ready } = useSession();
  const [access, setAccess] = useState<"loading" | "granted" | "denied">("loading");
  const [tab, setTab] = useState<Tab>("anuncios");
  const [pendings, setPendings] = useState<ListingRow[]>([]);
  const [reports, setReports] = useState<ReportView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(
    function load() {
      if (!user) return;
      const userId = user.id;
      let active = true;
      async function run() {
        try {
          const role = await currentRole(userId);
          if (!active) return;
          if (role === "admin" || role === "moderator") {
            const lists = await Promise.all([listPendingListings(), listReviewReports()]);
            if (!active) return;
            setPendings(lists[0]);
            setReports(lists[1]);
            setAccess("granted");
          } else {
            setAccess("denied");
          }
        } catch (problem) {
          if (!active) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir a administracao.");
          setAccess("denied");
        }
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [user],
  );

  async function decideListing(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      await moderateListing(id, status);
      setPendings(function next(current) {
        return current.filter(function keep(item) {
          return item.id !== id;
        });
      });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel atualizar o anuncio.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReport(report: ReportView, removeReview: boolean) {
    setBusyId(report.id);
    setError(null);
    try {
      await moderateReport(report.id, report.reviewId, removeReview);
      setReports(function next(current) {
        return current.filter(function keep(item) {
          return item.id !== report.id;
        });
      });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel processar a denuncia.");
    } finally {
      setBusyId(null);
    }
  }

  if (!ready) return <Spinner label="A verificar sessao" />;
  if (!user) return <Navigate to="/entrar?next=/admin" replace />;

  if (access !== "granted") {
    return (
      <div className="mx-auto max-w-3xl">
        <Spinner label={access === "loading" ? "A verificar permissoes" : undefined} />
        {access === "denied" ? (
          <EmptyState
            title="Sem acesso"
            description="Esta area fica disponivel a contas com papel de administracao ou moderacao na tabela de papeis."
            action={
              <GlowButton to="/" size="sm">
                Voltar ao inicio
              </GlowButton>
            }
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Administracao</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
        Moderacao do mercado
      </h1>

      {!supabase ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          Modo demonstracao: a moderacao real requer a ligacao ao Supabase.
        </p>
      ) : null}
      <section className="mt-7 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-emerald-300">Centro de controlo · FLOWEBUY</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">Visão geral do ecossistema</h2><p className="mt-1 text-sm text-slate-400">Desempenho, atividade comercial e segurança num só lugar.</p></div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[11px] font-semibold text-emerald-200">● Painel operacional</span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <GlassCard className="p-4 sm:p-5"><div className="flex justify-between gap-2"><span className="text-xs text-slate-400">Ofertas no mercado</span><ShoppingBag className="h-4 w-4 text-emerald-300"/></div><p className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">1.284</p><p className="mt-2 text-[11px] text-emerald-300">↗ 12,8% <span className="text-slate-500">vs. período anterior</span></p><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-emerald-300"/></div></GlassCard>
          <GlassCard className="p-4 sm:p-5"><div className="flex justify-between gap-2"><span className="text-xs text-slate-400">Membros registados</span><Users className="h-4 w-4 text-sky-300"/></div><p className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">8.642</p><p className="mt-2 text-[11px] text-emerald-300">↗ 8,4% <span className="text-slate-500">vs. período anterior</span></p><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-sky-300"/></div></GlassCard>
          <GlassCard className="p-4 sm:p-5"><div className="flex justify-between gap-2"><span className="text-xs text-slate-400">Volume comercial</span><CircleDollarSign className="h-4 w-4 text-amber-300"/></div><p className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">4,82 M</p><p className="mt-2 text-[11px] text-emerald-300">↗ 16,2% <span className="text-slate-500">vs. período anterior</span></p><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[86%] rounded-full bg-amber-300"/></div></GlassCard>
          <GlassCard className="p-4 sm:p-5"><div className="flex justify-between gap-2"><span className="text-xs text-slate-400">Disponibilidade</span><Activity className="h-4 w-4 text-violet-300"/></div><p className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">99,96%</p><p className="mt-2 text-[11px] text-emerald-300">Estável <span className="text-slate-500">indicador demonstrativo</span></p><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[96%] rounded-full bg-violet-300"/></div></GlassCard>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <GlassCard className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm font-bold text-white"><BarChart3 className="h-4 w-4 text-emerald-300"/> Atividade da plataforma</div><p className="mt-1 text-xs text-slate-400">Tendência ilustrativa · últimos 7 dias</p><div className="mt-4 grid grid-cols-3 gap-3"><div><p className="text-[10px] text-slate-400">Visitas</p><p className="text-lg font-bold text-white">24,8 mil</p></div><div><p className="text-[10px] text-slate-400">Interações</p><p className="text-lg font-bold text-white">6.392</p></div><div><p className="text-[10px] text-slate-400">Conversão</p><p className="text-lg font-bold text-emerald-300">4,7%</p></div></div>
          <svg viewBox="0 0 640 160" preserveAspectRatio="none" className="mt-5 h-40 w-full" role="img" aria-label="Gráfico ilustrativo de atividade"><defs><linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity=".3"/><stop offset="100%" stopColor="#34d399" stopOpacity="0"/></linearGradient></defs>{[25,60,95,130].map(y=><line key={y} x1="0" y1={y} x2="640" y2={y} stroke="rgba(148,163,184,.14)" strokeDasharray="4 5"/>)}<path d="M0 120 C35 110 42 82 80 94 S130 120 165 77 S215 91 250 66 S300 80 330 52 S380 72 410 44 S465 63 495 32 S555 49 580 23 S615 30 640 12 L640 150 L0 150Z" fill="url(#adminArea)"/><path d="M0 120 C35 110 42 82 80 94 S130 120 165 77 S215 91 250 66 S300 80 330 52 S380 72 410 44 S465 63 495 32 S555 49 580 23 S615 30 640 12" fill="none" stroke="#5eead4" strokeWidth="3" strokeLinecap="round"/><path d="M0 137 C40 128 55 120 85 125 S140 105 170 116 S220 97 255 108 S300 88 340 96 S390 83 420 90 S470 67 500 76 S560 61 590 58 S620 45 640 49" fill="none" stroke="#60a5fa" strokeWidth="2"/></svg><div className="flex justify-between text-[10px] text-slate-500"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div className="mt-4 flex gap-4 text-[10px] text-slate-400"><span className="text-emerald-300">● Visitas</span><span className="text-sky-300">● Interações</span></div></GlassCard>
          <GlassCard className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm font-bold text-white"><Gauge className="h-4 w-4 text-sky-300"/> Saúde operacional</div><p className="mt-1 text-xs text-slate-400">Indicadores do painel</p><div className="mt-5 space-y-5">{[{name:"Disponibilidade (exemplo)",value:"99,96%",width:"99%",color:"bg-emerald-300"},{name:"Tempo de resposta (exemplo)",value:"184 ms",width:"82%",color:"bg-sky-300"},{name:"Fila de moderação",value:pendings.length+" itens",width:Math.min(100,pendings.length*12)+"%",color:"bg-amber-300"},{name:"Denúncias por analisar",value:String(reports.length),width:Math.min(100,reports.length*15)+"%",color:"bg-orange-300"}].map(item=><div key={item.name}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="text-slate-400">{item.name}</span><strong className="text-white">{item.value}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={"h-full rounded-full "+item.color} style={{width:item.width}}/></div></div>)}</div><div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-3 text-[11px] leading-5 text-amber-100/80">Métricas técnicas e comerciais demonstrativas até ligar as fontes reais.</div></GlassCard>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <GlassCard className="p-4 sm:p-5 lg:col-span-2"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-white"><Globe2 className="h-4 w-4 text-emerald-300"/> Distribuição regional</div><TrendingUp className="h-5 w-5 text-emerald-300"/></div><p className="mt-1 text-xs text-slate-400">Exemplo visual para futura ligação a dados analíticos</p><div className="mt-5 space-y-4">{[{name:"África Austral",value:38,color:"bg-emerald-300"},{name:"África Oriental",value:24,color:"bg-sky-300"},{name:"Europa",value:19,color:"bg-violet-300"},{name:"Ásia",value:12,color:"bg-amber-300"},{name:"Outras regiões",value:7,color:"bg-slate-400"}].map(region=><div key={region.name}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-300">{region.name}</span><span className="font-semibold text-white">{region.value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className={"h-full rounded-full "+region.color} style={{width:region.value+"%"}}/></div></div>)}</div></GlassCard>
          <GlassCard className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm font-bold text-white"><Wallet className="h-4 w-4 text-amber-300"/> Atalhos administrativos</div><div className="mt-4 grid gap-2"><button type="button" onClick={()=>setTab("anuncios")} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:border-emerald-300/30"><Megaphone className="h-4 w-4 text-emerald-300"/><span className="flex-1 text-xs font-semibold text-white">Rever anúncios</span><span className="text-xs text-slate-300">{pendings.length}</span></button><button type="button" onClick={()=>setTab("denuncias")} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:border-amber-300/30"><Flag className="h-4 w-4 text-amber-300"/><span className="flex-1 text-xs font-semibold text-white">Centro de denúncias</span><span className="text-xs text-slate-300">{reports.length}</span></button><a href="https://github.com/tonybenjamimfernando-oss/gcnm-nexus/actions" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 hover:border-sky-300/30"><Activity className="h-4 w-4 text-sky-300"/><span className="text-xs font-semibold text-white">Estado da publicação</span></a></div></GlassCard>
        </div>
        <p className="rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-4 py-3 text-[11px] leading-5 text-sky-100/70">Transparência: visitas, volume comercial, regiões e disponibilidade são dados demonstrativos de interface, não estatísticas reais. As filas de anúncios e denúncias usam os dados carregados pelo sistema de moderação.</p>
      </section>
      {error ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          {error}
        </p>
      ) : null}

      <div className="mt-6 inline-flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={function pick() {
            setTab("anuncios");
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
            tab === "anuncios" ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
          )}
        >
          <Megaphone className="h-3.5 w-3.5" />
          Anuncios em revisao ({pendings.length})
        </button>
        <button
          type="button"
          onClick={function pick() {
            setTab("denuncias");
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
            tab === "denuncias" ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
          )}
        >
          <Flag className="h-3.5 w-3.5" />
          Denuncias de avaliacoes ({reports.length})
        </button>
      </div>

      {tab === "anuncios" ? (
        <section className="mt-6 grid gap-3">
          {pendings.length === 0 ? (
            <EmptyState
              title="Fila vazia"
              description="Nenhum anuncio espera revisao. Novos envios aparecem aqui."
            />
          ) : null}
          {pendings.map(function render(item) {
            return (
              <GlassCard key={item.id} className="flex flex-wrap items-center gap-4 p-4">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} className="h-14 w-20 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-14 w-20 place-items-center rounded-xl border border-white/10 bg-white/5 text-haze-500">
                    <Megaphone className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-haze-500">
                    {listingKindLabel(item.kind)} - {item.category} - enviado em {formatDate(item.created_at)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-haze-300">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <GlowButton onClick={function approve() {
                    decideListing(item.id, "active");
                  }} disabled={busyId === item.id} size="sm">
                    <BadgeCheck className="h-4 w-4" />
                    Aprovar
                  </GlowButton>
                  <GlowButton onClick={function approveAndFeature() {
                    setBusyId(item.id);
                    setError(null);
                    featureListing(item.id, 7)
                      .then(function approve() {
                        return moderateListing(item.id, "active");
                      })
                      .then(function drop() {
                        setPendings(function next(current) {
                          return current.filter(function keep(entry) {
                            return entry.id !== item.id;
                          });
                        });
                      })
                      .catch(function failed(problem: unknown) {
                        setError(problem instanceof Error ? problem.message : "Nao foi possivel destacar o anuncio.");
                      })
                      .finally(function done() {
                        setBusyId(null);
                      });
                  }} disabled={busyId === item.id} variant="glass" size="sm">
                    <Sparkles className="h-4 w-4" />
                    Aprovar e destacar
                  </GlowButton>
                  <GlowButton onClick={function reject() {
                    decideListing(item.id, "archived");
                  }} disabled={busyId === item.id} variant="ghost" size="sm">
                    <XCircle className="h-4 w-4" />
                    Recusar
                  </GlowButton>
                </div>
              </GlassCard>
            );
          })}
        </section>
      ) : (
        <section className="mt-6 grid gap-3">
          {reports.length === 0 ? (
            <EmptyState
              title="Sem denuncias"
              description="Nenhuma avaliacao foi denunciada. Denuncias de utilizadores aparecem aqui."
            />
          ) : null}
          {reports.map(function render(report) {
            return (
              <GlassCard key={report.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-white">Denuncia: {report.reason}</p>
                    <p className="mt-1 text-xs text-haze-500">Recebida em {formatDate(report.createdAt)}</p>
                    {report.reviewComment ? (
                      <p className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-haze-300">
                        {report.reviewRating !== null ? "Nota " + report.reviewRating + " - " : ""}
                        {report.reviewComment}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-haze-500">A avaliacao original ja nao esta disponivel.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {report.reviewComment ? (
                      <GlowButton onClick={function remove() {
                        handleReport(report, true);
                      }} disabled={busyId === report.id} variant="ghost" size="sm">
                        <XCircle className="h-4 w-4" />
                        Remover avaliacao
                      </GlowButton>
                    ) : null}
                    <GlowButton onClick={function keep() {
                      handleReport(report, false);
                    }} disabled={busyId === report.id} variant="glass" size="sm">
                      Manter e arquivar
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </section>
      )}
    </div>
  );
}
