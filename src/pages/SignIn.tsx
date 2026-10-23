import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Mail, Send, ShieldCheck, UserPlus } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

type Mode = "entrar" | "criar" | "ligacao";

export default function SignIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, configured, signIn, signUp, sendMagicLink } = useSession();
  const next = params.get("next") || "/painel";
  const [mode, setMode] = useState<Mode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (email.trim().length < 5 || email.indexOf("@") === -1) {
      setError("Indique um email valido.");
      return;
    }
    if (mode !== "ligacao" && password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setBusy(true);
    const result =
      mode === "entrar"
        ? await signIn(email.trim(), password)
        : mode === "criar"
          ? await signUp(email.trim(), password, next)
          : await sendMagicLink(email.trim(), next);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.info) {
      setInfo(result.info);
      return;
    }
    navigate(next, { replace: true });
  }

  const TABS: Array<{ id: Mode; label: string; icon: typeof Mail }> = [
    { id: "entrar", label: "Entrar", icon: KeyRound },
    { id: "criar", label: "Criar conta", icon: UserPlus },
    { id: "ligacao", label: "Ligacao por email", icon: Send },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <GlassCard tone="strong" className="p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Conta</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Entre para guardar, publicar e negociar
        </h1>
        <p className="mt-3 text-sm leading-6 text-haze-300">
          A sua conta GCNM Nexus da acesso ao painel, aos guardados e as ofertas que publicar.
        </p>

        {!configured ? (
          <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
            A ligacao ao Supabase ainda nao esta configurada neste ambiente. Defina as variaveis publicas no ficheiro
            .env para activar o acesso.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          {TABS.map(function render(tab) {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={function pick() {
                  setMode(tab.id);
                  setError(null);
                  setInfo(null);
                }}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition",
                  mode === tab.id ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
            <input
              type="email"
              value={email}
              onChange={function change(event) {
                setEmail(event.target.value);
              }}
              placeholder="Email"
              aria-label="Email"
              className="h-12 w-full rounded-2xl border border-white/10 bg-ink-900/50 pl-11 pr-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
            />
          </div>

          {mode !== "ligacao" ? (
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
              <input
                type="password"
                value={password}
                onChange={function change(event) {
                  setPassword(event.target.value);
                }}
                placeholder="Palavra-passe"
                aria-label="Palavra-passe"
                className="h-12 w-full rounded-2xl border border-white/10 bg-ink-900/50 pl-11 pr-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
              />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</p>
          ) : null}
          {info ? (
            <p className="rounded-2xl border border-mint-400/30 bg-mint-400/10 px-4 py-3 text-xs text-mint-400">{info}</p>
          ) : null}

          <GlowButton type="submit" size="lg" className="w-full" disabled={busy || !configured}>
            {busy ? "A processar" : mode === "entrar" ? "Entrar" : mode === "criar" ? "Criar conta" : "Enviar ligacao"}
          </GlowButton>
        </form>

        <p className="mt-5 inline-flex items-center gap-2 text-[11px] leading-4 text-haze-500">
          <ShieldCheck className="h-3.5 w-3.5 text-mint-400" />
          So usamos o email para autenticacao e avisos da plataforma.
        </p>
      </GlassCard>
    </div>
  );
}
