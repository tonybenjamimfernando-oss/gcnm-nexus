import { Coins } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import NeoTile from "@/components/ui/NeoTile";
import { planForTier } from "@/lib/economy";
import { formatMoney } from "@/lib/format";
import type { StoreView } from "@/lib/stores";

type Props = { store: StoreView | null };

export default function OwnerEconomy({ store }: Props) {
  if (!store) return null;
  const plan = planForTier(store.tier);
  return (
    <GlassCard tone="deep" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <Coins className="h-4 w-4 text-ember-400" />
          Plano e bonus
        </h2>
        <GlowButton to="/lojas" variant="glass" size="sm">
          Ver planos
        </GlowButton>
      </div>
      <p className="mt-2 text-xs leading-5 text-haze-500">
        O plano define os servicos ligados e o saldo de bonus que recebes todos os meses para destaques, verificacao e comissoes.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NeoTile tone="glow" label="Plano" value={plan.name} hint={plan.tagline} />
        <NeoTile
          tone="coral"
          label="Custo mensal"
          value={plan.monthlyUsd === 0 ? "Gratis" : formatMoney(plan.monthlyUsd, "USD")}
          hint={plan.yearlyUsd > 0 ? formatMoney(plan.yearlyUsd, "USD") + " por ano" : "sem cartao, sem mensalidade"}
        />
        <NeoTile
          tone="lime"
          label="Saldo de bonus"
          value={plan.bonusCreditUsd === 0 ? "-" : formatMoney(plan.bonusCreditUsd, "USD")}
          hint={plan.bonusCreditUsd === 0 ? "disponivel a partir do Pro" : "todos os meses, dura tres meses"}
        />
        <NeoTile tone="ember" label="Comissao de afiliado" value={store.commission + "%"} hint="o que pagas por venda trazida" />
      </div>
    </GlassCard>
  );
}
