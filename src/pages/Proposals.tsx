import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BadgeCheck, Send, Truck } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { getListing } from "@/lib/api";
import type { ListingView } from "@/lib/api";
import { createProposal, listProposals, myProposals, proposalStatusLabel, setProposalStatus } from "@/lib/messaging";
import type { ProposalView } from "@/lib/messaging";
import { CURRENCIES, PRIORITY_CURRENCIES } from "@/lib/currencies";
import { useCurrency } from "@/lib/currency";
import { useSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { supabase } from "@/lib/supabase";

const CURRENCY_OPTIONS = Array.from(new Set(PRIORITY_CURRENCIES.concat(CURRENCIES)));

const INPUT =
  "mt-1.5 h-12 w-full rounded-2xl border border-white/10 bg-ink-900/50 px-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60";

export default function Proposals() {
  const params = useParams();
  const id = params.id || "";
  const { user, ready } = useSession();
  const { money } = useCurrency();
  const [item, setItem] = useState<ListingView | null>(null);
  const [list, setList] = useState<ProposalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [delivery, setDelivery] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(
    function load() {
      let active = true;
      async function run() {
        try {
          const found = await getListing(id);
          if (!active) return;
          setItem(found);
          if (!found) {
            setLoading(false);
            return;
          }
          const rows =
            user && found.ownerId === user.id ? await listProposals(found.id) : user ? (await myProposals(user.id)).filter(function match(row) {
              return row.requestId === found.id;
            }) : [];
          if (!active) return;
          setList(rows);
        } catch (problem) {
          if (!active) return;
          setError(problem instanceof Error ? problem.message : "Nao foi possivel carregar as propostas.");
        } finally {
          if (active) setLoading(false);
        }
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [id, user],
  );

  const isOwner = Boolean(user && item && user.id === item.ownerId);

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (message.trim().length < 10) {
      setError("Escreva uma proposta com pelo menos 10 caracteres.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createProposal({
        requestId: id,
        supplierId: user ? user.id : "",
        price: price.trim().length === 0 ? null : Number(price.trim().replace(",", ".")),
        currency: currency,
        deliveryDays: delivery.trim().length === 0 ? null : Number(delivery.trim()),
        message: message.trim(),
      });
      setMessage("");
      setPrice("");
      setDelivery("");
      setNote("Proposta enviada. O comprador recebe-a na lista de propostas.");
      if (user) {
        const rows = (await myProposals(user.id)).filter(function match(row) {
          return row.requestId === id;
        });
        setList(rows);
      }
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel enviar a proposta.");
    } finally {
      setSubmitting(false);
    }
  }

  async function decide(proposalId: string, status: string) {
    setError(null);
    try {
      await setProposalStatus(proposalId, status);
      const rows = await listProposals(id);
      setList(rows);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel atualizar a proposta.");
    }
  }

  if (!ready) return <Spinner label="A verificar sessao" />;
  if (!user) return <Navigate to={"/entrar?next=/anuncio/" + id + "/propostas"} replace />;
  if (loading) return <Spinner label="A carregar propostas" />;

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Pedido nao encontrado"
          description="Este pedido pode ter sido removido ou o endereco esta incompleto."
          action={
            <GlowButton to="/explorar" size="sm">
              Voltar a explorar
            </GlowButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to={"/anuncio/" + item.id} className="text-xs font-bold text-haze-300 transition hover:text-white">
        Voltar ao pedido
      </Link>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Propostas</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">{item.title}</h1>
      <p className="mt-2 text-sm text-haze-300">
        {isOwner
          ? "Compare as propostas recebidas e aceite a melhor combinacao de preco e prazo."
          : "Envie a sua proposta ao comprador com preco, prazo e condicoes."}
      </p>

      {!supabase ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          Modo demonstracao: as propostas reais requerem a ligacao ao Supabase.
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          {error}
        </p>
      ) : null}
      {note ? (
        <p className="mt-5 rounded-2xl border border-mint-400/30 bg-mint-400/10 px-4 py-3 text-xs leading-5 text-mint-400">
          {note}
        </p>
      ) : null}

      {!isOwner ? (
        <GlassCard tone="strong" className="mt-6 p-5 md:p-6">
          <h2 className="font-display text-lg font-bold text-white">Nova proposta</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">Preco (vazio = sob consulta)</span>
              <input
                value={price}
                onChange={function change(event) {
                  setPrice(event.target.value);
                }}
                inputMode="decimal"
                placeholder="Ex: 980"
                className={INPUT}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">Moeda</span>
              <select
                value={currency}
                onChange={function change(event) {
                  setCurrency(event.target.value);
                }}
                className={INPUT}
              >
                {CURRENCY_OPTIONS.map(function render(code) {
                  return (
                    <option key={code} value={code} className="bg-ink-900">
                      {code}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">Entrega (dias)</span>
              <input
                value={delivery}
                onChange={function change(event) {
                  setDelivery(event.target.value);
                }}
                inputMode="numeric"
                placeholder="Ex: 7"
                className={INPUT}
              />
            </label>
            <label className="block md:col-span-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">Mensagem</span>
              <textarea
                value={message}
                onChange={function change(event) {
                  setMessage(event.target.value);
                }}
                rows={3}
                placeholder="Condicoes, garantia, forma de entrega e pagamento."
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-ink-900/50 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
              />
            </label>
            <div className="md:col-span-3">
              <GlowButton type="submit" disabled={submitting} size="md">
                <Send className="h-4 w-4" />
                Enviar proposta
              </GlowButton>
            </div>
          </form>
        </GlassCard>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-white">
          {isOwner ? "Propostas recebidas" : "As suas propostas neste pedido"}
        </h2>
        {list.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={isOwner ? "Ainda sem propostas" : "Ainda nao enviou proposta"}
              description={
                isOwner
                  ? "Quando fornecedores responderem ao pedido, as propostas aparecem aqui para comparacao."
                  : "Preencha o formulario acima para responder a este pedido de compra."
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {list.map(function render(proposal) {
              return (
                <GlassCard key={proposal.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 font-display text-xs font-extrabold text-glow-400">
                      {proposal.supplierName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-sm font-bold text-white">{proposal.supplierName}</p>
                        {proposal.supplierVerified ? <BadgeCheck className="h-4 w-4 shrink-0 text-mint-400" /> : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-haze-500">{formatDate(proposal.createdAt)}</p>
                    </div>
                    <span className="font-display text-sm font-extrabold text-white">
                      {proposal.price === null ? "Sob consulta" : money(proposal.price, proposal.currency)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-haze-300">
                      <Truck className="h-3.5 w-3.5 text-glow-400" />
                      {proposal.deliveryDays === null ? "Prazo a combinar" : proposal.deliveryDays + " dias"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-haze-300">
                      {proposalStatusLabel(proposal.status)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-haze-300">{proposal.message}</p>
                  {isOwner && proposal.status === "sent" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <GlowButton onClick={function accept() {
                        decide(proposal.id, "accepted");
                      }} size="sm">
                        Aceitar proposta
                      </GlowButton>
                      <GlowButton onClick={function reject() {
                        decide(proposal.id, "rejected");
                      }} variant="ghost" size="sm">
                        Recusar
                      </GlowButton>
                    </div>
                  ) : null}
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
