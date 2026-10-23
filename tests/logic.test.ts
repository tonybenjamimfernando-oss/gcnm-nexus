import { describe, expect, it } from "vitest";
import { getListing, listListings, listReviews, roomForListing } from "@/lib/api";
import { CURRENCIES, PRIORITY_CURRENCIES, currencyName, isKnownCurrency } from "@/lib/currencies";
import { convert, formatMoney, initials, listingKindLabel, statusLabel } from "@/lib/format";
import { isFeatured } from "@/lib/featured";
import { PLANS, findPlan } from "@/lib/plans";
import { hasRate } from "@/lib/rates";
import { MODULE_COUNT, ROOMS, findRoom, roomName } from "@/lib/rooms";

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
