import { ArrowRight, Layers, Share2, Store, Wallet } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import NeoTile from "@/components/ui/NeoTile";
import SectionHeading from "@/components/ui/SectionHeading";
import { STORE_SERVICES } from "@/lib/storeServices";

export default function IncubatorBand() {
  return (
    <section className="mx-auto mt-24 max-w-7xl">
      <SectionHeading
        eyebrow="Incubadora de lojas"
        title="Traga a tua loja digital para dentro da rede"
        description="Cada afiliado hospeda a sua conta, monta a vitrine e escolhe os servicos que quer ligar. Sem custo de entrada: publicas hoje e cresces com a comissao que definires."
        action={
          <GlowButton to="/lojas" variant="glass" size="sm">
            Ver as lojas
          </GlowButton>
        }
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <GlassCard tone="strong" className="layer-stack relative overflow-hidden p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{ background: "radial-gradient(420px 200px at 18% 0%, rgba(255,153,0,0.28), transparent 70%)" }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-haze-300">
              <Store className="h-3.5 w-3.5 text-ember-400" />
              Montar a minha loja
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight text-white md:text-2xl">
              Dez servicos, tres niveis, uma montra so tua
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-haze-300">
              Escolhe o nivel, liga os servicos que fazem sentido para o teu negocio e publica. Os compradores chegam
              pela rede, pelas salas comerciais e pelos teus afiliados.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {STORE_SERVICES.slice(0, 6).map(function render(service) {
                return (
                  <span key={service.key} className="neo rounded-full px-3 py-1.5 text-[11px] font-semibold text-haze-100">
                    {service.label}
                  </span>
                );
              })}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <GlowButton to="/lojas/montar" size="md">
                Comecar a montagem
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
              <GlowButton to="/lojas" variant="ghost" size="md">
                Explorar a incubadora
              </GlowButton>
            </div>
          </div>
        </GlassCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <NeoTile tone="ember" icon={<Store className="h-4 w-4" />} label="Vitrine" value="Publica" hint="Pagina da loja pronta a partilhar." />
          <NeoTile tone="lime" icon={<Wallet className="h-4 w-4" />} label="Pagamentos" value="Stripe" hint="Cobranca multi-moeda ligada a conta." />
          <NeoTile tone="coral" icon={<Share2 className="h-4 w-4" />} label="Afiliados" value="Codigo" hint="Cada afiliado traz vendas com comissao." />
          <NeoTile tone="glow" icon={<Layers className="h-4 w-4" />} label="Servicos" value={String(STORE_SERVICES.length)} hint="Catalogo, equipa, entregas, analitica." />
        </div>
      </div>
    </section>
  );
}
