export type ListingRow = {
  id: string;
  title: string;
  kind: string;
  category: string;
  description: string;
  price: number | null;
  currency: string;
  brand: string | null;
  condition: string | null;
  city: string | null;
  country: string | null;
  images: string[];
  features: string | null;
  is_external: boolean;
  source_store: string | null;
  source_url: string | null;
  stock: number | null;
  quantity: number | null;
  budget_max: number | null;
  deadline: string | null;
  warranty: string | null;
  delivery: string | null;
  returns_policy: string | null;
  views: number;
  status: string;
  created_at: string;
  owner_id: string;
};

export type ProfileRow = {
  id: string;
  display_name: string;
  username: string | null;
  account_type: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
  is_public: boolean;
  company_name: string | null;
  services: string[];
  website: string | null;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  listing_id: string;
  author_id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
};

function shot(seed: string): string[] {
  return [
    "https://picsum.photos/seed/" + seed + "-a/1200/750",
    "https://picsum.photos/seed/" + seed + "-b/1200/750",
    "https://picsum.photos/seed/" + seed + "-c/1200/750",
  ];
}

type Seed = Partial<ListingRow> & { id: string; title: string; kind: string; category: string; owner_id: string };

function listing(seed: Seed): ListingRow {
  const base: ListingRow = {
    id: seed.id,
    title: seed.title,
    kind: seed.kind,
    category: seed.category,
    description: seed.description || "",
    price: seed.price === undefined ? null : seed.price,
    currency: seed.currency || "USD",
    brand: seed.brand || null,
    condition: seed.condition || null,
    city: seed.city || null,
    country: seed.country || null,
    images: seed.images || shot(seed.id),
    features: seed.features || null,
    is_external: Boolean(seed.is_external),
    source_store: seed.source_store || null,
    source_url: seed.source_url || null,
    stock: seed.stock === undefined ? null : seed.stock,
    quantity: seed.quantity === undefined ? null : seed.quantity,
    budget_max: seed.budget_max === undefined ? null : seed.budget_max,
    deadline: seed.deadline || null,
    warranty: seed.warranty || null,
    delivery: seed.delivery || null,
    returns_policy: seed.returns_policy || null,
    views: seed.views || 0,
    status: "active",
    created_at: seed.created_at || "2026-10-18T09:00:00Z",
    owner_id: seed.owner_id,
  };
  return base;
}

export const DEMO_PROFILES: ProfileRow[] = [
  {
    id: "p-1",
    display_name: "Nayda Macuacua",
    username: "nayda",
    account_type: "business",
    avatar_url: "https://picsum.photos/seed/gcnm-nayda/240/240",
    bio: "Distribuicao de materiais de construcao e acabamentos no sul de Mocambique.",
    city: "Maputo",
    country: "Mocambique",
    is_verified: true,
    is_public: true,
    company_name: "Nayda Comercial",
    services: ["Fornecimento", "Entrega em obra"],
    website: null,
    created_at: "2024-11-04T10:00:00Z",
  },
  {
    id: "p-2",
    display_name: "Hilario Chirindza",
    username: "hilario",
    account_type: "provider",
    avatar_url: "https://picsum.photos/seed/gcnm-hilario/240/240",
    bio: "Instalacao e manutencao de sistemas solares e geradores na zona centro.",
    city: "Beira",
    country: "Mocambique",
    is_verified: true,
    is_public: true,
    company_name: "Chirindza Energia",
    services: ["Instalacao solar", "Manutencao de geradores"],
    website: null,
    created_at: "2025-02-19T10:00:00Z",
  },
  {
    id: "p-3",
    display_name: "Sofia Almeida",
    username: "sofia-textil",
    account_type: "business",
    avatar_url: "https://picsum.photos/seed/gcnm-sofia/240/240",
    bio: "Confeccao de uniformes e vestuario profissional para empresas.",
    city: "Lisboa",
    country: "Portugal",
    is_verified: true,
    is_public: true,
    company_name: "Almeida Textil",
    services: ["Confeccao", "Bordados"],
    website: null,
    created_at: "2025-06-02T10:00:00Z",
  },
  {
    id: "p-4",
    display_name: "Amina Sele",
    username: "amina",
    account_type: "business",
    avatar_url: "https://picsum.photos/seed/gcnm-amina/240/240",
    bio: "Sementes, fertilizantes e apoio tecnico a cooperativas agricolas.",
    city: "Nampula",
    country: "Mocambique",
    is_verified: true,
    is_public: true,
    company_name: "Sele Insumos",
    services: ["Insumos agricolas", "Assistencia tecnica"],
    website: null,
    created_at: "2024-08-21T10:00:00Z",
  },
  {
    id: "p-5",
    display_name: "Kofi Boateng",
    username: "kofi",
    account_type: "personal",
    avatar_url: "https://picsum.photos/seed/gcnm-kofi/240/240",
    bio: "Transporte de carga internacional entre Africa Austral e portos.",
    city: "Johannesburg",
    country: "Africa do Sul",
    is_verified: false,
    is_public: true,
    company_name: null,
    services: ["Transporte de carga"],
    website: null,
    created_at: "2026-01-15T10:00:00Z",
  },
];

