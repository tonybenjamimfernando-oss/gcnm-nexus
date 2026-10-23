import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BadgeCheck, Flag, Megaphone, ShieldAlert, XCircle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { currentRole, listPendingListings, listReviewReports, moderateListing, moderateReport } from "@/lib/admin";
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
