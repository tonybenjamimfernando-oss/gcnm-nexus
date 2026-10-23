import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = new Map(
    header.split(",").map(function part(entry) {
      const pair = entry.split("=");
      return [pair[0].trim(), (pair[1] || "").trim()] as [string, string];
    }),
  );
  const timestamp = parts.get("t");
  const signature = parts.get("v1");
  if (!timestamp || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + "." + payload));
  const expected = Array.from(new Uint8Array(mac))
    .map(function hex(byte) {
      return byte.toString(16).padStart(2, "0");
    })
    .join("");
  return expected === signature;
}

Deno.serve(async function handle(req: Request) {
  const payload = await req.text();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  if (secret && signature) {
    const valid = await verifySignature(payload, signature, secret);
    if (!valid) return new Response("assinatura invalida", { status: 400 });
  }

  try {
    const event = JSON.parse(payload);
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
      if (session?.id) {
        await admin.from("orders").update({ status: "paid" }).eq("stripe_session_id", session.id);
      }
    }
    return new Response("ok", { status: 200 });
  } catch {
    return new Response("payload invalido", { status: 400 });
  }
});
