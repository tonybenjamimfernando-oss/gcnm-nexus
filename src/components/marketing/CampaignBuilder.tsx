import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, Save } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import { MARKETING_CHANNELS, campaignKit } from "@/lib/marketing";
import type { StoreBrief } from "@/lib/marketing";
import { createCampaign } from "@/lib/marketingData";
import { cn } from "@/lib/cn";

type Props = { store: StoreBrief; codes: string[]; onSaved: () => void };

export default function CampaignBuilder({ store, codes, onSaved }: Props) {
  const [offer, setOffer] = useState("");
  const [channel, setChannel] = useState(MARKETING_CHANNELS[0].id);
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kit = useMemo(
    function build() {
      return campaignKit(store, offer, refCode.length > 0 ? refCode : null);
    },
    [store, offer, refCode],
  );

  const current = kit.filter(function find(item) { return item.channel === channel; })[0] || kit[0];

  function copyText(label: string, value: string) {
    function done() {
      setCopied(label);
      window.setTimeout(function clear() { setCopied(""); }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(function fallback() { window.prompt("Copia o texto", value); });
      return;
    }
    window.prompt("Copia o texto", value);
  }

  async function save() {
    if (saving || !current) return;
    setSaving(true);
    try {
      await createCampaign({
        storeId: store.id,
        ownerId: store.ownerId,
        channel: current.channel,
        headline: current.headline,
        body: current.body + "\n\n" + current.link,
        link: current.link,
        status: "draft",
      });
      setError(null);
      onSaved();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel guardar a campanha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard tone="deep" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
          <Megaphone className="h-4 w-4 text-coral-400" />
          Texto pronto por canal
        </h2>
        <p className="text-xs text-haze-500">Cada link sai marcado: as visitas aparecem no painel por canal.</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="oferta" className="text-[11px] font-bold uppercase tracking-[0.18em] text-haze-500">
            Oferta da semana
          </label>
          <input
            id="oferta"
            value={offer}
            onChange={function change(event) { setOffer(event.target.value); }}
            placeholder="Ex: instalacao com 10% de desconto ate domingo"
            className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
          />
        </div>
        {codes.length > 0 ? (
          <div>
            <label htmlFor="afiliado" className="text-[11px] font-bold uppercase tracking-[0.18em] text-haze-500">
              Codigo de afiliado a creditar (opcional)
            </label>
            <select
              id="afiliado"
              value={refCode}
              onChange={function change(event) { setRefCode(event.target.value); }}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-glow-400/60"
            >
              <option value="">Sem codigo</option>
              {codes.map(function render(code) {
                return (
                  <option key={code} value={code}>
                    {code}
                  </option>
                );
              })}
            </select>
          </div>
        ) : null}
      </div>

      <div className="scroll-x mt-4 gap-2 pb-1">
        {kit.map(function render(item) {
          return (
            <button
              key={item.channel}
              type="button"
              onClick={function pick() { setChannel(item.channel); }}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                channel === item.channel ? "border-glow-400/60 bg-white/10 text-white" : "border-white/10 text-haze-300 hover:text-white",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {current ? (
        <div className="neo mt-4 rounded-2xl p-4">
          <p className="text-sm font-semibold text-white">{current.headline}</p>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-haze-300">{current.body}</p>
          {current.hashtags.length > 0 ? (
            <p className="mt-2 text-[12px] text-glow-400">
              {current.hashtags.map(function tag(item) { return "#" + item; }).join(" ")}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <GlowButton onClick={function copy() { copyText("tudo", current.headline + "\n\n" + current.body); }} variant="glass" size="sm">
              {copied === "tudo" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === "tudo" ? "Copiado" : "Copiar texto"}
            </GlowButton>
            <GlowButton onClick={function copy() { copyText("link", current.link); }} variant="ghost" size="sm">
              {copied === "link" ? "Link copiado" : "Copiar link marcado"}
            </GlowButton>
            <GlowButton onClick={save} variant="primary" size="sm" disabled={saving || store.id.length === 0}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "A guardar" : "Guardar campanha"}
            </GlowButton>
          </div>
          {error ? <p className="mt-3 text-xs text-coral-400">{error}</p> : null}
        </div>
      ) : null}
    </GlassCard>
  );
}
