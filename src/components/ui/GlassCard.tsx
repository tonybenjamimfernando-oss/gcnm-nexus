import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  tone?: "default" | "strong" | "deep";
  className?: string;
  children: ReactNode;
};

export default function GlassCard({ tone = "default", className = "", children }: Props) {
  const base = tone === "strong" ? "glass-strong" : tone === "deep" ? "glass-deep" : "glass";
  return <div className={cn(base, "rounded-3xl", className)}>{children}</div>;
}
