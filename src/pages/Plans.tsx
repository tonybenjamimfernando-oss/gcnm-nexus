import { useState } from "react";
import { Check, Coins, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import CurrencySwitcher from "@/components/ui/CurrencySwitcher";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import { CURRENCIES, currencyName } from "@/lib/currencies";
import { useCurrency } from "@/lib/currency";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/cn";

const FAQ = [
  {
    title: "Moeda de cobranca",
    text: "Os precos de referencia estao em dolares. Ao ativar o checkout, a cobranca e apresentada na moeda escolhida, com as taxas do provedor de pagamento.",
  },
  {
    title: "Metodos de pagamento",
    text: "Cartoes internacionais na primeira fase, seguidos de metodos locais por pais, conforme a cobertura do provedor.",
  },
  {
    title: "Faturacao e cancelamento",
    text: "Fatura com dados fiscais da empresa, renovacao mensal ou anual e cancelamento a qualquer momento.",
  },
];

export default function Plans() {
  const { money, currency } = useCurrency();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Planos</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Vender ao mundo com precos claros
        </h1>
        <p className="mt-4 text-sm leading-6 text-haze-300 md:text-base">
          Comece gratis para procurar e comparar. Para publicar, destacar e operar varias salas, escolha o plano certo
          para o seu momento. Todos os valores aparecem na moeda escolhida.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={function monthly() {
              setCycle("monthly");
            }}
            className={cn(
              "h-10 rounded-xl px-4 text-xs font-bold transition",
              cycle === "monthly" ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
            )}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={function yearly() {
              setCycle("yearly");
            }}
            className={cn(
              "h-10 rounded-xl px-4 text-xs font-bold transition",
              cycle === "yearly" ? "bg-glow-500 text-white" : "text-haze-300 hover:text-white",
            )}
          >
            Anual (2 meses gratis)
          </button>
        </div>
        <CurrencySwitcher />
        <span className="inline-flex items-center gap-2 text-xs text-haze-500">
          <Coins className="h-4 w-4 text-glow-400" />
          {CURRENCIES.length} moedas disponiveis - {currencyName(currency)}
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map(function render(plan) {
          const price = cycle === "monthly" ? plan.monthlyUsd : plan.yearlyUsd;
          const isFree = plan.monthlyUsd === 0;
          return (
            <GlassCard
              key={plan.id}
              tone={plan.highlight ? "strong" : "default"}
              className={cn("relative flex flex-col p-5", plan.highlight ? "border-glow-400/40" : "")}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-glow-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  <Sparkles className="h-3 w-3" />
                  Mais escolhido
                </span>
              ) : null}
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">{plan.audience}</p>
              <h2 className="mt-2 font-display text-xl font-extrabold text-white">{plan.name}</h2>
              <p className="mt-1 text-sm text-haze-300">{plan.tagline}</p>
              <p className="neon mt-5 font-display text-3xl font-extrabold text-white">
                {isFree ? "Gratis" : money(price, "USD")}
              </p>
              <p className="mt-1 text-xs text-haze-500">{isFree ? "sempre" : cycle === "monthly" ? "por mes" : "por ano"}</p>
              <ul className="mt-5 grid flex-1 gap-2 text-xs leading-5 text-haze-300">
                {plan.features.map(function render(feature) {
                  return (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-400" />
                      {feature}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6">
                <GlowButton to="/entrar" variant={plan.highlight ? "primary" : "glass"} className="w-full">
                  {plan.cta}
                </GlowButton>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard tone="strong" className="mt-8 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400">
            <CreditCard className="h-3.5 w-3.5" />
            Proxima fase
          </span>
          <p className="text-sm text-haze-300">
            O checkout automatico (Stripe) liga na proxima fase: falta a conta do provedor, as moedas a aceitar e as
            condicoes de reembolso. Os valores apresentados sao de referencia e nao sao cobrados agora.
          </p>
        </div>
      </GlassCard>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {FAQ.map(function render(entry) {
          return (
            <GlassCard key={entry.title} className="p-5">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-haze-500">
                <ShieldCheck className="h-4 w-4 text-mint-400" />
                {entry.title}
              </span>
              <p className="mt-3 text-sm leading-6 text-haze-300">{entry.text}</p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
