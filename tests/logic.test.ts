import { describe, expect, it } from "vitest";
import { getListing, listListings, listReviews, roomForListing } from "@/lib/api";
import { CURRENCIES, PRIORITY_CURRENCIES, currencyName, isKnownCurrency } from "@/lib/currencies";
import { convert, formatMoney, initials, listingKindLabel, statusLabel } from "@/lib/format";
import { isFeatured } from "@/lib/featured";
import { PLANS, findPlan } from "@/lib/plans";
import { hasRate } from "@/lib/rates";
import { MODULE_COUNT, ROOMS, findRoom, roomName } from "@/lib/rooms";
import { STORE_SERVICES, STORE_TIERS, defaultServices } from "@/lib/storeServices";
import { affiliateCode, getStoreBySlug, listStores, slugFrom } from "@/lib/stores";
import { BONUS_FUND_CEILING_USD, STORE_PLANS, annualSaving, bonusFundShare, commissionRate, creditShare, firstMonthBonus, levelForActive, monthlyStatement, nextLevelFor, planNetUsd, planPrice, poolFor, round2, storesToNextLevel } from "@/lib/economy";
import { MARKETING_CHANNELS, cadenceWeek, campaignKit, daysSince, marketingPlan, marketingScore, scoreChecks, scoreGrade, seoFor, storeBrief, utmLink } from "@/lib/marketing";
import type { MarketingInput } from "@/lib/marketing";
import { commissionKindLabel, commissionTotals } from "@/lib/marketingData";

describe("salas comerciais", () => {
  it("tem doze salas, cada uma com dez modulos", () => {
    expect(ROOMS.length).toBe(12);
    for (const room of ROOMS) {
      expect(room.modules.length).toBe(MODULE_COUNT);
    }
  });

  it("encontra a sala por identificador", () => {
    const first = ROOMS[0];
    expect(findRoom(first.slug)?.name).toBe(first.name);
    expect(roomName(first.slug)).toBe(first.name);
    expect(findRoom("sala-inexistente")).toBeNull();
  });
});

describe("moedas e formatacao", () => {
  it("conhece as moedas iso e as prioritarias", () => {
    expect(CURRENCIES.length).toBeGreaterThan(100);
    expect(isKnownCurrency("USD")).toBe(true);
    expect(isKnownCurrency("ZZZ")).toBe(false);
    expect(currencyName("EUR").length).toBeGreaterThan(0);
    expect(PRIORITY_CURRENCIES.filter(hasRate).length).toBeGreaterThan(0);
  });

  it("converte e formata valores", () => {
    expect(convert(100, "USD", "USD")).toBe(100);
    expect(convert(100, "USD", "EUR")).toBeGreaterThan(0);
    expect(formatMoney(1234.5, "USD").length).toBeGreaterThan(3);
    expect(initials("Ana Silva").length).toBeGreaterThan(0);
    expect(listingKindLabel("product").length).toBeGreaterThan(0);
    expect(statusLabel("active").length).toBeGreaterThan(0);
  });
});

describe("jornada de explorar e abrir anuncio", () => {
  it("lista ofertas do modo demo e abre a primeira", async () => {
    const items = await listListings({ sort: "recent", limit: 6 });
    expect(items.length).toBeGreaterThan(0);
    const first = items[0];
    expect(typeof first.id).toBe("string");
    const found = await getListing(first.id);
    expect(found?.id).toBe(first.id);
    expect(found?.title).toBe(first.title);
    const reviews = await listReviews(first.id);
    expect(Array.isArray(reviews)).toBe(true);
  });

  it("encaminha as ofertas para as salas", async () => {
    const items = await listListings({ sort: "recent", limit: 12 });
    const withRoom = items.filter(function known(item) {
      return roomForListing({ title: item.title, category: item.category, brand: item.brand }) !== null;
    });
    expect(withRoom.length).toBeGreaterThan(0);
  });
});

describe("planos e destaques", () => {
  it("tem planos com preco mensal definido", () => {
    expect(PLANS.length).toBeGreaterThan(0);
    const first = PLANS[0];
    expect(findPlan(first.id)?.name).toBe(first.name);
    expect(first.monthlyUsd).toBeGreaterThanOrEqual(0);
    expect(findPlan("plano-inexistente")).toBeNull();
  });

  it("so considera destaque enquanto a data nao passou", () => {
    expect(isFeatured({ featuredUntil: null })).toBe(false);
    expect(isFeatured({ featuredUntil: new Date(Date.now() + 86400000).toISOString() })).toBe(true);
    expect(isFeatured({ featuredUntil: new Date(Date.now() - 86400000).toISOString() })).toBe(false);
  });
});

