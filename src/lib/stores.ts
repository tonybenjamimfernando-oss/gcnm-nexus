import { supabase, isSupabaseReady } from "./supabase";
import { listListings, listingsByIds } from "./api";
import type { ListingView } from "./api";
import { defaultServices } from "./storeServices";

export type StoreRow = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  accent: string;
  cover_url: string | null;
  country: string | null;
  city: string | null;
  currency: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  status: string;
  tier: string;
  is_external: boolean;
  affiliate_enabled: boolean;
  default_commission: number | null;
  created_at: string;
};

export type StoreView = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  accent: string;
  country: string | null;
  city: string | null;
  currency: string;
  status: string;
  tier: string;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  isExternal: boolean;
  affiliateEnabled: boolean;
  commission: number;
  ownerId: string;
  ownerName: string;
  ownerVerified: boolean;
  createdAt: string;
  services: string[];
  listings: number;
};

export type StoreInput = {
  ownerId: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  accent: string;
  country: string;
  city: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  tier: string;
  status: string;
};

export type AffiliateView = { id: string; userId: string; code: string; commission: number; status: string };
export type MemberView = { id: string; userId: string; role: string };

const DEMO_STORES: StoreRow[] = [
  {
    id: "demo-1", owner_id: "demo-owner-1", slug: "solar-lusitana", name: "Solar Lusitana",
    tagline: "Energia solar para casas e empresas", description: "Instalacao, equipamento e manutencao de sistemas fotovoltaicos, com orcamento em 24 horas.",
    category: "Energia", accent: "ember", cover_url: null, country: "Portugal", city: "Lisboa",
    currency: "EUR", contact_email: "vendas@solar-lusitana.example", contact_phone: "+351 910 000 000",
    website: null, status: "active", tier: "pro", is_external: true, affiliate_enabled: true,
    default_commission: 8, created_at: "2026-09-02T10:00:00Z",
  },
  {
    id: "demo-2", owner_id: "demo-owner-2", slug: "atelie-ndalu", name: "Atelie Ndalu",
    tagline: "Artesanato e moda de autor", description: "Pecas feitas a mao em Maputo, com tecidos locais e producao em pequenas series.",
    category: "Moda e artesanato", accent: "coral", cover_url: null, country: "Mocambique", city: "Maputo",
    currency: "MZN", contact_email: "atelie@ndalu.example", contact_phone: "+258 84 000 0000",
    website: null, status: "active", tier: "starter", is_external: false, affiliate_enabled: true,
    default_commission: 12, created_at: "2026-08-14T10:00:00Z",
  },
  {
    id: "demo-3", owner_id: "demo-owner-3", slug: "global-parts-hub", name: "Global Parts Hub",
    tagline: "Pecas e equipamento industrial", description: "Catalogo tecnico com entrega internacional, garantia declarada e apoio a manutencao.",
    category: "Logistica", accent: "glow", cover_url: null, country: "Angola", city: "Luanda",
    currency: "USD", contact_email: "comercial@globalparts.example", contact_phone: null,
    website: null, status: "active", tier: "scale", is_external: true, affiliate_enabled: true,
    default_commission: 5, created_at: "2026-07-20T10:00:00Z",
  },
];

type ServiceRow = { store_id: string; service: string };
type OwnerRow = { id: string; display_name: string | null; company_name: string | null; is_verified: boolean };

export function demoStoreView(row: StoreRow): StoreView {
  const state = defaultServices(row.tier);
  return {
    id: row.id, slug: row.slug, name: row.name, tagline: row.tagline, description: row.description,
    category: row.category, accent: row.accent, country: row.country, city: row.city,
    currency: row.currency || "USD", status: row.status, tier: row.tier, contactEmail: row.contact_email,
    contactPhone: row.contact_phone, website: row.website, isExternal: row.is_external,
    affiliateEnabled: row.affiliate_enabled, commission: Number(row.default_commission || 10),
    ownerId: row.owner_id, ownerName: row.name, ownerVerified: true, createdAt: row.created_at,
    services: Object.keys(state).filter(function on(key) { return state[key]; }),
    listings: 0,
  };
}

