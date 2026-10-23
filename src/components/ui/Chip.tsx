import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
  title?: string;
};

export default function Chip({ children, active = false, onClick, to, className = "", title }: Props) {
  const classes = cn(
    "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition",
    active
      ? "border-transparent bg-glow-500 text-white shadow-[0_12px_30px_-14px_rgba(45,123,253,0.9)]"
      : "border-white/10 bg-white/5 text-haze-300 hover:border-glow-400/50 hover:text-white",
    className,
  );
  if (to) {
    return (
      <Link to={to} className={classes} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} title={title}>
      {children}
    </button>
  );
}
