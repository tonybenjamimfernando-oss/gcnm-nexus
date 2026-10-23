import { CalendarDays, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { MARKETING_RULES, cadenceWeek } from "@/lib/marketing";

export default function CadenceWeek() {
  const week = cadenceWeek();
  return (
    <GlassCard tone="deep" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <CalendarDays className="h-4 w-4 text-mint-400" />
          Cadencia da semana
        </h2>
        <p className="text-xs text-haze-500">Sete toques, sete dias, sem gastar em anuncios.</p>
      </div>
      <div className="mt-4 grid gap-2">
        {week.map(function render(item) {
          return (
            <div key={item.day} className="neo flex items-start gap-3 rounded-2xl px-4 py-3">
              <span className="mt-0.5 w-20 shrink-0 text-[11px] font-bold uppercase tracking-[0.16em] text-glow-400">{item.day}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.channel}</p>
                <p className="mt-0.5 text-xs leading-5 text-haze-300">{item.action}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-2">
        {MARKETING_RULES.map(function render(rule) {
          return (
            <div key={rule} className="flex items-start gap-2 text-xs leading-5 text-haze-300">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-400" />
              {rule}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