describe("incubadora de lojas", () => {
  it("tem dez servicos e tres niveis", () => {
    expect(STORE_SERVICES.length).toBe(10);
    expect(STORE_TIERS.length).toBe(3);
    expect(defaultServices("starter").pagamentos).toBe(false);
    expect(defaultServices("pro").pagamentos).toBe(true);
    expect(defaultServices("scale").analitica).toBe(true);
  });

  it("lista lojas e abre pelo endereco", async () => {
    const stores = await listStores({});
    expect(stores.length).toBeGreaterThan(0);
    const found = await getStoreBySlug(stores[0].slug);
    expect(found?.name).toBe(stores[0].name);
    expect(await getStoreBySlug("loja-inexistente")).toBeNull();
  });

  it("gera endereco e codigo de afiliado", () => {
    expect(slugFrom("Solar Lusitana & Cia")).toBe("solar-lusitana-cia");
    expect(affiliateCode("solar-lusitana").length).toBeGreaterThan(6);
  });
});

describe("motor economico", () => {
  it("sobe de nivel com lojas pagas ativas", () => {
    expect(levelForActive(0).id).toBe("bronze");
    expect(commissionRate(0)).toBe(20);
    expect(levelForActive(2).id).toBe("bronze");
    expect(levelForActive(3).id).toBe("prata");
    expect(commissionRate(9)).toBe(25);
    expect(levelForActive(10).id).toBe("ouro");
    expect(commissionRate(25)).toBe(30);
    expect(storesToNextLevel(2)).toBe(1);
    expect(nextLevelFor(25)).toBeNull();
  });

  it("mantem cada plano pago com margem positiva", () => {
    for (const plan of STORE_PLANS) {
      if (plan.monthlyUsd === 0) continue;
      expect(planNetUsd(plan)).toBeGreaterThan(0);
      expect(creditShare(plan)).toBeLessThanOrEqual(70);
      expect(annualSaving(plan)).toBe(2);
      expect(planPrice(plan, "month")).toBe(plan.monthlyUsd);
      expect(planPrice(plan, "year")).toBe(plan.yearlyUsd);
    }
  });

  it("paga o primeiro mes como bonus sem acumular com a comissao", () => {
    expect(firstMonthBonus("pro")).toBe(19);
    expect(firstMonthBonus("vitrine")).toBe(0);
    const statement = monthlyStatement([
      { planId: "pro", monthsActive: 1 },
      { planId: "escala", monthsActive: 6 },
      { planId: "pro", monthsActive: 4 },
      { planId: "vitrine", monthsActive: 8 },
      { planId: "pro", monthsActive: 3, status: "cancelled" },
    ]);
    expect(statement.activeCount).toBe(4);
    expect(statement.paidCount).toBe(3);
    expect(statement.level.id).toBe("prata");
    expect(statement.rate).toBe(25);
    expect(statement.firstMonthUsd).toBe(19);
    expect(statement.recurringUsd).toBe(round2(49 * 0.25 + 19 * 0.25));
    expect(statement.milestonesUsd).toBe(25);
    expect(statement.totalUsd).toBe(61);
    expect(statement.pendingUsd).toBe(61);
    expect(statement.payableUsd).toBe(61);
    expect(statement.nextMilestone ? statement.nextMilestone.active : 0).toBe(10);
  });

  it("reparte o fundo de bonus em proporcao e com teto", () => {
    expect(poolFor(1000)).toBe(30);
    expect(poolFor(0)).toBe(0);
    expect(bonusFundShare(100, 400, 40)).toBe(10);
    expect(bonusFundShare(100, 100, 40)).toBe(40);
    expect(bonusFundShare(400, 400, 400)).toBe(BONUS_FUND_CEILING_USD);
    expect(bonusFundShare(0, 400, 40)).toBe(0);
  });
});

