import { BASE_CURRENCY, rateFor } from "./rates";

export function convert(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const usd = from === BASE_CURRENCY ? amount : amount / rateFor(from);
  return to === BASE_CURRENCY ? usd : usd * rateFor(to);
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return currency + " " + amount.toFixed(2);
  }
}

export function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat("pt-PT").format(value);
  } catch {
    return String(value);
  }
}

export function formatCompact(value: number): string {
  try {
    return new Intl.NumberFormat("pt-PT", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Sem data";
  try {
    return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return "Sem data";
  try {
    return new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

const KIND_LABELS: Record<string, string> = {
  product: "Produto",
  service: "Servico",
  request: "Pedido de compra",
  opportunity: "Oportunidade",
};

export function listingKindLabel(kind: string): string {
  return KIND_LABELS[kind] || "Oferta";
}

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  draft: "Rascunho",
  pending: "Em revisao",
  paused: "Pausado",
  sold: "Concluido",
  archived: "Arquivado",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

const ACCOUNT_LABELS: Record<string, string> = {
  personal: "Particular",
  business: "Empresa",
  provider: "Prestador de servicos",
};

export function accountTypeLabel(type: string): string {
  return ACCOUNT_LABELS[type] || "Membro";
}

export function initials(value: string): string {
  const parts = value.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "GC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
