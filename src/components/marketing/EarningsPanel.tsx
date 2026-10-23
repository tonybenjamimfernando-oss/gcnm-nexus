import { Coins, TrendingUp } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import NeoTile from "@/components/ui/NeoTile";
import { HOLD_DAYS, levelForActive, nextLevelFor, storesToNextLevel } from "@/lib/economy";
import { commissionKindLabel, commissionStatusLabel, commissionTotals } from "@/lib/marketingData";
import type { CommissionView } from "@/lib/marketingData";
import { formatDate, formatMoney } from "@/lib/format";

type Props = { rows: CommissionView[] };

export default function EarningsPanel({ rows }: Props) {
  const totals = commissionTotals(rows);
  const storeIds = rows
    .map(function id(item) { return item.storeId; })
    .filter(function once(id, index, all) { return all.indexOf(id) === index; });
  const level = levelForActive(storeIds.length);
  const next = nextLevelFor(storeIds.length);
  return (
    <GlassCard tone="deep" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <Coins className="h-4 w-4 text-mint-400" />
          Os meus ganhos de afiliado
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-haze-300">
          <TrendingUp className="h-3.5 w-3.5 text-glow-400" />
          {level.name} · {level.rate}%
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-haze-500">
        {storeIds.length === 0
          ? "Ainda sem comissoes: gera um codigo numa loja e partilha o link marcado."
          : storeIds.length + (storeIds.length === 1 ? " loja paga" : " lojas pagas") + " a gerar comissao." + (next ? " Faltam " + storesToNextLevel(storeIds.length) + " lojas para o nivel " + next.name + "." : " Estas no nivel maximo.")}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NeoTile tone="ember" label="Retido" value={formatMoney(totals.pendingUsd, "USD")} hint={"liberta apos " + HOLD_DAYS + " dias"} />
        <NeoTile tone="lime" label="Disponivel" value={formatMoney(totals.payableUsd, "USD")} hint="pronto a pagar" />
        <NeoTile tone="glow" label="Pago" value={formatMoney(totals.paidUsd, "USD")} hint="ja transferido" />
        <NeoTile tone="coral" label="Total" value={formatMoney(totals.totalUsd, "USD")} hint="desde o inicio" />
      </div>
      {rows.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {rows.slice(0, 6).map(function render(item) {
            return (
              <div key={item.id} className="neo flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{commissionKindLabel(item.kind)}</p>
                  <p className="text-[11px] text-haze-500">{item.storeName} · {formatDate(item.period)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-extrabold tracking-tight text-white">{formatMoney(item.amountUsd, "USD")}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-haze-500">{commissionStatusLabel(item.status)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </GlassCard>
  );
}