export const DEMO_LISTINGS: ListingRow[] = [
  listing({
    id: "l-001",
    title: "Sacos de cimento 50kg - paletes completas",
    kind: "product",
    category: "Construcao",
    description:
      "Cimento de uso geral para estrutura e alvenaria. Paletes de 40 sacos, entrega em obra no sul do pais em 48 horas. Preco por saco em compras por palete.",
    price: 320,
    currency: "MZN",
    brand: "Marca nacional",
    condition: "Novo",
    city: "Maputo",
    country: "Mocambique",
    stock: 2400,
    warranty: "Garantia de fabrico de 6 meses",
    delivery: "Entrega em 48h (Grande Maputo)",
    returns_policy: "Troca de lotes com defeito de fabrico",
    features: "Classe 32.5
Paletes de 40 sacos
Descarga incluida no Grande Maputo",
    views: 1840,
    created_at: "2026-10-20T07:40:00Z",
    owner_id: "p-1",
  }),
  listing({
    id: "l-002",
    title: "Painel solar 550W monocristalino",
    kind: "product",
    category: "Energia",
    description:
      "Painel fotovoltaico de 550W, eficiencia 21 por cento, garantia de 12 anos. Ideal para sistemas residenciais e bombagem solar.",
    price: 245,
    currency: "USD",
    brand: "Sunline",
    condition: "Novo",
    city: "Beira",
    country: "Mocambique",
    stock: 480,
    warranty: "12 anos de garantia de producao",
    delivery: "Envio nacional em 3 a 5 dias",
    features: "550W
Monocristalino
Garantia 12 anos
Inclui cabos MC4",
    views: 2210,
    created_at: "2026-10-19T11:15:00Z",
    owner_id: "p-2",
  }),
  listing({
    id: "l-003",
    title: "Gerador diesel 15 kVA silencioso",
    kind: "product",
    category: "Energia",
    description:
      "Gerador industrial 15 kVA, arrefecimento a agua, quadro automatico e tanque de 40 litros. Assistencia tecnica apos venda.",
    price: 4800,
    currency: "USD",
    brand: "PowerTech",
    condition: "Novo",
    city: "Nampula",
    country: "Mocambique",
    stock: 12,
    warranty: "2 anos com manutencao anual",
    delivery: "Levantamento local ou envio",
    features: "15 kVA
Arranque automatico
Baixo ruido",
    views: 940,
    created_at: "2026-10-17T14:05:00Z",
    owner_id: "p-2",
  }),
  listing({
    id: "l-004",
    title: "Trator agricola 75cv com cabine",
    kind: "product",
    category: "Agro",
    description:
      "Trator 75 cv com cabine fechada, ar condicionado e preparacao para charrua e reboque. Revisao completa feita na oficina.",
    price: 18500,
    currency: "USD",
    brand: "FieldPro",
    condition: "Semi-novo",
    city: "Chimoio",
    country: "Mocambique",
    quantity: 3,
    warranty: "6 meses no motor",
    delivery: "Transporte por conta do comprador",
    features: "75 cv
Cabine com ar condicionado
Revisao completa",
    views: 1310,
    created_at: "2026-10-15T08:30:00Z",
    owner_id: "p-4",
  }),
  listing({
    id: "l-005",
    title: "Sementes de milho hibrido - sacos de 25kg",
    kind: "product",
    category: "Agricultura",
    description:
      "Sementes certificadas de milho hibrido para campanhas de sequeiro. Lotes rastreados com boletim de analise.",
    price: 3600,
    currency: "MZN",
    brand: "Sele Insumos",
    condition: "Novo",
    city: "Nampula",
    country: "Mocambique",
    stock: 600,
    warranty: "Garantia de germinacao certificada",
    delivery: "Entrega combinada com cooperativas",
    features: "Sacos de 25kg
Boletim de analise
Assistencia tecnica incluida",
    views: 705,
    created_at: "2026-10-14T09:20:00Z",
    owner_id: "p-4",
  }),
  listing({
    id: "l-006",
    title: "Pedido: 500 uniformes escolares bordados",
    kind: "request",
    category: "Moda e Textil",
    description:
      "Procura-se confeccao de 500 uniformes (camisa e calca) com bordado de emblema. Entrega faseada em duas remessas iguais.",
    price: null,
    currency: "USD",
    budget_max: 9500,
    deadline: "2026-12-05",
    city: "Maputo",
    country: "Mocambique",
    quantity: 500,
    features: "500 unidades
Bordado de emblema
Entrega em duas remessas",
    views: 1120,
    created_at: "2026-10-21T10:05:00Z",
    owner_id: "p-3",
  }),
  listing({
    id: "l-007",
    title: "Pedido: 20 laptops i5 16GB para equipa",
    kind: "request",
    category: "Tecnologia",
    description:
      "Empresa procura 20 portateis com i5, 16GB de memoria e disco SSD, com garantia minima de 12 meses e fatura.",
    price: null,
    currency: "EUR",
    budget_max: 12000,
    deadline: "2026-11-20",
    city: "Lisboa",
    country: "Portugal",
    quantity: 20,
    features: "20 unidades
i5 / 16GB / SSD
Garantia minima 12 meses",
    views: 1560,
    created_at: "2026-10-22T08:10:00Z",
    owner_id: "p-3",
  }),
  listing({
    id: "l-008",
    title: "Consultoria contabilistica mensal para PME",
    kind: "service",
    category: "Servicos",
    description:
      "Acompanhamento mensal de contabilidade, reconciliacoes, obrigacoes fiscais e relatorios de gestao. Equipa certificada.",
    price: 450,
    currency: "EUR",
    city: "Maputo",
    country: "Mocambique",
    delivery: "Reuniao mensal presencial ou remota",
    features: "Fecho mensal
Obrigacoes fiscais
Relatorio de gestao",
    views: 620,
    created_at: "2026-10-13T15:00:00Z",
    owner_id: "p-1",
  }),
  listing({
    id: "l-009",
    title: "Instalacao e manutencao de sistemas solares",
    kind: "service",
    category: "Energia",
    description:
      "Dimensionamento, instalacao e manutencao de sistemas solares residenciais, comerciais e de bombagem. Orcamento sem custo.",
    price: 180,
    currency: "USD",
    city: "Beira",
    country: "Mocambique",
    delivery: "Visita tecnica em 72 horas",
    features: "Projeto e dimensionamento
Instalacao certificada
Contrato de manutencao",
    views: 980,
    created_at: "2026-10-12T07:45:00Z",
    owner_id: "p-2",
  }),
  listing({
    id: "l-010",
    title: "Transporte de carga 30t rota Maputo - Johannesburg",
    kind: "service",
    category: "Logistica",
    description:
      "Servico de transporte internacional de carga geral, com seguradora, rastreio por GPS e desembaraco documental.",
    price: 1400,
    currency: "USD",
    city: "Maputo",
    country: "Mocambique",
    delivery: "Saida semanal as tercas-feiras",
    features: "Camiao 30t
Rastreio GPS
Seguro de carga incluido",
    views: 1440,
    created_at: "2026-10-16T12:30:00Z",
    owner_id: "p-5",
  }),
  listing({
    id: "l-011",
    title: "Camioes usados 10t - frota de 4 unidades",
    kind: "product",
    category: "Logistica",
    description:
      "Frota de quatro camioes de 10 toneladas, revisao recente e documentacao em ordem. Venda em conjunto ou unitaria.",
    price: 62000,
    currency: "ZAR",
    brand: "FleetLine",
    condition: "Usado",
    city: "Johannesburg",
    country: "Africa do Sul",
    quantity: 4,
    warranty: "Inspecao mecanica independente disponivel",
    delivery: "Entrega em Moeda local entrega a combinar",
    features: "4 unidades 10t
Revisao recente
Documentacao em ordem",
    views: 2010,
    created_at: "2026-10-11T09:00:00Z",
    owner_id: "p-5",
  }),
  listing({
    id: "l-012",
    title: "Pecas de reposicao para maquinas de costura industrial",
    kind: "product",
    category: "Industria",
    description:
      "Kit de pecas de desgaste para maquinas de costura industrial: agulhas, aneis, tensores e rolamentos. Disponivel por unidade.",
    price: 42,
    currency: "USD",
    brand: "StitchParts",
    condition: "Novo",
    city: "Matola",
    country: "Mocambique",
    stock: 1500,
    delivery: "Envio em 48 horas",
    features: "Componentes originais
Disponivel por unidade
Envio rapido",
    views: 380,
    created_at: "2026-10-10T13:20:00Z",
    owner_id: "p-3",
  }),
];

