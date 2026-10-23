import { ArrowRight, Clock, Zap } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import type { MarketingTask } from "@/lib/marketing";
import { cn } from "@/lib/cn";

const IMPACT: Record<string, string> = {
  alto: "border-coral-400/50 bg-coral-400/10 text-coral-400",
  medio: "border-ember-400/50 bg-ember-400/10 text-ember-400",
  base: "border-glow-400/40 bg-glow-500/10 text-glow-400",
};

const LABEL: Record<string, string> = { alto: "Impacto alto", medio: "Impacto medio", base: "Manutencao" };

type Props = { tasks: MarketingTask[] };

export default function ActionQueue({ tasks }: Props) {
  return (
    <GlassCard tone="deep" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <Zap className="h-4 w-4 text-ember-400" />
          Fila de acoes de hoje
        </h2>
        <p className="text-xs text-haze-500">Ordenada por impacto, com o tempo estimado de cada passo.</p>
      </div>
      <div className="mt-4 grid gap-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-haze-300">Tudo em ordem: mantem a cadencia e volta a medir na proxima semana.</p>
        ) : (
          tasks.map(function render(task) {
            return (
              <div key={task.id} className="neo flex flex-col gap-3 rounded-2xl px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]", IMPACT[task.impact])}>
                      {LABEL[task.impact]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-haze-500">
                      <Clock className="h-3 w-3" />
                      {task.minutes} min
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-xs leading-5 text-haze-300">{task.detail}</p>
                </div>
                <GlowButton to={task.route} variant="glass" size="sm">
                  Fazer agora
                  <ArrowRight className="h-3.5 w-3.5" />
                </GlowButton>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
