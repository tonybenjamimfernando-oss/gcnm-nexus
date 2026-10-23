import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { listConversations, listMessages, sendMessage, markConversationRead } from "@/lib/messaging";
import type { ConversationView, MessageRow } from "@/lib/messaging";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

function timeLabel(value: string): string {
  try {
    return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

export default function Messages() {
  const params = useParams();
  const navigate = useNavigate();
  const activeId = params.id || "";
  const { user, ready, configured } = useSession();
  const [items, setItems] = useState<ConversationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<MessageRow[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);
  const active = items.filter(function match(item) {
    return item.id === activeId;
  })[0];

  useEffect(
    function load() {
      if (!user) return;
      const userId = user.id;
      let active = true;
      async function run() {
        const rows = await listConversations(userId);
        if (!active) return;
        setItems(rows);
        setLoading(false);
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [user],
  );

  const loadThread = useCallback(
    async function fetchThread() {
      if (activeId.length === 0) return;
      setThreadLoading(true);
      try {
        const rows = await listMessages(activeId);
        setThread(rows);
        if (user) await markConversationRead(activeId, user.id);
        setError(null);
      } catch (problem) {
        setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir a conversa.");
      } finally {
        setThreadLoading(false);
      }
    },
    [activeId, user],
  );

  useEffect(
    function watch() {
      if (!user) return;
      loadThread();
      const timer = window.setInterval(loadThread, 6000);
      return function stop() {
        window.clearInterval(timer);
      };
    },
    [user, loadThread],
  );

  useEffect(
    function follow() {
      if (bottom.current) bottom.current.scrollTop = bottom.current.scrollHeight;
    },
    [thread.length],
  );

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const body = text.trim();
    if (body.length === 0 || sending) return;
    setSending(true);
    try {
      await sendMessage(activeId, user ? user.id : "", body);
      setText("");
      await loadThread();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel enviar a mensagem.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <Spinner label="A verificar sessao" />;
  if (!user) return <Navigate to="/entrar?next=/mensagens" replace />;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Mensagens</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
        {active ? active.listingTitle : "Negociacoes"}
      </h1>

      {!configured ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          Modo demonstracao: as mensagens reais requerem a ligacao ao Supabase.
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard
          className={cn(
            "flex max-h-[62vh] flex-col overflow-y-auto p-2",
            activeId.length > 0 ? "hidden lg:flex" : "flex",
          )}
        >
          {loading ? <Spinner /> : null}
          {!loading && items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Ainda sem conversas"
                description="Abra uma conversa a partir de qualquer anuncio no mercado."
                action={
                  <GlowButton to="/explorar" size="sm">
                    Explorar ofertas
                  </GlowButton>
                }
              />
            </div>
          ) : null}
          {items.map(function render(item) {
            return (
              <Link
                key={item.id}
                to={"/mensagens/" + item.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-3 transition",
                  item.id === activeId ? "bg-white/10" : "hover:bg-white/5",
                )}
              >
                {item.listingCover ? (
                  <img src={item.listingCover} alt={item.listingTitle} className="h-11 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="glass grid h-11 w-14 shrink-0 place-items-center rounded-xl">
                    <MessageCircle className="h-4 w-4 text-glow-400" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">{item.listingTitle}</span>
                  <span className="block truncate text-xs text-haze-500">{item.otherName}</span>
                </span>
                <span className="shrink-0 text-[10px] text-haze-500">{timeLabel(item.lastMessageAt)}</span>
              </Link>
            );
          })}
        </GlassCard>

        <div className={cn("lg:col-span-2", activeId.length === 0 ? "hidden lg:block" : "block")}>
          {activeId.length === 0 ? (
            <EmptyState
              title="Escolha uma conversa"
              description="Selecione uma negociacao na lista para ler e responder."
            />
          ) : (
            <GlassCard tone="strong" className="flex h-[62vh] flex-col">
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <button
                  type="button"
                  onClick={function back() {
                    navigate("/mensagens");
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-haze-300 hover:text-white"
                  aria-label="Voltar as conversas"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{active ? active.otherName : "Conversa"}</p>
                  {active ? (
                    <Link
                      to={"/anuncio/" + active.listingId}
                      className="text-[11px] text-glow-400 hover:text-white"
                    >
                      {active.listingTitle}
                    </Link>
                  ) : null}
                </div>
              </div>

              <div ref={bottom} className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadLoading && thread.length === 0 ? <Spinner /> : null}
                {!threadLoading && thread.length === 0 ? (
                  <p className="py-10 text-center text-sm text-haze-500">Envie a primeira mensagem para comecar.</p>
                ) : null}
                {thread.map(function render(message) {
                  const mine = message.sender_id === (user ? user.id : "");
                  return (
                    <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                          mine ? "bg-glow-500 text-white" : "glass text-haze-100",
                        )}
                      >
                        {message.body}
                        <span className={cn("mt-1 block text-[10px]", mine ? "text-white/70" : "text-haze-500")}>
                          {timeLabel(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-3">
                <input
                  value={text}
                  onChange={function change(event) {
                    setText(event.target.value);
                  }}
                  placeholder="Escreva a mensagem"
                  aria-label="Mensagem"
                  className="h-11 w-full rounded-full border border-white/10 bg-ink-900/50 px-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
                />
                <GlowButton type="submit" disabled={sending} size="sm" className="shrink-0">
                  <Send className="h-4 w-4" />
                  Enviar
                </GlowButton>
              </form>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
