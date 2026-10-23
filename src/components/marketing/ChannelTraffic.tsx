import { BarChart3 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { MARKETING_CHANNELS } from "@/lib/marketing";
import type { VisitTotals } from "@/lib/marketingData";

type Props = { totals: VisitTotals };

export default function ChannelTraffic({ totals }: Props) {
  const known = MARKETING_CHANNELS.map(function row(item) {
    return { id: item.id, label: item.label, count: totals.byChannel[item.id] || 0 };
  });
  const extra = Object.keys(totals.byChannel)
    .filter(function unknown(key) {
      return !MARKETING_CHANNELS.some(function has(item) { return item.id === key; });
    })
    .map(function row(key) {
      return { id: key, label: key, count: totals.byChannel[key] };
    });
  const rows = known.concat(extra);
  const top = rows.reduce(function max(acc, item) { return Math.max(acc, item.count); }, 0);
  return (
    <GlassCard tone="deep" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <BarChart3 className="h-4 w-4 text-glow-400" />
          De onde vem a gente
        </h2>
        <p className="text-xs text-haze-500">{totals.total} {totals.total === 1 ? "visita medida" : "visitas medidas"}</p>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map(function render(item) {
          const percent = top > 0 ? Math.round((item.count / top) * 100) : 0;
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between text-[12px] text-haze-300">
                <span className="font-semibold">{item.label}</span>
                <span>{item.count}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-2 rounded-full bg-glow-400" style={{ width: percent + "%" }} />
              </div>
            </div>
          );
        })}
      </div>
      {totals.total === 0 ? (
        <p className="mt-4 text-xs leading-5 text-haze-500">
          Ainda sem visitas medidas. Partilha um link marcado e esta leitura comeca a encher.
        </p>
      ) : null}
    </GlassCard>
  );
}