export const DEMO_REVIEWS: ReviewRow[] = [
  { id: "r-1", listing_id: "l-001", author_id: "p-2", rating: 5, comment: "Paletes completas e descarga rapida. Recomendo.", status: "published", created_at: "2026-10-18T09:00:00Z" },
  { id: "r-2", listing_id: "l-001", author_id: "p-4", rating: 4, comment: "Bom material, entrega no prazo combinado.", status: "published", created_at: "2026-10-16T09:00:00Z" },
  { id: "r-3", listing_id: "l-002", author_id: "p-1", rating: 5, comment: "Paineis a produzir acima do esperado no primeiro mes.", status: "published", created_at: "2026-10-17T09:00:00Z" },
  { id: "r-4", listing_id: "l-009", author_id: "p-4", rating: 5, comment: "Equipa tecnica muito organizada e explicou tudo.", status: "published", created_at: "2026-10-14T09:00:00Z" },
  { id: "r-5", listing_id: "l-010", author_id: "p-3", rating: 4, comment: "Carga chegou completa e com rastreio sempre atualizado.", status: "published", created_at: "2026-10-15T09:00:00Z" },
  { id: "r-6", listing_id: "l-005", author_id: "p-1", rating: 5, comment: "Sementes com boletim de analise, tudo em ordem.", status: "published", created_at: "2026-10-13T09:00:00Z" },
];
