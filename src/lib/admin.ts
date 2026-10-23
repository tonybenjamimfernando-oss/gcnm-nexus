import { isSupabaseReady, supabase } from "./supabase";
import type { ListingRow } from "./demo";

export type ReportView = {
  id: string;
  reviewId: string;
  reason: string;
  createdAt: string;
  reviewComment: string | null;
  reviewRating: number | null;
};

export async function currentRole(userId: string): Promise<string | null> {
  if (!isSupabaseReady || !supabase) return null;
  const result = await supabase.from("user_roles").select("role").eq("user_id", userId).limit(1);
  if (result.error) throw new Error(result.error.message);
  const row = ((result.data || []) as Array<{ role: string }>)[0];
  return row ? row.role : null;
}

export async function featureListing(id: string, days: number): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error("A ligacao ao Supabase nao esta configurada neste ambiente.");
  const until = new Date(Date.now() + days * 86400000).toISOString();
  const result = await supabase.from("listings").update({ featured_until: until }).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

export async function listPendingListings(): Promise<ListingRow[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase
    .from("listings")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(40);
  if (result.error) throw new Error(result.error.message);
  return (result.data || []) as ListingRow[];
}

export async function moderateListing(id: string, status: string): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error("A ligacao ao Supabase nao esta configurada neste ambiente.");
  const result = await supabase.from("listings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

export async function listReviewReports(): Promise<ReportView[]> {
  if (!isSupabaseReady || !supabase) return [];
  const result = await supabase.from("review_reports").select("*").order("created_at", { ascending: false }).limit(40);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data || []) as Array<{
    id: string;
    review_id: string;
    reason: string;
    created_at: string;
  }>;
  if (rows.length === 0) return [];
  const reviewResult = await supabase
    .from("reviews")
    .select("id, comment, rating")
    .in("id", Array.from(new Set(rows.map(function map(row) {
      return row.review_id;
    }))));
  if (reviewResult.error) throw new Error(reviewResult.error.message);
  const reviews = new Map<string, { comment: string; rating: number }>();
  for (const review of (reviewResult.data || []) as Array<{ id: string; comment: string; rating: number }>) {
    reviews.set(review.id, review);
  }
  return rows.map(function view(row) {
    const review = reviews.get(row.review_id);
    return {
      id: row.id,
      reviewId: row.review_id,
      reason: row.reason,
      createdAt: row.created_at,
      reviewComment: review ? review.comment : null,
      reviewRating: review ? review.rating : null,
    };
  });
}

export async function moderateReport(reportId: string, reviewId: string, removeReview: boolean): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error("A ligacao ao Supabase nao esta configurada neste ambiente.");
  if (removeReview) {
    const removed = await supabase.from("reviews").delete().eq("id", reviewId);
    if (removed.error) throw new Error(removed.error.message);
  }
  const cleared = await supabase.from("review_reports").delete().eq("id", reportId);
  if (cleared.error) throw new Error(cleared.error.message);
}