function view(row: StoreRow, owner: OwnerRow | null, services: string[], listings: number): StoreView {
  return {
    id: row.id, slug: row.slug, name: row.name, tagline: row.tagline, description: row.description,
    category: row.category, accent: row.accent, country: row.country, city: row.city,
    currency: row.currency || "USD", status: row.status, tier: row.tier, contactEmail: row.contact_email,
    contactPhone: row.contact_phone, website: row.website, isExternal: row.is_external,
    affiliateEnabled: row.affiliate_enabled, commission: Number(row.default_commission || 10),
    ownerId: row.owner_id,
    ownerName: owner ? owner.company_name || owner.display_name || row.name : row.name,
    ownerVerified: owner ? owner.is_verified : false,
    createdAt: row.created_at, services: services, listings: listings,
  };
}

async function decorate(rows: StoreRow[]): Promise<StoreView[]> {
  if (rows.length === 0) return [];
  const ids = rows.map(function id(row) { return row.id; });
  const ownerIds: string[] = [];
  for (const row of rows) if (ownerIds.indexOf(row.owner_id) === -1) ownerIds.push(row.owner_id);
  const owners = await supabase.from("profiles").select("id,display_name,company_name,is_verified").in("id", ownerIds);
  if (owners.error) throw new Error(owners.error.message);
  const services = await supabase.from("store_services").select("store_id,service").in("store_id", ids).eq("enabled", true);
  if (services.error) throw new Error(services.error.message);
  const catalog = await supabase.from("listings").select("store_id").in("store_id", ids);
  if (catalog.error) throw new Error(catalog.error.message);
  const ownerMap = new Map<string, OwnerRow>();
  for (const row of (owners.data || []) as OwnerRow[]) ownerMap.set(row.id, row);
  const serviceMap = new Map<string, string[]>();
  for (const row of (services.data || []) as ServiceRow[]) {
    const list = serviceMap.get(row.store_id) || [];
    list.push(row.service);
    serviceMap.set(row.store_id, list);
  }
  const countMap = new Map<string, number>();
  for (const row of (catalog.data || []) as Array<{ store_id: string }>) {
    countMap.set(row.store_id, (countMap.get(row.store_id) || 0) + 1);
  }
  return rows.map(function build(row) {
    return view(row, ownerMap.get(row.owner_id) || null, serviceMap.get(row.id) || [], countMap.get(row.id) || 0);
  });
}

export async function listStores(options?: { q?: string | null; category?: string | null; limit?: number }): Promise<StoreView[]> {
  const term = (options && options.q ? options.q : "").trim().toLowerCase();
  const category = options && options.category ? options.category : "";
  if (!isSupabaseReady || !supabase) {
    const rows = DEMO_STORES.filter(function match(row) {
      const haystack = (row.name + " " + (row.tagline || "") + " " + (row.category || "") + " " + (row.city || "")).toLowerCase();
      if (term.length > 1 && haystack.indexOf(term) === -1) return false;
      if (category.length > 0 && row.category !== category) return false;
      return true;
    });
    return rows.map(demoStoreView);
  }
  let query = supabase.from("stores").select("*").eq("status", "active").order("created_at", { ascending: false }).limit((options && options.limit) || 24);
  if (term.length > 1) query = query.or("name.ilike.%" + term + "%,tagline.ilike.%" + term + "%,category.ilike.%" + term + "%");
  if (category.length > 0) query = query.eq("category", category);
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return decorate((result.data || []) as StoreRow[]);
}

export async function listMyStores(userId: string): Promise<StoreView[]> {
  if (!isSupabaseReady || !supabase) return DEMO_STORES.filter(function mine(row) { return row.owner_id === userId; }).map(demoStoreView);
  const result = await supabase.from("stores").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return decorate((result.data || []) as StoreRow[]);
}

export async function getStoreBySlug(slug: string): Promise<StoreView | null> {
  const clean = slug.trim().toLowerCase();
  if (!isSupabaseReady || !supabase) {
    const rows = await listStores({});
    return rows.filter(function find(item) { return item.slug === clean; })[0] || null;
  }
  const result = await supabase.from("stores").select("*").eq("slug", clean).limit(1);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as StoreRow[];
  if (rows.length === 0) return null;
  const decorated = await decorate(rows);
  return decorated[0];
}

