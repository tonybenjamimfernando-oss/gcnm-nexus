import { servicesForTier } from "./storeServices";
import type { StoreService } from "./storeServices";

// Motor economico da rede.
// Regra de ouro: so se paga sobre receita efetivamente cobrada, com teto e retencao,
// para o sistema ficar solvente em qualquer cenario e a confianca aguentar o crescimento.
// Os bonus sao reais e visiveis: primeiro mes, metas e fundo repartido.

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export type PlanCycle = "month" | "year";

export type StorePlan = {
  id: string;
  tier: "starter" | "pro" | "scale";
  name: string;
  tagline: string;
  monthlyUsd: number;
  yearlyUsd: number;
  bonusCreditUsd: number;
  listings: number;
  highlight: boolean;
  perks: string[];
};

export const STORE_PLANS: StorePlan[] = [
  {
    id: "vitrine",
    tier: "starter",
    name: "Vitrine",
    tagline: "abrir a loja e vender direto",
    monthlyUsd: 0,
    yearlyUsd: 0,
    bonusCreditUsd: 0,
    listings: 5,
    highlight: false,
    perks: [
      "Montra publica com endereco proprio",
      "Ate 5 ofertas no catalogo",
      "Mensagens dos compradores na plataforma",
      "Codigo de afiliado da loja",
    ],
  },
  {
    id: "pro",
    tier: "pro",
    name: "Pro",
    tagline: "cobrar online, entregar e reservar",
    monthlyUsd: 19,
    yearlyUsd: 190,
    bonusCreditUsd: 12,
    listings: 150,
    highlight: true,
    perks: [
      "Tudo o que o Vitrine inclui",
      "Pagamentos Stripe em varias moedas",
      "Entregas, prazos e recolha local",
      "Reservas, equipa e acessos controlados",
      "12 USD de saldo de bonus todos os meses",
    ],
  },
  {
    id: "escala",
    tier: "scale",
    name: "Escala",
    tagline: "afiliados, analitica e subscricoes",
    monthlyUsd: 49,
    yearlyUsd: 490,
    bonusCreditUsd: 30,
    listings: 1000,
    highlight: false,
    perks: [
      "Tudo o que o Pro inclui",
      "Afiliados com comissoes proprias",
      "Analitica de visitas e conversao",
      "Subscricoes recorrentes para clientes fieis",
      "30 USD de saldo de bonus todos os meses",
      "Verificacao de loja a cada trimestre",
    ],
  },
];

export function findStorePlan(id: string | null | undefined): StorePlan | null {
  if (!id) return null;
  for (const plan of STORE_PLANS) {
    if (plan.id === id) return plan;
  }
  return null;
}

const TIER_TO_PLAN: Record<string, string> = { starter: "vitrine", pro: "pro", scale: "escala" };

export function planForTier(tier: string): StorePlan {
  const found = findStorePlan(TIER_TO_PLAN[tier] || "vitrine");
  return found || STORE_PLANS[0];
}

export function planPrice(plan: StorePlan, cycle: PlanCycle): number {
  return cycle === "year" ? plan.yearlyUsd : plan.monthlyUsd;
}

export function planServices(plan: StorePlan): StoreService[] {
  return servicesForTier(plan.tier);
}

export function annualSaving(plan: StorePlan): number {
  if (plan.monthlyUsd <= 0 || plan.yearlyUsd <= 0) return 0;
  return Math.max(0, Math.round(12 - plan.yearlyUsd / plan.monthlyUsd));
}

export function planNetUsd(plan: StorePlan): number {
  return round2(plan.monthlyUsd - plan.bonusCreditUsd);
}

export function creditShare(plan: StorePlan): number {
  if (plan.monthlyUsd <= 0) return 0;
  return Math.round((plan.bonusCreditUsd / plan.monthlyUsd) * 1000) / 10;
}

export type AffiliateLevel = {
  id: string;
  name: string;
  minActive: number;
  rate: number;
  perks: string[];
};

export const AFFILIATE_LEVELS: AffiliateLevel[] = [
  {
    id: "bronze",
    name: "Bronze",
    minActive: 1,
    rate: 20,
    perks: ["20% recorrente sobre cada loja paga", "Primeiro mes de cada loja como bonus", "Um codigo proprio por loja"],
  },
  {
    id: "prata",
    name: "Prata",
    minActive: 3,
    rate: 25,
    perks: ["25% recorrente sobre cada loja paga", "Bonus de meta de 25 USD", "Parte maior no fundo de bonus"],
  },
  {
    id: "ouro",
    name: "Ouro",
    minActive: 10,
    rate: 30,
    perks: ["30% recorrente sobre cada loja paga", "Bonus de meta de 100 USD", "Parte maxima no fundo de bonus"],
  },
];

