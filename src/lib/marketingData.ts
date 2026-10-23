import { supabase, isSupabaseReady } from "./supabase";
import { round2 } from "./economy";

export type CampaignView = {
  id: string;
  storeId: string;
  channel: string;
  headline: string;
  body: string;
  link: string;
  status: string;
  launchAt: string | null;
  createdAt: string;
};

export type VisitTotals = { total: number; byChannel: Record<string, number> };

export type CommissionView = {
  id: string;
  storeId: string;
  storeName: string;
  kind: string;
  amountUsd: number;
  period: string;
  status: string;
  createdAt: string;
};

const DEMO_CAMPAIGNS: CampaignView[] = [
  { id: "demo-c1", storeId: "demo-s1", channel: "whatsapp", headline: "Solar Lusitana: instalacao com 10% de desconto", body: "Mensagem pronta para clientes fieis.", link: "https://gcnm.example/loja/solar-lusitana?utm_source=whatsapp", status: "live", launchAt: null, createdAt: "2026-10-10T09:00:00Z" },
  { id: "demo-c2", storeId: "demo-s1", channel: "facebook", headline: "Novidade na Solar Lusitana", body: "Publicacao para grupos da zona.", link: "https://gcnm.example/loja/solar-lusitana?utm_source=facebook", status: "draft", launchAt: null, createdAt: "2026-10-08T09:00:00Z" },
];

const DEMO_COMMISSIONS: CommissionView[] = [
  { id: "demo-g1", storeId: "demo-s1", storeName: "Solar Lusitana", kind: "first_month", amountUsd: 19, period: "2026-10-01", status: "pending", createdAt: "2026-10-05T10:00:00Z" },
  { id: "demo-g2", storeId: "demo-s2", storeName: "Nova Onda", kind: "recurring", amountUsd: 8.75, period: "2026-10-01", status: "payable", createdAt: "2026-10-02T10:00:00Z" },
];

export function commissionKindLabel(kind: string): string {
  if (kind === "first_month") return "Primeiro mes como bonus";
  if (kind === "milestone") return "Bonus de meta";
  if (kind === "fund") return "Fundo de bonus";
  return "Comissao recorrente";
}

export function commissionStatusLabel(status: string): string {
  if (status === "paid") return "pago";
  if (status === "payable") return "disponivel";
  return "retido";
}

export function commissionTotals(rows: CommissionView[]): { pendingUsd: number; payableUsd: number; paidUsd: number; totalUsd: number } {
  let pending = 0;
  let payable = 0;
  let paid = 0;
  for (const row of rows) {
    if (row.status === "paid") paid += row.amountUsd;
    else if (row.status === "payable") payable += row.amountUsd;
    else pending += row.amountUsd;
  }
  return { pendingUsd: round2(pending), payableUsd: round2(payable), paidUsd: round2(paid), totalUsd: round2(pending + payable + paid) };
}

export async function listCampaigns(storeId: string): Promise<CampaignView[]> {
  if (!isSupabaseReady || !supabase) return DEMO_CAMPAIGNS;
  const result = await supabase
    .from("store_campaigns")
    .select("id,store_id,channel,headline,body,link,status,launch_at,created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(40);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as Array<{ id: string; store_id: string; channel: string; headline: string; body: string | null; link: string | null; status: string; launch_at: string | null; created_at: string }>;
  return rows.map(function row(item) {
    return {
      id: item.id,
      storeId: item.store_id,
      channel: item.channel,
      headline: item.headline,
      body: item.body || "",
      link: item.link || "",
      status: item.status,
      launchAt: item.launch_at,
      createdAt: item.created_at,
    };
  });
}

export async function createCampaign(input: { storeId: string; ownerId: string; channel: string; headline: string; body: string; link: string; status?: string }): Promise<string> {
  if (!isSupabaseReady || !supabase) throw new Error("Ligacao a base de dados indisponivel.");
  const result = await supabase
    .from("store_campaigns")
    .insert({
      store_id: input.storeId,
      owner_id: input.ownerId,
      channel: input.channel,
      headline: input.headline,
      body: input.body,
      link: input.link,
      status: input.status || "draft",
    })
    .select("id")
    .limit(1);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as Array<{ id: string }>;
  return rows.length > 0 ? rows[0].id : "";
}

export async function setCampaignStatus(id: string, status: string): Promise<void> {
  if (!isSupabaseReady || !supabase) return;
  const result = await supabase.from("store_campaigns").update({ status: status, updated_at: new Date().toISOString() }).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

export async function deleteCampaign(id: string): Promise<void> {
  if (!isSupabaseReady || !supabase) return;
  const result = await supabase.from("store_campaigns").delete().eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

// Visitas: registo leve na montra publica, para saber de que canal vem o cliente.
export async function registerVisit(input: { storeId: string; channel: string; campaign: string | null; refCode: string | null }): Promise<void> {
  if (!isSupabaseReady || !supabase || input.storeId.length === 0) return;
  await supabase.from("store_visits").insert({
    store_id: input.storeId,
    channel: input.channel,
    campaign: input.campaign,
    ref_code: input.refCode,
  });
}

export async function visitTotals(storeId: string): Promise<VisitTotals> {
  if (!isSupabaseReady || !supabase) return { total: 0, byChannel: {} };
  const result = await supabase.from("store_visits").select("channel").eq("store_id", storeId).order("created_at", { ascending: false }).limit(500);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as Array<{ channel: string }>;
  const byChannel: Record<string, number> = {};
  for (const row of rows) byChannel[row.channel] = (byChannel[row.channel] || 0) + 1;
  return { total: rows.length, byChannel: byChannel };
}

async function storeNames(ids: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  if (!supabase || ids.length === 0) return map;
  const unique = ids.filter(function once(id, index) {
    return ids.indexOf(id) === index;
  });
  const result = await supabase.from("stores").select("id,name").in("id", unique);
  if (result.error) return map;
  const rows = (result.data || []) as Array<{ id: string; name: string }>;
  for (const row of rows) map[row.id] = row.name;
  return map;
}

export async function listCommissions(affiliateId: string): Promise<CommissionView[]> {
  if (!isSupabaseReady || !supabase) return DEMO_COMMISSIONS;
  const result = await supabase
    .from("store_commissions")
    .select("id,store_id,kind,amount_usd,period,status,created_at")
    .eq("affiliate_id", affiliateId)
    .order("period", { ascending: false })
    .limit(40);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as Array<{ id: string; store_id: string; kind: string; amount_usd: number; period: string; status: string; created_at: string }>;
  const names = await storeNames(rows.map(function id(item) { return item.store_id; }));
  return rows.map(function row(item) {
    return {
      id: item.id,
      storeId: item.store_id,
      storeName: names[item.store_id] || "Loja",
      kind: item.kind,
      amountUsd: Number(item.amount_usd),
      period: item.period,
      status: item.status,
      createdAt: item.created_at,
    };
  });
}
