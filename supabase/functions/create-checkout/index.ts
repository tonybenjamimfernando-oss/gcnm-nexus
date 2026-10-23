import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async function handle(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Sessao invalida." }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { listingId } = await req.json();
    const { data: listing } = await admin
      .from("listings")
      .select("id, title, price, currency, owner_id, status")
      .eq("id", listingId)
      .maybeSingle();
    if (!listing || listing.status !== "active") return json({ error: "Oferta indisponivel." }, 404);
    if (listing.price === null) return json({ error: "Esta oferta nao tem preco fixo. Use as mensagens para negociar." }, 400);
    if (listing.owner_id === user.id) return json({ error: "Nao pode comprar a propria oferta." }, 400);

    if (stripeKey.length === 0) return json({ error: "Pagamentos ainda nao configurados: defina STRIPE_SECRET_KEY nos secrets do Supabase." }, 501);

    const { data: order } = await admin
      .from("orders")
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.owner_id,
        amount: listing.price,
        currency: listing.currency || "USD",
        status: "pending",
      })
      .select("id")
      .single();
    if (!order) return json({ error: "Nao foi possivel registar a encomenda." }, 500);

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", siteUrl + "/anuncio/" + listing.id + "?pago=1");
    params.set("cancel_url", siteUrl + "/anuncio/" + listing.id);
    params.set("client_reference_id", order.id);
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", (listing.currency || "USD").toLowerCase());
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(listing.price * 100)));
    params.set("line_items[0][price_data][product_data][name]", String(listing.title).slice(0, 120));

    const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + stripeKey, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const session = await stripe.json();
    if (!stripe.ok) return json({ error: session.error?.message ?? "Erro ao criar o pagamento." }, 502);

    await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    return json({ url: session.url });
  } catch (problem) {
    return json({ error: String(problem) }, 500);
  }
});
