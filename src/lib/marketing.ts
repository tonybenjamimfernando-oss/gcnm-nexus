// Motor de marketing: decide o que fazer hoje, escreve o texto de cada canal,
// marca os links para medir e pontua as bases da loja.
// Tudo sai de dados reais da loja, sem depender de servicos externos.

export type MarketingChannel = { id: string; label: string; blurb: string; best: string };

export const MARKETING_CHANNELS: MarketingChannel[] = [
  { id: "whatsapp", label: "WhatsApp", blurb: "Mensagem direta para clientes fieis e grupos.", best: "Ofertas do dia e reposicao de stock." },
  { id: "instagram", label: "Instagram", blurb: "Publicacao com imagem da oferta principal.", best: "Mostrar produto novo e bastidores." },
  { id: "facebook", label: "Facebook", blurb: "Publicacao e partilha em grupos da zona.", best: "Alcancar a cidade e a regiao." },
  { id: "linkedin", label: "LinkedIn", blurb: "Caso de cliente e oferta para empresas.", best: "Vendas a empresas e parcerias." },
  { id: "x", label: "X", blurb: "Nota curta com ligacao direta.", best: "Novidades rapidas e conversa publica." },
  { id: "email", label: "Email", blurb: "Resumo da semana para a lista de contactos.", best: "Reativar quem comprou antes." },
  { id: "sms", label: "SMS", blurb: "Aviso urgente para quem ja confia na loja.", best: "Promocao relampago de poucas horas." },
];

export const MARKETING_RULES = [
  "Responder a cada mensagem em menos de duas horas: a resposta rapida e o que fecha a venda.",
  "Publicar tres vezes por semana, sempre com o link marcado para saber de onde vem o cliente.",
  "Usar o link de afiliado em vez do link simples, para o credito ficar registado.",
  "Repetir a oferta que ja funcionou antes de inventar uma nova.",
  "Mostrar preco e prazo na publicacao: reduz perguntas e traz contactos serios.",
];

export type StoreBrief = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  city: string | null;
  category: string | null;
  tagline: string | null;
  tier: string;
  url: string;
  refCode: string | null;
};

export function storeBrief(input: { id?: string; ownerId?: string; name: string; slug: string; city?: string | null; category?: string | null; tagline?: string | null; tier?: string; url: string; refCode?: string | null }): StoreBrief {
  return {
    id: input.id || "",
    ownerId: input.ownerId || "",
    name: input.name,
    slug: input.slug,
    city: input.city || null,
    category: input.category || null,
    tagline: input.tagline || null,
    tier: input.store.tier || "starter",
    url: input.url,
    refCode: input.refCode || null,
  };
}

export function utmLink(baseUrl: string, params: { source: string; medium: string; campaign: string; ref?: string | null }): string {
  const parts = [
    "utm_source=" + encodeURIComponent(params.source),
    "utm_medium=" + encodeURIComponent(params.medium),
    "utm_campaign=" + encodeURIComponent(params.campaign),
  ];
  if (params.ref) parts.push("ref=" + encodeURIComponent(params.ref));
  const clean = baseUrl.split("#")[0];
  return clean + (clean.indexOf("?") === -1 ? "?" : "&") + parts.join("&");
}

export function tagify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export type CampaignCopy = { channel: string; label: string; headline: string; body: string; hashtags: string[]; link: string };

function channelCopy(channel: string, store: StoreBrief, promo: string, link: string): { headline: string; body: string } {
  const where = store.city ? " em " + store.city : "";
  const category = store.category ? store.category : "produtos e servicos";
  if (channel === "whatsapp") {
    return {
      headline: store.name + ": " + promo,
      body: "Ola! Aqui e a " + store.name + where + ".\n" + promo + "\nVe o catalogo e fala connosco por aqui: " + link,
    };
  }
  if (channel === "instagram") {
    return {
      headline: store.name + " | " + category + where,
      body: promo + "\n" + (store.tagline ? store.tagline + "\n" : "") + "Encomendas pelo link: " + link,
    };
  }
  if (channel === "facebook") {
    return {
      headline: "Novidade na " + store.name + where,
      body: promo + "\nEscrevemos a quem procura " + category + " na zona. Fala com a nossa equipa: " + link,
    };
  }
  if (channel === "linkedin") {
    return {
      headline: store.name + ": " + promo,
      body: promo + "\nTrabalhamos " + category + " com empresas." + (store.tagline ? " " + store.tagline + "." : "") + "\nProposta e prazos: " + link,
    };
  }
  if (channel === "x") {
    return { headline: store.name, body: promo + " " + link };
  }
  if (channel === "email") {
    return {
      headline: "Resumo da semana: " + store.name,
      body: "Boa tarde,\n" + promo + "\n" + (store.tagline ? store.tagline + "\n" : "") + "Catalogo completo e encomendas: " + link + "\n\nEquipa " + store.name,
    };
  }
  return { headline: store.name + ": " + promo, body: promo + " Responde a esta mensagem ou ve aqui: " + link };
}

