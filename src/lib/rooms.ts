import {
  Briefcase,
  Car,
  Cpu,
  Factory,
  GraduationCap,
  Hammer,
  HeartPulse,
  Shirt,
  Sofa,
  Sprout,
  Sun,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type RoomModule = {
  id: string;
  label: string;
  blurb: string;
  to: string;
  external: boolean;
};

export type Room = {
  slug: string;
  name: string;
  tagline: string;
  audience: string;
  accent: string;
  keywords: string[];
  icon: LucideIcon;
  modules: RoomModule[];
};

type RoomSeed = {
  slug: string;
  name: string;
  tagline: string;
  audience: string;
  accent: string;
  keywords: string[];
  icon: LucideIcon;
};

const SEEDS: RoomSeed[] = [
  {
    slug: "agro-alimentos",
    name: "Agro e Alimentos",
    tagline: "Do campo a mesa, com rastreio",
    audience: "Produtores, cooperativas, distribuidores e retail alimentar",
    accent: "#6ce0c2",
    keywords: ["agro", "agricultura", "alimento", "fazenda", "semente", "fertilizante", "milho", "cafe"],
    icon: Sprout,
  },
  {
    slug: "tecnologia",
    name: "Tecnologia e Eletronica",
    tagline: "Equipamento, software e assistencia",
    audience: "Importadores, integradores, lojas e equipas de TI",
    accent: "#4d93ff",
    keywords: ["tecno", "eletro", "electron", "computador", "laptop", "telemovel", "software", "hardware"],
    icon: Cpu,
  },
  {
    slug: "construcao",
    name: "Construcao e Materiais",
    tagline: "Obra completa, do cimento ao acabamento",
    audience: "Empreiteiros, arquitetos, armazens e promotores",
    accent: "#ffc46b",
    keywords: ["constru", "cimento", "material", "obra", "ferramenta", "tijolo", "ferro"],
    icon: Hammer,
  },
  {
    slug: "moda-textil",
    name: "Moda e Textil",
    tagline: "Producao, marca e escala",
    audience: "Fabricas, ateliers, marcas e distribuidores",
    accent: "#8a5cff",
    keywords: ["moda", "roupa", "textil", "tecido", "calcado", "uniforme", "vestuario"],
    icon: Shirt,
  },
  {
    slug: "saude",
    name: "Saude e Farmaceutico",
    tagline: "Material clinico e consumiveis",
    audience: "Clinicas, hospitais, farmacias e distribuidores",
    accent: "#35d6f5",
    keywords: ["saude", "medic", "farmac", "clinica", "hospitalar", "laboratorio"],
    icon: HeartPulse,
  },
  {
    slug: "logistica",
    name: "Logistica e Transporte",
    tagline: "Carga, rota e armazem",
    audience: "Transportadores, transitarios, comercio e industria",
    accent: "#6ce0c2",
    keywords: ["logistic", "transport", "frete", "entrega", "carga", "armazem", "camiao"],
    icon: Truck,
  },
  {
    slug: "energia",
    name: "Energia e Solar",
    tagline: "Geracao, armazenamento e eficiencia",
    audience: "Instaladores, projetos solares, industria e particulares",
    accent: "#ffc46b",
    keywords: ["energia", "solar", "painel", "gerador", "bateria", "inversor", "electric"],
    icon: Sun,
  },
  {
    slug: "industria",
    name: "Industria e Maquinaria",
    tagline: "Linhas de producao e reposicao",
    audience: "Fabricas, oficinas, manutencao e engenharia",
    accent: "#4d93ff",
    keywords: ["industria", "maquina", "equipamento", "fabrica", "peca", "motor"],
    icon: Factory,
  },
  {
    slug: "servicos",
    name: "Servicos Profissionais",
    tagline: "Talento tecnico, por projeto ou mensal",
    audience: "Empresas, consultores, contabilistas e agencias",
    accent: "#8a5cff",
    keywords: ["servico", "consultoria", "contabil", "juridic", "marketing", "formacao", "auditoria"],
    icon: Briefcase,
  },
  {
    slug: "casa",
    name: "Casa e Decoracao",
    tagline: "Interior, mobiliario e acabamento",
    audience: "Lojas, decoradores, hoteis e promotores",
    accent: "#ffc46b",
    keywords: ["casa", "movel", "decor", "mobilia", "interior", "colchao", "cozinha"],
    icon: Sofa,
  },
  {
    slug: "automovel",
    name: "Automovel e Pecas",
    tagline: "Veiculos, pecas e oficina",
    audience: "Standes, oficinas, frotas e importadores",
    accent: "#35d6f5",
    keywords: ["auto", "carro", "veiculo", "peca", "pneu", "moto", "camiao"],
    icon: Car,
  },
  {
    slug: "educacao",
    name: "Educacao e Formacao",
    tagline: "Competencias que abrem mercado",
    audience: "Escolas, formadores, empresas e candidatos",
    accent: "#6ce0c2",
    keywords: ["educa", "formacao", "curso", "treinamento", "escola", "certificacao"],
    icon: GraduationCap,
  },
];

function moduleList(room: RoomSeed): RoomModule[] {
  const base = "/explorar?sala=" + room.slug;
  const page = "/salas/" + room.slug;
  return [
    {
      id: "montra",
      label: "Montra da sala",
      blurb: "O que esta a mover o mercado de " + room.name.toLowerCase() + " agora.",
      to: base,
      external: false,
    },
    {
      id: "catalogo",
      label: "Catalogo de produtos",
      blurb: "Produtos disponiveis com quantidade, condicao e garantia.",
      to: base + "&tipo=product",
      external: false,
    },
    {
      id: "pedidos",
      label: "Pedidos de compra",
      blurb: "Procura aberta: quem precisa, quantidade e prazo.",
      to: base + "&tipo=request",
      external: false,
    },
    {
      id: "servicos",
      label: "Servicos e assistencia",
      blurb: "Instalacao, manutencao, consultoria e mao de obra especializada.",
      to: base + "&tipo=service",
      external: false,
    },
    {
      id: "oportunidades",
      label: "Oportunidades e parcerias",
      blurb: "Representacao, distribuicao e joint ventures no sector.",
      to: base + "&tipo=opportunity",
      external: false,
    },
    {
      id: "comparador",
      label: "Comparador de ofertas",
      blurb: "Compare ate tres ofertas lado a lado antes de decidir.",
      to: base + "&vista=comparar",
      external: false,
    },
    {
      id: "tendencias",
      label: "Tendencias de preco",
      blurb: "Faixas de preco, volume e cidades com mais atividade.",
      to: page + "#tendencias",
      external: true,
    },
    {
      id: "logistica",
      label: "Logistica e entrega",
      blurb: "Transporte, armazenagem e servicos ligados a entrega.",
      to: page + "#logistica",
      external: true,
    },
    {
      id: "pagamentos",
      label: "Pagamento e moedas",
      blurb: "Precos na sua moeda e condicoes de pagamento por plano.",
      to: "/planos",
      external: false,
    },
    {
      id: "confianca",
      label: "Verificacao e confianca",
      blurb: "Como validamos vendedores, avaliacoes e denuncias.",
      to: page + "#confianca",
      external: true,
    },
  ];
}

export const ROOMS: Room[] = SEEDS.map(function build(seed) {
  return {
    slug: seed.slug,
    name: seed.name,
    tagline: seed.tagline,
    audience: seed.audience,
    accent: seed.accent,
    keywords: seed.keywords,
    icon: seed.icon,
    modules: moduleList(seed),
  };
});

export const MODULE_COUNT = 10;

export function findRoom(slug: string | null | undefined): Room | null {
  if (!slug) return null;
  for (const room of ROOMS) {
    if (room.slug === slug) return room;
  }
  return null;
}

export function roomName(slug: string | null | undefined): string {
  const room = findRoom(slug);
  return room ? room.name : "Todas as salas";
}
