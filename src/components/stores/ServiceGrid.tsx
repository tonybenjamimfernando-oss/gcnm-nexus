import { BarChart3, CalendarClock, CreditCard, MessageCircle, Package, Repeat, Share2, Store, Truck, Users } from "lucide-react";
import { STORE_SERVICES, tierLabel, tierRank } from "@/lib/storeServices";
import { cn } from "@/lib/cn";

const ICONS: Record<string, typeof Store> = {
  vitrine: Store,
  catalogo: Package,
  mensagens: MessageCircle,
  pagamentos: CreditCard,
  entregas: Truck,
  reservas: CalendarClock,
  equipa: Users,
  afiliados: Share2,
  analitica: BarChart3,
  subscricoes: Repeat,
};

type Props = {
  state: Record<string, boolean>;
  tier: string;
  editable?: boolean;
  busyKey?: string | null;
  onToggle?: (key: string, next: boolean) => void;
};

export default function ServiceGrid({ state, tier, editable = false, busyKey = null, onToggle }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {STORE_SERVICES.map(function render(service) {
        const Icon = ICONS[service.key] || Store;
        const available = tierRank(service.tier) <= tierRank(tier);
        const on = Boolean(state[service.key]) && available;
        const tag = !available ? "Plano " + tierLabel(service.tier) : on ? "Ativo" : "Inativo";
        return (
          <button
            key={service.key}
            type="button"
            disabled={!editable || !available || busyKey === service.key}
            onClick={function toggle() {
              if (onToggle) onToggle(service.key, !on);
            }}
            className={cn(
              "neo rounded-2xl p-4 text-left transition",
              on ? "neo-glow" : "",
              editable && available ? "hover:-translate-y-0.5" : "opacity-70",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/30 text-white">
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", on ? "text-mint-400" : "text-haze-500")}>{tag}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{service.label}</p>
            <p className="mt-1 text-[11px] leading-5 text-haze-500">{service.blurb}</p>
          </button>
        );
      })}
    </div>
  );
}