export function campaignKit(store: StoreBrief, offer: string, refCode: string | null = null): CampaignCopy[] {
  const promo = offer.trim().length > 0 ? offer.trim() : "Temos novidades esta semana com entrega rapida.";
  const category = store.category ? store.category : "produtos e servicos";
  return MARKETING_CHANNELS.map(function build(channel) {
    const link = utmLink(store.url, { source: channel.id, medium: "social", campaign: "semente-" + store.slug, ref: refCode || store.refCode });
    const copy = channelCopy(channel.id, store, promo, link);
    const tags = [tagify(store.name), tagify(store.city || "maputo"), tagify(category)].filter(function keep(tag) { return tag.length > 0; });
    return { channel: channel.id, label: channel.label, headline: copy.headline, body: copy.body, hashtags: tags, link: link };
  });
}

export type MarketingInput = {
  store: StoreBrief;
  listings: number;
  affiliates: number;
  services: string[];
  campaigns: number;
  liveCampaigns: number;
  visits: number;
  channelsUsed: string[];
  daysSinceLaunch: number;
  hasContacts: boolean;
  hasDescription: boolean;
};

export type MarketingTask = { id: string; title: string; detail: string; route: string; minutes: number; impact: "alto" | "medio" | "base" };

export function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}

export function marketingPlan(input: MarketingInput): MarketingTask[] {
  const tasks: MarketingTask[] = [];
  if (!input.hasDescription) {
    tasks.push({ id: "descricao", title: "Escrever a descricao da loja", detail: "Duas frases sobre o que vendes e onde entregas: e o texto que aparece na pesquisa e nas partilhas.", route: "/lojas/painel", minutes: 10, impact: "alto" });
  }
  if (input.listings < 3) {
    tasks.push({ id: "ofertas", title: "Publicar pelo menos tres ofertas", detail: "Com menos de tres ofertas a montra nao se sustenta: cada oferta e uma porta de entrada na pesquisa.", route: "/publicar", minutes: 25, impact: "alto" });
  }
  if (!input.hasContacts) {
    tasks.push({ id: "contactos", title: "Deixar email e telefone na loja", detail: "Sem contacto nao ha fecho: quem procura quer falar hoje.", route: "/lojas/painel", minutes: 5, impact: "alto" });
  }
  if (input.campaigns === 0) {
    tasks.push({ id: "campanhas", title: "Lancar a primeira campanha", detail: "Gera o texto do canal, marca o link e guarda. Uma campanha por canal ja poe a loja a circular.", route: "/marketing", minutes: 15, impact: "alto" });
  }
  if (input.affiliates === 0) {
    tasks.push({ id: "afiliados", title: "Gerar um codigo de afiliado", detail: "Cada afiliado traz clientes por comissao: so pagas quando a venda acontece.", route: "/lojas/painel", minutes: 5, impact: "medio" });
  }
  if (input.channelsUsed.length < 2) {
    tasks.push({ id: "canais", title: "Abrir um segundo canal", detail: "Um canal so limita a loja. Junta o canal onde a tua zona conversa ao que ja funciona.", route: "/marketing", minutes: 10, impact: "medio" });
  }
  if (input.visits === 0) {
    tasks.push({ id: "medir", title: "Partilhar um link marcado", detail: "Sem links marcados nao se sabe de onde vem o cliente: usa sempre o texto gerado aqui.", route: "/marketing", minutes: 5, impact: "medio" });
  }
  if (input.campaigns > 0 && input.liveCampaigns === 0) {
    tasks.push({ id: "ativar", title: "Pôr uma campanha a andar", detail: "Tens campanhas guardadas por lancar: ativa a que ja esta escrita.", route: "/marketing", minutes: 5, impact: "medio" });
  }
  if (input.store.tier === "starter") {
    tasks.push({ id: "plano", title: "Passar ao Pro para cobrar online", detail: "O Pro liga pagamentos, entregas e reservas e devolve saldo de bonus todos os meses.", route: "/lojas", minutes: 5, impact: "base" });
  }
  if (input.store.tier !== "starter" && input.services.length < 4) {
    tasks.push({ id: "servicos", title: "Ligar mais servicos do plano", detail: "Ja pagas por eles: liga pagamentos, entregas e reservas para nao deixar valor na mesa.", route: "/lojas/painel", minutes: 10, impact: "base" });
  }
  if (input.daysSinceLaunch >= 30 && input.campaigns >= 3) {
    tasks.push({ id: "revisao", title: "Rever o que funcionou no ultimo mes", detail: "Le as visitas por canal e repete a campanha que trouxe mais gente.", route: "/marketing", minutes: 15, impact: "base" });
  }
  tasks.push({ id: "cadencia", title: "Cumprir a cadencia da semana", detail: "Sete dias, sete toques: e o ritmo que mantem a loja presente sem gastar em anuncios.", route: "/marketing", minutes: 45, impact: "base" });
  const RANK: Record<string, number> = { alto: 0, medio: 1, base: 2 };
  return tasks.sort(function order(a, b) { return RANK[a.impact] - RANK[b.impact] || a.minutes - b.minutes; });
}

