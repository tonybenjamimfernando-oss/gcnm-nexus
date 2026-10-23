export type StoreService = {
  key: string;
  label: string;
  blurb: string;
  tier: "starter" | "pro" | "scale";
};

export const STORE_SERVICES: StoreService[] = [
  { key: "vitrine", label: "Vitrine publica", blurb: "Pagina propria da loja, pronta a partilhar.", tier: "starter" },
  { key: "catalogo", label: "Catalogo", blurb: "Produtos, servicos e pedidos numa so lista.", tier: "starter" },
  { key: "mensagens", label: "Mensagens", blurb: "Conversas com compradores dentro da plataforma.", tier: "starter" },
  { key: "pagamentos", label: "Pagamentos", blurb: "Cobranca com Stripe em varias moedas.", tier: "pro" },
  { key: "entregas", label: "Entregas", blurb: "Prazos, transportadoras e recolha local.", tier: "pro" },
  { key: "reservas", label: "Reservas", blurb: "Marcacoes e disponibilidade para servicos.", tier: "pro" },
  { key: "equipa", label: "Equipa", blurb: "Gestores e agentes com acesso controlado.", tier: "pro" },
  { key: "afiliados", label: "Afiliados", blurb: "Codigos proprios com comissao por venda.", tier: "scale" },
  { key: "analitica", label: "Analitica", blurb: "Visitas, conversao e desempenho por oferta.", tier: "scale" },
  { key: "subscricoes", label: "Subscricoes", blurb: "Planos recorrentes para clientes fieis.", tier: "scale" },
];

export type StoreTier = { key: "starter" | "pro" | "scale"; label: string; blurb: string };

export const STORE_TIERS: StoreTier[] = [
  { key: "starter", label: "Starter", blurb: "abrir a loja e vender direto" },
  { key: "pro", label: "Pro", blurb: "pagamentos, entregas, reservas e equipa" },
  { key: "scale", label: "Scale", blurb: "afiliados, analitica e subscricoes" },
];

export const STORE_CATEGORIES = [
  "Energia",
  "Construcao",
  "Tecnologia",
  "Moda e artesanato",
  "Alimentacao",
  "Logistica",
  "Saude",
  "Educacao",
  "Servicos profissionais",
  "Comercio geral",
];

const RANK: Record<string, number> = { starter: 1, pro: 2, scale: 3 };

export function tierRank(tier: string): number {
  return RANK[tier] || 1;
}

export function servicesForTier(tier: string): StoreService[] {
  const rank = tierRank(tier);
  return STORE_SERVICES.filter(function fits(service) {
    return tierRank(service.tier) <= rank;
  });
}

export function defaultServices(tier: string): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const service of STORE_SERVICES) state[service.key] = tierRank(service.tier) <= tierRank(tier);
  return state;
}

export function serviceLabel(key: string): string {
  const found = STORE_SERVICES.filter(function find(service) {
    return service.key === key;
  })[0];
  return found ? found.label : key;
}

export function tierLabel(tier: string): string {
  const found = STORE_TIERS.filter(function find(item) {
    return item.key === tier;
  })[0];
  return found ? found.label : tier;
}
