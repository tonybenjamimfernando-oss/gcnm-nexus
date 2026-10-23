import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "glass" | "ghost" | "quiet";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
};

const VARIANTS: Record<string, string> = {
  primary: "bg-glow-500 text-white hover:bg-glow-400 shadow-[0_18px_45px_-18px_rgba(45,123,253,0.85)]",
  glass: "border border-white/10 bg-white/5 backdrop-blur-xl text-haze-100 hover:border-glow-400/60 hover:bg-white/10",
  ghost: "border border-white/10 text-haze-300 hover:text-white hover:border-glow-400/50",
  quiet: "text-haze-300 hover:text-white",
};

const SIZES: Record<string, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export default function GlowButton({
  children,
  to,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  title,
  ariaLabel,
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} title={title} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} title={title} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} title={title} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
