import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  icon?: ReactNode;
  label: string;
  value?: string;
  hint?: string;
  tone?: "default" | "glow" | "ember" | "coral" | "lime";
  className?: string;
};

const TONES: Record<string, string> = {
  default: "neo",
  glow: "neo neo-glow",
  ember: "neo neo-ember",
  coral: "neo neo-coral",
  lime: "neo neo-lime",
};

export default function NeoTile({ icon, label, value, hint, tone = "default", className = "" }: Props) {
  return (
    <div className={cn(TONES[tone], "rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2">
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/30 text-white">{icon}</span> : null}
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-haze-500">{label}</span>
      </div>
      {value ? <p className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">{value}</p> : null}
      {hint ? <p className="mt-1 text-[11px] leading-5 text-haze-500">{hint}</p> : null}
    </div>
  );
}
