import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export default function StatTile({ value, label, hint, icon, className = "" }: Props) {
  return (
    <div className={cn("glass rounded-2xl px-4 py-4", className)}>
      <div className="flex items-center gap-2 text-glow-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-haze-500">{label}</span>
      </div>
      <p className="mt-2 font-display text-xl font-extrabold text-white md:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-haze-500">{hint}</p> : null}
    </div>
  );
}
