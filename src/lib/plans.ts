export type Plan = {
  id: string;
  name: string;
  audience: string;
  tagline: string;
  monthlyUsd: number;
  yearlyUsd: number;
  highlight: boolean;
  features: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "explorador",
    name: "Explorador",
    audience: "Particulares e compradores",
    tagline: "Entrar, procurar e comparar sem custo",
    monthlyUsd: 0,
    yearlyUsd: 0,
    highlight: false,
    cta: "Comecar gratis",
    features: [
      "Acesso as 12 salas comerciais",
      "Pesquisa e comparador de ofertas",
      "Precos na sua moeda",
      "Guardados neste dispositivo",
    ],
  },
  {
    id: "vendedor",
    name: "Vendedor Pro",
    audience: "Vendedores e prestadores",
    tagline: "Publicar, ser encontrado e fechar negocio",
    monthlyUsd: 29,
    yearlyUsd: 290,
    highlight: true,
    cta: "Escolher Vendedor Pro",
    features: [
      "Anuncios ilimitados com galeria",
      "Selo de vendedor verificado",
      "Responder a pedidos de compra",
      "Estatisticas de visitas e contactos",
      "Destaque mensal na montra da sala",
    ],
  },
  {
    id: "empresa",
    name: "Empresa",
    audience: "Empresas e distribuidores",
    tagline: "Equipa, catalogo organizado e alcance",
    monthlyUsd: 99,
    yearlyUsd: 990,
    highlight: false,
    cta: "Escolher Empresa",
    features: [
      "Perfil de empresa com equipa",
      "Catalogo por sala e por marca",
      "Propostas e negociacao com historico",
      "Relatorios de desempenho por sala",
      "Verificacao documental prioritaria",
    ],
  },
  {
    id: "partner",
    name: "Global Partner",
    audience: "Grupos, feiras e redes",
    tagline: "Operar varias salas em varios paises",
    monthlyUsd: 399,
    yearlyUsd: 3990,
    highlight: false,
    cta: "Falar com a equipa",
    features: [
      "Multiplas marcas e paises",
      "Salas privadas com a sua identidade",
      "Integracao com ERP e catalogo externo",
      "Gestor de conta dedicado",
      "Taxas de pagamento negociadas",
    ],
  },
];

export function findPlan(id: string | null | undefined): Plan | null {
  if (!id) return null;
  for (const plan of PLANS) {
    if (plan.id === id) return plan;
  }
  return null;
}
