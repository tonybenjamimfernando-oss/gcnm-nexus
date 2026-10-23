import { Coins, Gauge, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import NeoTile from "@/components/ui/NeoTile";
import { AFFILIATE_LEVELS, BONUS_FUND_CEILING_USD, BONUS_FUND_SHARE, HOLD_DAYS, MILESTONES, PAYOUT_FLOOR_USD, firstMonthBonus } from "@/lib/economy";
import { formatMoney } from "@/lib/format";

const RULES = [
  "A comissao e recorrente e incide sobre a receita efetivamente cobrada da loja.",
  "Cancelamentos e estornos sao deduzidos antes do pagamento.",
  "Sem auto-indicacao: a tua propria loja nao gera comissao.",
  "As metas contam lojas pagas ativas, nunca registos ou contas sem plano.",
];

export default function BonusLadder() {
  return (
    <GlassCard tone="strong" className="layer-stack relative overflow-hidden px-6 py-10 md:px-12">
      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-glow-400">Programa de bonus</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              O primeiro mes conta como bonus, e o nivel sobe contigo.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-haze-300">
            Quem traz lojas pagas ganha comissao recorrente. Como so se paga sobre receita cobrada, o programa aguenta
            crescer sem promessas que a operacao nao consegue cumprir.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {AFFILIATE_LEVELS.map(function render(level) {
            return (
              <GlassCard key={level.id} tone="deep" className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg font-extrabold tracking-tight text-white">{level.name}</p>
                  <p className="font-display text-2xl font-extrabold tracking-tight text-mint-400">{level.rate}%</p>
                </div>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-haze-500">
                  a partir de {level.minActive} {level.minActive === 1 ? "loja ativa" : "lojas ativas"}
                </p>
                <ul className="mt-4 grid gap-2">
                  {level.perks.map(function render(perk) {
                    return (
                      <li key={perk} className="text-[13px] leading-6 text-haze-300">
                        {perk}
                      </li>
                    );
                  })}
                </ul>
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NeoTile
            tone="lime"
            icon={<Sparkles className="h-4 w-4" />}
            label="Primeiro mes"
            value="100%"
            hint={"cada loja nova paga o primeiro mes como bonus, a partir de " + formatMoney(firstMonthBonus("pro"), "USD")}
          />
          <NeoTile
            tone="ember"
            icon={<TrendingUp className="h-4 w-4" />}
            label="Metas"
            value={MILESTONES.map(function size(item) { return item.bonusUsd; }).join(" / ")}
            hint={"aos " + MILESTONES.map(function size(item) { return item.active; }).join(", ") + " lojas pagas ativas"}
          />
          <NeoTile
            tone="glow"
            icon={<Coins className="h-4 w-4" />}
            label="Fundo de bonus"
            value={Math.round(BONUS_FUND_SHARE * 100) + "%"}
            hint={"da receita da rede, repartido a proporcao, com teto de " + formatMoney(BONUS_FUND_CEILING_USD, "USD")}
          />
          <NeoTile
            tone="coral"
            icon={<Gauge className="h-4 w-4" />}
            label="Retencao"
            value={HOLD_DAYS + " dias"}
            hint={"minimo de " + formatMoney(PAYOUT_FLOOR_USD, "USD") + " para pagar; abaixo disso acumula"}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {RULES.map(function render(rule) {
            return (
              <div key={rule} className="neo flex items-start gap-3 rounded-2xl px-4 py-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-glow-400" />
                <p className="text-[13px] leading-6 text-haze-300">{rule}</p>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