export function levelForActive(active: number): AffiliateLevel {
  let level = AFFILIATE_LEVELS[0];
  for (const item of AFFILIATE_LEVELS) {
    if (active >= item.minActive) level = item;
  }
  return level;
}

export function commissionRate(active: number): number {
  return levelForActive(active).rate;
}

export function nextLevelFor(active: number): AffiliateLevel | null {
  for (const item of AFFILIATE_LEVELS) {
    if (active < item.minActive) return item;
  }
  return null;
}

export function storesToNextLevel(active: number): number {
  const next = nextLevelFor(active);
  if (!next) return 0;
  return next.minActive - active;
}

export function firstMonthBonus(planId: string): number {
  const plan = findStorePlan(planId);
  return plan ? plan.monthlyUsd : 0;
}

export type Milestone = { active: number; bonusUsd: number };

export const MILESTONES: Milestone[] = [
  { active: 3, bonusUsd: 25 },
  { active: 10, bonusUsd: 100 },
  { active: 25, bonusUsd: 350 },
];

export function milestoneBonusFor(active: number): number {
  let total = 0;
  for (const item of MILESTONES) {
    if (active >= item.active) total += item.bonusUsd;
  }
  return total;
}

export function nextMilestone(active: number): Milestone | null {
  for (const item of MILESTONES) {
    if (active < item.active) return item;
  }
  return null;
}

export const BONUS_FUND_SHARE = 0.03;
export const BONUS_FUND_CEILING_USD = 250;
export const HOLD_DAYS = 30;
export const PAYOUT_FLOOR_USD = 20;

export function poolFor(networkRevenueUsd: number): number {
  if (networkRevenueUsd <= 0) return 0;
  return round2(networkRevenueUsd * BONUS_FUND_SHARE);
}

export function bonusFundShare(ownReferredUsd: number, networkReferredUsd: number, poolUsd: number, ceiling = BONUS_FUND_CEILING_USD): number {
  if (ownReferredUsd <= 0 || networkReferredUsd <= 0 || poolUsd <= 0) return 0;
  const raw = (ownReferredUsd / networkReferredUsd) * poolUsd;
  return Math.min(round2(raw), ceiling);
}

export type ReferralInput = {
  planId: string;
  monthsActive: number;
  status?: "active" | "cancelled";
};

export type Statement = {
  activeCount: number;
  paidCount: number;
  level: AffiliateLevel;
  rate: number;
  recurringUsd: number;
  firstMonthUsd: number;
  milestonesUsd: number;
  fundUsd: number;
  totalUsd: number;
  pendingUsd: number;
  payableUsd: number;
  nextMilestone: Milestone | null;
};

// Extrato do mes: comissao recorrente das lojas pagas, o primeiro mes como bonus,
// as metas alcancadas e a parte do fundo. O primeiro mes nunca acumula com a comissao.
export function monthlyStatement(referrals: ReferralInput[], fundUsd = 0): Statement {
  const active = referrals.filter(function keep(referral) { return referral.status !== "cancelled"; });
  const paid = active.filter(function keep(referral) { return firstMonthBonus(referral.planId) > 0; });
  const level = levelForActive(paid.length);
  let recurringUsd = 0;
  let firstMonthUsd = 0;
  for (const referral of paid) {
    const price = firstMonthBonus(referral.planId);
    if (referral.monthsActive <= 1) firstMonthUsd += price;
    else recurringUsd += (price * level.rate) / 100;
  }
  const milestonesUsd = milestoneBonusFor(paid.length);
  const fund = round2(Math.max(0, fundUsd));
  const totalUsd = round2(recurringUsd + firstMonthUsd + milestonesUsd + fund);
  return {
    activeCount: active.length,
    paidCount: paid.length,
    level: level,
    rate: level.rate,
    recurringUsd: round2(recurringUsd),
    firstMonthUsd: round2(firstMonthUsd),
    milestonesUsd: milestonesUsd,
    fundUsd: fund,
    totalUsd: totalUsd,
    pendingUsd: totalUsd,
    payableUsd: totalUsd >= PAYOUT_FLOOR_USD ? totalUsd : 0,
    nextMilestone: nextMilestone(paid.length),
  };
}
