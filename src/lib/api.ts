import { supabase, isSupabaseReady } from "./supabase";
import { DEMO_LISTINGS, DEMO_PROFILES, DEMO_REVIEWS } from "./demo";
import type { ListingRow, ProfileRow, ReviewRow } from "./demo";
import { CURRENCIES } from "./currencies";
import { ROOMS } from "./rooms";
import { BASE_CURRENCY } from "./rates";

export type ListingView = {
  id: string;
  title: string;
  kind: string;
  category: string;
  description: string;
  price: number | null;
  currency: string;
  city: string | null;
  country: string | null;
  images: string[];
  cover: string;
  brand: string | null;
  condition: string | null;
  warranty: string | null;
  delivery: string | null;
  returnsPolicy: string | null;
  stock: number | null;
  quantity: number | null;
  budgetMax: number | null;
  deadline: string | null;
  views: number;
  status: string;
  createdAt: string;
  isExternal: boolean;
  sourceStore: string | null;
  sourceUrl: string | null;
  ownerId: string;
  ownerName: string;
  ownerUsername: string | null;
  ownerVerified: boolean;
  ownerType: string;
  ownerCity: string | null;
  ownerCountry: string | null;
  ownerSince: string | null;
  rating: number | null;
  reviewCount: number;
};

export type ReviewView = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
};

export type PlatformStats = {
  listings: number;
  verifiedSellers: number;
  rooms: number;
  currencies: number;
};

export type ListOptions = {
  room?: string | null;
  kind?: string | null;
  q?: string | null;
  seller?: string | null;
  sort?: string | null;
  limit?: number;
};

type ReviewStats = { rating: number; count: number };

function demoProfiles(): Map<string, ProfileRow> {
  const map = new Map<string, ProfileRow>();
  for (const profile of DEMO_PROFILES) map.set(profile.id, profile);
  return map;
}

function statsFrom(rows: ReviewRow[]): Map<string, ReviewStats> {
  const acc = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const cur = acc.get(row.listing_id) || { total: 0, count: 0 };
    cur.total += row.rating;
    cur.count += 1;
    acc.set(row.listing_id, cur);
  }
  const out = new Map<string, ReviewStats>();
  acc.forEach(function save(value, key) {
    out.set(key, { rating: Math.round((value.total / value.count) * 10) / 10, count: value.count });
  });
  return out;
}

function toView(row: ListingRow, profiles: Map<string, ProfileRow>, reviews: Map<string, ReviewStats>): ListingView {
  const profile = profiles.get(row.owner_id);
  const stats = reviews.get(row.id);
  const images = row.images && row.images.length > 0 ? row.images : ["https://picsum.photos/seed/" + row.id + "/1200/750"];
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    category: row.category,
    description: row.description,
    price: row.price,
    currency: row.currency || BASE_CURRENCY,
    city: row.city,
    country: row.country,
    images,
    cover: images[0],
    brand: row.brand,
    condition: row.condition,
    warranty: row.warranty,
    delivery: row.delivery,
    returnsPolicy: row.returns_policy,
    stock: row.stock,
    quantity: row.quantity,
    budgetMax: row.budget_max,
    deadline: row.deadline,
    views: row.views || 0,
    status: row.status,
    createdAt: row.created_at,
    isExternal: Boolean(row.is_external),
    sourceStore: row.source_store,
    sourceUrl: row.source_url,
    ownerId: row.owner_id,
    ownerName: profile ? profile.company_name || profile.display_name : "Membro GCNM",
    ownerUsername: profile ? profile.username : null,
    ownerVerified: profile ? profile.is_verified : false,
    ownerType: profile ? profile.account_type : "personal",
    ownerCity: profile ? profile.city : null,
    ownerCountry: profile ? profile.country : null,
    ownerSince: profile ? profile.created_at : null,
    rating: stats ? stats.rating : null,
    reviewCount: stats ? stats.count : 0,
  };
}

export function roomForListing(item: { title: string; category: string; brand?: string | null }): string | null {
  const haystack = (item.title + " " + item.category + " " + (item.brand || "")).toLowerCase();
  for (const room of ROOMS) {
    for (const keyword of room.keywords) {
      if (haystack.indexOf(keyword) !== -1) return room.slug;
    }
  }
  return null;
}

