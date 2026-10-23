import { Gauge, Megaphone, Users } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import NeoTile from "@/components/ui/NeoTile";
import { marketingScore, scoreChecks, scoreGrade } from "@/lib/marketing";
import type { MarketingInput } from "@/lib/marketing";

type Props = { input: MarketingInput; tasks: number };

export default function MarketingScore({ input, tasks }: Props) {
  const score = marketingScore(input);
  const checks = scoreChecks(input);
  const done = checks.filter(function count(check) { return check.done; }).length;
  return (
    <GlassCard tone="strong" className="layer-stack relative overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: "radial-gradient(420px 200px at 15% 0%, rgba(45,123,253,0.22), transparent 70%)" }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-glow-400">Marketing proativo</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">Estado: {scoreGrade(score)}</h1>
          <p className="mt-2 text-sm leading-6 text-haze-300">
            {done} de {checks.length} bases prontas e {tasks} {tasks === 1 ? "acao sugerida" : "acoes sugeridas"} para hoje. A fila
            atualiza-se com o estado real da loja.
          </p>
        </div>
        <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-white/5">
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold tracking-tight text-white">{score}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-haze-500">de 100</p>
          </div>
        </div>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        <NeoTile tone="ember" icon={<Megaphone className="h-4 w-4" />} label="Campanhas" value={String(input.campaigns)} hint={input.liveCampaigns + " a andar"} />
        <NeoTile tone="glow" icon={<Users className="h-4 w-4" />} label="Afiliados" value={String(input.affiliates)} hint="a trazer clientes" />
        <NeoTile tone="lime" icon={<Gauge className="h-4 w-4" />} label="Visitas medidas" value={String(input.visits)} hint={input.channelsUsed.length + " canais com trafego"} />
      </div>
    </GlassCard>
  );
}
