import { Check, Crown, Rocket, Sparkles, Store as StoreIcon } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import { STORE_PLANS, annualSaving, creditShare, planNetUsd, planServices } from "@/lib/economy";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const ICONS: Record<string, typeof StoreIcon> = { starter: StoreIcon, pro: Rocket, scale: Crown };

export default function StorePlanCards() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ember-400">Planos das lojas</p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Cada plano devolve valor em saldo de bonus.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-haze-300">
          O saldo de bonus faz parte do preco: usas em destaques, verificacao de loja e comissoes de afiliado, e dura tres
          meses. Sem taxas escondidas e sem fidelizacao obrigatoria.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {STORE_PLANS.map(function render(plan) {
          const Icon = ICONS[plan.tier] || StoreIcon;
          const services = planServices(plan);
          return (
            <GlassCard
              key={plan.id}
              tone={plan.highlight ? "strong" : "deep"}
              className={cn("layer-stack relative flex flex-col overflow-hidden p-6", plan.highlight ? "ring-1 ring-glow-400/40" : "")}
            >
              {plan.highlight ? (
                <span className="absolute right-5 top-5 rounded-full border border-glow-400/50 bg-glow-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  Mais escolhido
                </span>
              ) : null}
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/30 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-lg font-extrabold tracking-tight text-white">{plan.name}</p>
                  <p className="text-[11px] text-haze-500">{plan.tagline}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-display text-3xl font-extrabold tracking-tight text-white">
                  {plan.monthlyUsd === 0 ? "Gratis" : formatMoney(plan.monthlyUsd, "USD")}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-haze-500">
                  {plan.monthlyUsd === 0
                    ? "para sempre, sem cartao"
                    : "por mes, ou " + formatMoney(plan.yearlyUsd, "USD") + " por ano (" + annualSaving(plan) + " meses de bonus)"}
                </p>
              </div>

              {plan.bonusCreditUsd > 0 ? (
                <div className="neo neo-lime mt-4 rounded-2xl px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                    {formatMoney(plan.bonusCreditUsd, "USD")} de saldo de bonus
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-haze-300">
                    Incluido todos os meses, o que deixa o custo real do plano em {formatMoney(planNetUsd(plan), "USD")}.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-haze-300">
                <span className="rounded-full border border-white/10 px-3 py-1 font-semibold">Ate {plan.listings} ofertas</span>
                <span className="rounded-full border border-white/10 px-3 py-1 font-semibold">{services.length} servicos ligados</span>
                <span className="rounded-full border border-white/10 px-3 py-1 font-semibold">{creditShare(plan)}% em bonus</span>
              </div>

              <ul className="mt-5 grid gap-2">
                {plan.perks.map(function render(perk) {
                  return (
                    <li key={perk} className="flex items-start gap-2 text-sm leading-6 text-haze-300">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-mint-400" />
                      {perk}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex-1" />
              <GlowButton to="/lojas/montar" variant={plan.highlight ? "primary" : "glass"} size="md" className="w-full">
                {plan.monthlyUsd === 0 ? "Comecar gratis" : "Escolher " + plan.name}
              </GlowButton>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
