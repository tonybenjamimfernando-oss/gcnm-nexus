import { Link, useLocation } from "react-router-dom";
import { Megaphone, CreditCard, Home, LayoutGrid, MapPin, Search, UserRound, Store } from "lucide-react";
import { useSession } from "@/lib/session";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function MobileDock() {
  const { user } = useSession();
  const { t } = useLanguage();
  const path = window.location.pathname;
  const location = useLocation();
  const current = location.pathname || path;
  const items = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/explorar", label: t("nav.explore"), icon: Search },
    { to: "/salas", label: t("nav.rooms"), icon: LayoutGrid },
    { to: "/lojas", label: t("nav.stores"), icon: Store },
    { to: "/marketing", label: t("nav.marketing"), icon: Megaphone },
    { to: "/mapa", label: t("nav.map"), icon: MapPin },
    { to: "/planos", label: t("nav.plans"), icon: CreditCard },
    { to: user ? "/painel" : "/entrar", label: user ? t("nav.dashboard") : t("nav.signin"), icon: UserRound },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/85 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 backdrop-blur-2xl md:hidden"
      aria-label="Atalhos"
    >
      <div className="grid grid-cols-7">
        {items.map(function render(item) {
          const active = item.to === "/" ? current === "/" : current.indexOf(item.to) === 0;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition",
                active ? "text-glow-400" : "text-haze-500",
              )}
            >
              <item.icon className={cn("h-5 w-5", active ? "drop-shadow-[0_0_10px_rgba(45,123,253,0.8)]" : "")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
