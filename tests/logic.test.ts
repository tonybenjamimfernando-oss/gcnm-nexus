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
