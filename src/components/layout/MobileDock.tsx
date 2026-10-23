import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Search, Store, UserRound } from "lucide-react";
import { useSession } from "@/lib/session";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function MobileDock() {
  const { user } = useSession();
  const { t } = useLanguage();
  const location = useLocation();
  const current = location.pathname;
  const items = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/explorar", label: t("nav.explore"), icon: Search },
    { to: "/salas", label: t("nav.rooms"), icon: LayoutGrid },
    { to: "/lojas", label: t("nav.stores"), icon: Store },
    { to: user ? "/painel" : "/entrar", label: user ? t("nav.dashboard") : t("nav.signin"), icon: UserRound },
  ];

  return (
    <nav
      className="mobile-dock fixed inset-x-0 bottom-0 z-40 border-t border-emerald-200/15 bg-[#041f1b]/90 px-2 pb-[max(env(safe-area-inset-bottom),0.45rem)] pt-2 backdrop-blur-2xl md:hidden"
      aria-label="Navegação principal móvel"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map(function render(item) {
          const active = item.to === "/" ? current === "/" : current.indexOf(item.to) === 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[3.6rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors",
                active ? "bg-emerald-300/10 text-emerald-200" : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className={cn("h-[1.3rem] w-[1.3rem]", active ? "drop-shadow-[0_0_9px_rgba(52,211,153,0.45)]" : "")} strokeWidth={active ? 2.3 : 1.9} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