export function scoreChecks(input: MarketingInput): Array<{ id: string; weight: number; done: boolean }> {
  return [
    { id: "descricao", weight: 12, done: input.hasDescription },
    { id: "ofertas", weight: 14, done: input.listings >= 3 },
    { id: "contactos", weight: 12, done: input.hasContacts },
    { id: "afiliados", weight: 10, done: input.affiliates > 0 },
    { id: "campanhas", weight: 16, done: input.campaigns > 0 },
    { id: "ativas", weight: 10, done: input.liveCampaigns > 0 },
    { id: "canais", weight: 10, done: input.channelsUsed.length >= 2 },
    { id: "visitas", weight: 8, done: input.visits > 0 },
    { id: "plano", weight: 8, done: input.store.tier !== "starter" },
  ];
}

export function marketingScore(input: MarketingInput): number {
  let total = 0;
  for (const check of scoreChecks(input)) {
    if (check.done) total += check.weight;
  }
  return total;
}

export function scoreGrade(score: number): string {
  if (score >= 90) return "Impecavel";
  if (score >= 70) return "Forte";
  if (score >= 40) return "Em marcha";
  return "A construir";
}

export type CadenceDay = { day: string; channel: string; action: string };

export function cadenceWeek(): CadenceDay[] {
  return [
    { day: "Segunda", channel: "WhatsApp", action: "Mensagem com a novidade da semana para clientes fieis." },
    { day: "Terca", channel: "Instagram", action: "Publicacao com foto real da oferta principal." },
    { day: "Quarta", channel: "Facebook", action: "Partilha em grupos da zona com o link marcado." },
    { day: "Quinta", channel: "LinkedIn", action: "Caso de um cliente e oferta para empresas." },
    { day: "Sexta", channel: "Email", action: "Resumo da semana e uma oferta exclusiva." },
    { day: "Sabado", channel: "SMS", action: "Promocao relampago de poucas horas." },
    { day: "Domingo", channel: "X", action: "Conversa publica com uma pergunta aos clientes." },
  ];
}

export function seoFor(store: StoreBrief): { title: string; description: string; keywords: string[] } {
  const city = store.city ? store.city : "";
  const category = store.category ? store.category : "loja digital";
  const title = store.name + " | " + category + (city ? " em " + city : "") + " | GCNM Nexus";
  const description = (store.tagline ? store.tagline + ". " : "") + "Loja digital no GCNM Nexus com catalogo, mensagens e pagamentos" + (city ? ", em " + city : "") + ".";
  const keywords = [store.name, category, city, "loja digital", "GCNM Nexus"].filter(function keep(item) { return item.length > 0; });
  return { title: title, description: description, keywords: keywords };
}
