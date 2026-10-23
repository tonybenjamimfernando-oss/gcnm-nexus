import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({ eyebrow, title, description, action, align = "left", className = "" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" ? "mx-auto" : "")}>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-6 text-haze-300 md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
    </div>
  );
}