export async function listStoreListings(storeId: string): Promise<ListingView[]> {
  if (!isSupabaseReady || !supabase) return listListings({ sort: "recent", limit: 3 });
  const result = await supabase.from("listings").select("id").eq("store_id", storeId).eq("status", "active").limit(12);
  if (result.error) throw new Error(result.error.message);
  const ids = ((result.data || []) as Array<{ id: string }>).map(function id(row) { return row.id; });
  return listingsByIds(ids);
}

export async function createStore(input: StoreInput): Promise<string> {
  if (!isSupabaseReady || !supabase) throw new Error("Abrir uma loja requer a ligacao ao Supabase configurada.");
  const result = await supabase
    .from("stores")
    .insert({
      owner_id: input.ownerId,
      slug: input.slug,
      name: input.name,
      tagline: input.tagline || null,
      description: input.description || null,
      category: input.category || null,
      accent: input.accent,
      country: input.country || null,
      city: input.city || null,
      currency: input.currency || "USD",
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      website: input.website || null,
      tier: input.tier,
      status: input.status,
    })
    .select("id");
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as Array<{ id: string }>;
  if (rows.length === 0) throw new Error("A loja nao foi criada.");
  return rows[0].id;
}

export async function updateStore(id: string, body: Record<string, unknown>): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error("A loja requer a ligacao ao Supabase configurada.");
  const result = await supabase.from("stores").update(Object.assign({ updated_at: new Date().toISOString() }, body)).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

export async function storeServiceState(storeId: string, tier: string): Promise<Record<string, boolean>> {
  const state = defaultServices(tier);
  if (!isSupabaseReady || !supabase) return state;
  const result = await supabase.from("store_services").select("service,enabled").eq("store_id", storeId);
  if (result.error) throw new Error(result.error.message);
  for (const row of (result.data || []) as Array<{ service: string; enabled: boolean }>) state[row.service] = row.enabled;
  return state;
}

export async function setStoreService(storeId: string, service: string, enabled: boolean): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error("Guardar servicos requer a ligacao ao Supabase configurada.");
  const result = await supabase
    .from("store_services")
    .upsert({ store_id: storeId, service: service, enabled: enabled, updated_at: new Date().toISOString() }, { onConflict: "store_id,service" });
  if (result.error) throw new Error(result.error.message);
}

export async function listAffiliates(storeId: string): Promise<AffiliateView[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase.from("store_affiliates").select("id,user_id,code,commission,status").eq("store_id", storeId).order("created_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return ((result.data || []) as Array<{ id: string; user_id: string; code: string; commission: number; status: string }>).map(function row(item) {
    return { id: item.id, userId: item.user_id, code: item.code, commission: Number(item.commission), status: item.status };
  });
}

export async function joinAsAffiliate(storeId: string, userId: string): Promise<string> {
  if (!isSupabaseReady || !supabase) throw new Error("Participar como afiliado requer a ligacao ao Supabase configurada.");
  const existing = await supabase.from("store_affiliates").select("code").eq("store_id", storeId).eq("user_id", userId).limit(1);
  if (existing.error) throw new Error(existing.error.message);
  const found = (existing.data || []) as Array<{ code: string }>;
  if (found.length > 0) return found[0].code;
  const code = affiliateCode(userId.slice(0, 6));
  const result = await supabase.from("store_affiliates").insert({ store_id: storeId, user_id: userId, code: code });
  if (result.error) throw new Error(result.error.message);
  return code;
}

export async function listMembers(storeId: string): Promise<MemberView[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase.from("store_members").select("id,user_id,member_role").eq("store_id", storeId);
  if (result.error) throw new Error(result.error.message);
  return ((result.data || []) as Array<{ id: string; user_id: string; member_role: string }>).map(function row(item) {
    return { id: item.id, userId: item.user_id, role: item.member_role };
  });
}

export function slugFrom(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function affiliateCode(seed: string): string {
  const clean = slugFrom(seed).replace(/-/g, "").slice(0, 6) || "gcnm";
  return clean + "-" + Math.random().toString(36).slice(2, 6);
}

export function storeLocation(store: { city: string | null; country: string | null }): string {
  return [store.city, store.country].filter(Boolean).join(", ");
}