function termsFor(options: ListOptions): string[] {
  const terms: string[] = [];
  const query = (options.q || "").trim().toLowerCase();
  if (query.length > 1) terms.push(query);
  if (options.room) {
    for (const room of ROOMS) {
      if (room.slug === options.room) {
        for (const keyword of room.keywords) terms.push(keyword);
      }
    }
  }
  return terms;
}

function clean(term: string): string {
  return term.replace(/[%,()"*]/g, " ").replace(/\s+/g, " ").trim();
}

function pattern(term: string): string {
  const value = clean(term);
  if (value.length === 0) return "";
  const body = "%" + value + "%";
  return value.indexOf(" ") === -1 ? body : '"' + body + '"';
}

function matches(row: ListingRow, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = (row.title + " " + row.category + " " + (row.brand || "") + " " + row.description).toLowerCase();
  for (const term of terms) {
    const value = clean(term).toLowerCase();
    if (value.length > 1 && haystack.indexOf(value) !== -1) return true;
  }
  return false;
}

function sortRows<T extends { created_at: string; price: number | null; views: number }>(rows: T[], sort?: string | null): T[] {
  const copy = rows.slice();
  if (sort === "price-asc") {
    copy.sort(function asc(a, b) {
      return (a.price === null ? Number.MAX_SAFE_INTEGER : a.price) - (b.price === null ? Number.MAX_SAFE_INTEGER : b.price);
    });
  } else if (sort === "price-desc") {
    copy.sort(function desc(a, b) {
      return (b.price === null ? -1 : b.price) - (a.price === null ? -1 : a.price);
    });
  } else if (sort === "views") {
    copy.sort(function popular(a, b) {
      return b.views - a.views;
    });
  } else {
    copy.sort(function recent(a, b) {
      return a.created_at < b.created_at ? 1 : -1;
    });
  }
  return copy;
}

export async function listListings(options: ListOptions): Promise<ListingView[]> {
  const limit = options.limit || 24;

  if (!isSupabaseReady || !supabase) {
    const terms = termsFor(options);
    let rows = DEMO_LISTINGS.filter(function active(row) {
      return row.status === "active";
    });
    if (options.kind) rows = rows.filter(function byKind(row) {
      return row.kind === options.kind;
    });
    if (options.seller) rows = rows.filter(function bySeller(row) {
      return row.owner_id === options.seller;
    });
    rows = rows.filter(function byTerms(row) {
      return matches(row, terms);
    });
    rows = sortRows(rows, options.sort);
    const views = rows.slice(0, limit).map(function map(row) {
      return toView(row, demoProfiles(), statsFrom(DEMO_REVIEWS));
    });
    return views;
  }

  let query = supabase.from("listings").select("*").eq("status", "active");
  if (options.kind) query = query.eq("kind", options.kind);
  if (options.seller) query = query.eq("owner_id", options.seller);

  const clauses: string[] = [];
  const terms = termsFor(options);
  for (const term of terms) {
    const value = pattern(term);
    if (!value) continue;
    clauses.push("title.ilike." + value);
    clauses.push("category.ilike." + value);
    clauses.push("brand.ilike." + value);
    if (clauses.length > 18) break;
  }
  if (clauses.length > 0) query = query.or(clauses.join(","));

  if (options.sort === "price-asc") query = query.order("price", { ascending: true, nullsFirst: false });
  else if (options.sort === "price-desc") query = query.order("price", { ascending: false, nullsFirst: false });
  else if (options.sort === "views") query = query.order("views", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const result = await query.limit(limit);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as ListingRow[];
  const profileMap = await fetchProfiles(rows.map(function owner(row) {
    return row.owner_id;
  }));
  const reviewMap = await fetchReviewStats(rows.map(function id(row) {
    return row.id;
  }));
  return rows.map(function view(row) {
    return toView(row, profileMap, reviewMap);
  });
}

export async function getListing(id: string): Promise<ListingView | null> {
  if (!isSupabaseReady || !supabase) {
    const row = DEMO_LISTINGS.filter(function find(item) {
      return item.id === id;
    })[0];
    if (!row) return null;
    return toView(row, demoProfiles(), statsFrom(DEMO_REVIEWS));
  }
  const result = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  const row = result.data as ListingRow;
  const profileMap = await fetchProfiles([row.owner_id]);
  const reviewMap = await fetchReviewStats([row.id]);
  return toView(row, profileMap, reviewMap);
}

export async function listReviews(listingId: string): Promise<ReviewView[]> {
  if (!isSupabaseReady || !supabase) {
    const profiles = demoProfiles();
    return DEMO_REVIEWS.filter(function find(row) {
      return row.listing_id === listingId;
    }).map(function view(row) {
      const author = profiles.get(row.author_id);
      return {
        id: row.id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
        authorName: author ? author.display_name : "Membro GCNM",
      };
    });
  }
  const result = await supabase.from("reviews").select("*").eq("listing_id", listingId).order("created_at", { ascending: false }).limit(20);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as ReviewRow[];
  const authors = await fetchProfilesOnly(rows.map(function author(row) {
    return row.author_id;
  }));
  return rows.map(function view(row) {
    const author = authors.get(row.author_id);
    return {
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      authorName: author ? author.display_name : "Membro GCNM",
    };
  });
}

export async function listMyListings(userId: string): Promise<ListingView[]> {
  if (!isSupabaseReady || !supabase) {
    return DEMO_LISTINGS.filter(function mine(row) {
      return row.owner_id === userId;
    }).map(function view(row) {
      return toView(row, demoProfiles(), statsFrom(DEMO_REVIEWS));
    });
  }
  const result = await supabase.from("listings").select("*").eq("owner_id", userId).order("created_at", { ascending: false }).limit(24);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as ListingRow[];
  const reviewMap = await fetchReviewStats(rows.map(function id(row) {
    return row.id;
  }));
  const profileMap = await fetchProfilesOnly([userId]);
  return rows.map(function view(row) {
    return toView(row, profileMap, reviewMap);
  });
}

export async function platformStats(): Promise<PlatformStats> {
  const base: PlatformStats = { listings: 0, verifiedSellers: 0, rooms: ROOMS.length, currencies: CURRENCIES.length };
  if (!isSupabaseReady || !supabase) {
    return {
      listings: DEMO_LISTINGS.length,
      verifiedSellers: DEMO_PROFILES.filter(function verified(row) {
        return row.is_verified;
      }).length,
      rooms: ROOMS.length,
      currencies: CURRENCIES.length,
    };
  }
  const listingsResult = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active");
  const sellersResult = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_verified", true);
  return {
    listings: listingsResult.count || base.listings,
    verifiedSellers: sellersResult.count || base.verifiedSellers,
    rooms: ROOMS.length,
    currencies: CURRENCIES.length,
  };
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  if (!isSupabaseReady || !supabase) {
    const row = DEMO_PROFILES.filter(function find(item) {
      return item.id === userId;
    })[0];
    return row || null;
  }
  const result = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return (result.data as ProfileRow) || null;
}

async function fetchProfiles(ids: string[]): Promise<Map<string, ProfileRow>> {
  const unique = Array.from(new Set(ids)).filter(function valid(id) {
    return Boolean(id);
  });
  if (unique.length === 0) return new Map<string, ProfileRow>();
  if (!supabase) return demoProfiles();
  const result = await supabase.from("profiles").select("*").in("id", unique);
  const map = new Map<string, ProfileRow>();
  for (const row of (result.data || []) as ProfileRow[]) map.set(row.id, row);
  return map;
}

async function fetchProfilesOnly(ids: string[]): Promise<Map<string, ProfileRow>> {
  return fetchProfiles(ids);
}

async function fetchReviewStats(ids: string[]): Promise<Map<string, ReviewStats>> {
  const unique = Array.from(new Set(ids)).filter(function valid(id) {
    return Boolean(id);
  });
  if (unique.length === 0) return new Map<string, ReviewStats>();
  if (!supabase) return statsFrom(DEMO_REVIEWS);
  const result = await supabase.from("reviews").select("listing_id, rating").in("listing_id", unique);
  const rows = (result.data || []) as ReviewRow[];
  return statsFrom(rows);
}