describe("motor de marketing", () => {
  const brief = storeBrief({ name: "Solar Lusitana", slug: "solar-lusitana", city: "Maputo", category: "Energia", tagline: "Energia solar chave na mao", tier: "pro", url: "https://gcnm.example/loja/solar-lusitana", refCode: "SOL123" });
  const emptyInput: MarketingInput = {
    store: storeBrief({ name: "Loja Nova", slug: "loja-nova", url: "https://gcnm.example/loja/loja-nova" }),
    listings: 0, affiliates: 0, services: [], campaigns: 0, liveCampaigns: 0, visits: 0, channelsUsed: [],
    daysSinceLaunch: 2, hasContacts: false, hasDescription: false,
  };
  const fullInput: MarketingInput = {
    store: brief, listings: 8, affiliates: 2, services: ["vitrine", "catalogo", "mensagens", "pagamentos"],
    campaigns: 3, liveCampaigns: 2, visits: 12, channelsUsed: ["whatsapp", "instagram"],
    daysSinceLaunch: 45, hasContacts: true, hasDescription: true,
  };

  it("marca os links para saber de onde vem o cliente", () => {
    const link = utmLink(brief.url, { source: "whatsapp", medium: "social", campaign: "semente-solar-lusitana", ref: "SOL123" });
    expect(link.indexOf("utm_source=whatsapp")).toBeGreaterThan(-1);
    expect(link.indexOf("utm_campaign=semente-solar-lusitana")).toBeGreaterThan(-1);
    expect(link.indexOf("ref=SOL123")).toBeGreaterThan(-1);
    expect(link.indexOf("?")).toBeGreaterThan(-1);
  });

  it("gera texto pronto para cada canal", () => {
    const kit = campaignKit(brief, "Instalacao com 10% de desconto");
    expect(kit.length).toBe(MARKETING_CHANNELS.length);
    const whatsapp = kit.filter(function find(item) { return item.channel === "whatsapp"; })[0];
    expect(whatsapp.body.indexOf("Instalacao com 10% de desconto")).toBeGreaterThan(-1);
    expect(whatsapp.body.indexOf("Solar Lusitana")).toBeGreaterThan(-1);
    expect(whatsapp.link.indexOf("utm_source=whatsapp")).toBeGreaterThan(-1);
    const email = kit.filter(function find(item) { return item.channel === "email"; })[0];
    expect(email.headline.indexOf("Solar Lusitana")).toBeGreaterThan(-1);
  });

  it("aponta o que falta fazer por ordem de impacto", () => {
    const tasks = marketingPlan(emptyInput);
    expect(tasks.length).toBeGreaterThan(4);
    expect(tasks[0].impact).toBe("alto");
    expect(tasks.filter(function find(item) { return item.id === "campanhas"; }).length).toBe(1);
    const ready = marketingPlan(fullInput);
    expect(ready.filter(function find(item) { return item.impact === "alto"; }).length).toBe(0);
    expect(ready.length).toBeLessThan(tasks.length);
  });

  it("pontua as bases de marketing de 0 a 100", () => {
    expect(marketingScore(emptyInput)).toBe(0);
    expect(marketingScore(fullInput)).toBe(100);
    expect(scoreChecks(fullInput).length).toBe(9);
    expect(scoreGrade(100)).toBe("Impecavel");
    expect(scoreGrade(70)).toBe("Forte");
    expect(scoreGrade(20)).toBe("A construir");
  });

  it("mantem a cadencia de sete dias e um SEO util", () => {
    const week = cadenceWeek();
    expect(week.length).toBe(7);
    expect(week[0].day).toBe("Segunda");
    const seo = seoFor(brief);
    expect(seo.title.indexOf("Solar Lusitana")).toBe(0);
    expect(seo.description.indexOf("Maputo")).toBeGreaterThan(-1);
    expect(seo.keywords.indexOf("Energia")).toBeGreaterThan(-1);
    expect(daysSince(new Date().toISOString())).toBe(0);
    expect(daysSince("nao-e-data")).toBe(0);
  });

  it("soma o extrato de comissoes por estado", () => {
    const totals = commissionTotals([
      { id: "1", storeId: "a", storeName: "A", kind: "first_month", amountUsd: 19, period: "2026-10-01", status: "pending", createdAt: "2026-10-01T10:00:00Z" },
      { id: "2", storeId: "a", storeName: "A", kind: "recurring", amountUsd: 8.75, period: "2026-10-01", status: "payable", createdAt: "2026-10-01T10:00:00Z" },
      { id: "3", storeId: "b", storeName: "B", kind: "milestone", amountUsd: 25, period: "2026-09-01", status: "paid", createdAt: "2026-09-01T10:00:00Z" },
    ]);
    expect(totals.pendingUsd).toBe(19);
    expect(totals.payableUsd).toBe(8.75);
    expect(totals.paidUsd).toBe(25);
    expect(totals.totalUsd).toBe(52.75);
    expect(commissionKindLabel("first_month")).toBe("Primeiro mes como bonus");
    expect(commissionKindLabel("fund")).toBe("Fundo de bonus");
  });
});
