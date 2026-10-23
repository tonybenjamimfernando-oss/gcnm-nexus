import { isSupabaseReady, supabase } from "./supabase";

export type ConversationRow = {
  id: string;
  listing_id: string;
  participant_a: string;
  participant_b: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ProposalRow = {
  id: string;
  request_id: string;
  supplier_id: string;
  price: number | null;
  currency: string;
  delivery_days: number | null;
  message: string;
  status: string;
  created_at: string;
};

export type ConversationView = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCover: string | null;
  otherId: string;
  otherName: string;
  lastMessageAt: string;
};

export type ProposalView = {
  id: string;
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  price: number | null;
  currency: string;
  deliveryDays: number | null;
  message: string;
  status: string;
  createdAt: string;
};

type ProfileMini = { id: string; display_name: string; company_name: string | null };
type ProfileVerified = { id: string; display_name: string; company_name: string | null; is_verified: boolean };

const OFFLINE = "A ligacao ao Supabase nao esta configurada neste ambiente.";

function unique(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

function otherOf(row: ConversationRow, userId: string): string {
  return row.participant_a === userId ? row.participant_b : row.participant_a;
}

function labelOf(profiles: Map<string, ProfileMini>, id: string): string {
  const profile = profiles.get(id);
  return profile ? profile.company_name || profile.display_name : "Membro GCNM";
}

function miniMap(rows: ProfileMini[]): Map<string, ProfileMini> {
  const map = new Map<string, ProfileMini>();
  for (const row of rows) map.set(row.id, row);
  return map;
}

export async function listConversations(userId: string): Promise<ConversationView[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase
    .from("conversations")
    .select("*")
    .or("participant_a.eq." + userId + ",participant_b.eq." + userId)
    .order("last_message_at", { ascending: false })
    .limit(40);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as ConversationRow[];
  if (rows.length === 0) return [];

  const listingResult = await supabase
    .from("listings")
    .select("id, title, images")
    .in("id", unique(rows.map(function map(row) {
      return row.listing_id;
    })));
  if (listingResult.error) throw new Error(listingResult.error.message);
  const listings = new Map<string, { id: string; title: string; images: string[] }>();
  for (const listing of (listingResult.data || []) as Array<{ id: string; title: string; images: string[] }>) {
    listings.set(listing.id, listing);
  }

  const profileResult = await supabase
    .from("profiles")
    .select("id, display_name, company_name")
    .in("id", unique(rows.map(function map(row) {
      return otherOf(row, userId);
    })));
  if (profileResult.error) throw new Error(profileResult.error.message);
  const profiles = miniMap((profileResult.data || []) as ProfileMini[]);

  return rows.map(function view(row) {
    const listing = listings.get(row.listing_id);
    const other = otherOf(row, userId);
    return {
      id: row.id,
      listingId: row.listing_id,
      listingTitle: listing ? listing.title : "Anuncio removido",
      listingCover: listing && listing.images.length > 0 ? listing.images[0] : null,
      otherId: other,
      otherName: labelOf(profiles, other),
      lastMessageAt: row.last_message_at,
    };
  });
}

export async function findConversation(listingId: string, userId: string): Promise<ConversationRow | null> {
  if (!isSupabaseReady || !supabase) return null;
  const result = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .or("participant_a.eq." + userId + ",participant_b.eq." + userId)
    .limit(1);
  if (result.error) throw new Error(result.error.message);
  const row = ((result.data || []) as ConversationRow[])[0];
  return row || null;
}

export async function startConversation(listingId: string, userId: string, ownerId: string): Promise<string> {
  if (!isSupabaseReady || !supabase) throw new Error(OFFLINE);
  const existing = await findConversation(listingId, userId);
  if (existing) return existing.id;
  const result = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, participant_a: userId, participant_b: ownerId })
    .select("id")
    .single();
  if (result.error) throw new Error(result.error.message);
  return result.data.id as string;
}

export async function listMessages(conversationId: string): Promise<MessageRow[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (result.error) throw new Error(result.error.message);
  return (result.data || []) as MessageRow[];
}

export async function sendMessage(conversationId: string, senderId: string, body: string): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error(OFFLINE);
  const result = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, body });
  if (result.error) throw new Error(result.error.message);
  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
}

function toProposalView(row: ProposalRow, profiles: Map<string, ProfileVerified>): ProposalView {
  const profile = profiles.get(row.supplier_id);
  return {
    id: row.id,
    requestId: row.request_id,
    supplierId: row.supplier_id,
    supplierName: profile ? profile.company_name || profile.display_name : "Membro GCNM",
    supplierVerified: profile ? profile.is_verified : false,
    price: row.price,
    currency: row.currency,
    deliveryDays: row.delivery_days,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function enrichProposals(rows: ProposalRow[]): Promise<ProposalView[]> {
  if (rows.length === 0 || !supabase) return [];
  const profileResult = await supabase
    .from("profiles")
    .select("id, display_name, company_name, is_verified")
    .in("id", unique(rows.map(function map(row) {
      return row.supplier_id;
    })));
  if (profileResult.error) throw new Error(profileResult.error.message);
  const profiles = new Map<string, ProfileVerified>();
  for (const profile of (profileResult.data || []) as ProfileVerified[]) profiles.set(profile.id, profile);
  return rows.map(function view(row) {
    return toProposalView(row, profiles);
  });
}

export async function listProposals(requestId: string): Promise<ProposalView[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase
    .from("proposals")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (result.error) throw new Error(result.error.message);
  return enrichProposals((result.data || []) as ProposalRow[]);
}

export async function myProposals(userId: string): Promise<ProposalView[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase
    .from("proposals")
    .select("*")
    .eq("supplier_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (result.error) throw new Error(result.error.message);
  return enrichProposals((result.data || []) as ProposalRow[]);
}

export async function createProposal(input: {
  requestId: string;
  supplierId: string;
  price: number | null;
  currency: string;
  deliveryDays: number | null;
  message: string;
}): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error(OFFLINE);
  const result = await supabase.from("proposals").insert({
    request_id: input.requestId,
    supplier_id: input.supplierId,
    price: input.price,
    currency: input.currency,
    delivery_days: input.deliveryDays,
    message: input.message,
    status: "sent",
  });
  if (result.error) throw new Error(result.error.message);
}

export async function setProposalStatus(id: string, status: string): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error(OFFLINE);
  const result = await supabase.from("proposals").update({ status }).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

export function proposalStatusLabel(status: string): string {
  if (status === "accepted") return "Aceite";
  if (status === "rejected") return "Recusada";
  return "Enviada";
}
