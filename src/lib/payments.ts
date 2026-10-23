import { supabase, isSupabaseReady } from "./supabase";

export async function startCheckout(listingId: string): Promise<string> {
  if (!isSupabaseReady || !supabase) throw new Error("Os pagamentos requerem a ligacao ao Supabase.");
  const result = await supabase.functions.invoke("create-checkout", { body: { listingId } });
  if (result.error) throw new Error(result.error.message);
  const url = (result.data as { url?: string } | null)?.url;
  if (!url) throw new Error("Nao foi possivel iniciar o pagamento.");
  return url;
}
