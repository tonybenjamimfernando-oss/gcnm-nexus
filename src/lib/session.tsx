import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { configMessage, isSupabaseReady, supabase } from "./supabase";

export type SessionUser = { id: string; email: string | null };
export type AuthResult = { error: string | null; info: string | null };

type SessionValue = {
  user: SessionUser | null;
  ready: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, next: string) => Promise<AuthResult>;
  sendMagicLink: (email: string, next: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

function translate(message: string): string {
  const text = message.toLowerCase();
  if (text.indexOf("invalid login") !== -1) return "Email ou palavra-passe incorretos.";
  if (text.indexOf("already registered") !== -1) return "Este email ja tem conta. Entre ou recupere a palavra-passe.";
  if (text.indexOf("email not confirmed") !== -1) return "Confirme o email antes de entrar.";
  if (text.indexOf("password should be at least") !== -1) return "A palavra-passe e demasiado curta.";
  if (text.indexOf("rate limit") !== -1) return "Demasiadas tentativas. Tente novamente dentro de alguns minutos.";
  return message;
}

function toUser(session: { user: { id: string; email?: string | null } } | null): SessionUser | null {
  if (!session) return null;
  return { id: session.user.id, email: session.user.email || null };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(function watch() {
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(function loaded(result) {
      if (!active) return;
      setUser(toUser(result.data.session));
      setReady(true);
    });
    const subscription = supabase.auth.onAuthStateChange(function changed(_event, session) {
      setUser(toUser(session));
    });
    return function stop() {
      active = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionValue>(function build() {
    return {
      user,
      ready,
      configured: isSupabaseReady,
      signIn: async function signIn(email, password) {
        if (!supabase) return { error: configMessage, info: null };
        const result = await supabase.auth.signInWithPassword({ email, password });
        return { error: result.error ? translate(result.error.message) : null, info: null };
      },
      signUp: async function signUp(email, password, next) {
        if (!supabase) return { error: configMessage, info: null };
        const result = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + next },
        });
        if (result.error) return { error: translate(result.error.message), info: null };
        if (!result.data.session) {
          return { error: null, info: "Conta criada. Confirme o email para activar o acesso." };
        }
        return { error: null, info: null };
      },
      sendMagicLink: async function sendMagicLink(email, next) {
        if (!supabase) return { error: configMessage, info: null };
        const result = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin + next },
        });
        if (result.error) return { error: translate(result.error.message), info: null };
        return { error: null, info: "Ligacao enviada. Verifique o email para entrar." };
      },
      signOut: async function signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    };
  }, [user, ready]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession fora do SessionProvider");
  return value;
}
