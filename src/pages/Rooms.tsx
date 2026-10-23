import { Layers, ShieldCheck, Sparkles } from "lucide-react";
import RoomCard from "@/components/rooms/RoomCard";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import { MODULE_COUNT, ROOMS } from "@/lib/rooms";

export default function Rooms() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Salas comerciais</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Doze salas, {MODULE_COUNT} modulos em cada uma.
        </h1>
        <p className="mt-4 text-sm leading-6 text-haze-300 md:text-base">
          Cada sala reune o mesmo conjunto de ferramentas, adaptado ao sector: montra, catalogo, pedidos de compra,
          servicos, oportunidades, comparador, tendencias de preco, logistica, pagamento em qualquer moeda e
          verificacao de confianca.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <GlassCard className="p-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">
            <Layers className="h-4 w-4 text-glow-400" />
            Estrutura
          </span>
          <p className="mt-2 font-display text-2xl font-extrabold text-white">
            {ROOMS.length} x {MODULE_COUNT}
          </p>
          <p className="mt-1 text-xs text-haze-500">modulos funcionais prontos a usar</p>
        </GlassCard>
        <GlassCard className="p-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">
            <Sparkles className="h-4 w-4 text-glow-400" />
            Tipos de oferta
          </span>
          <p className="mt-2 font-display text-2xl font-extrabold text-white">4</p>
          <p className="mt-1 text-xs text-haze-500">produto, servico, pedido e oportunidade</p>
        </GlassCard>
        <GlassCard className="p-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-haze-500">
            <ShieldCheck className="h-4 w-4 text-mint-400" />
            Confianca
          </span>
          <p className="mt-2 font-display text-2xl font-extrabold text-white">Verificado</p>
          <p className="mt-1 text-xs text-haze-500">vendedores validados e avaliacoes publicas</p>
        </GlassCard>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map(function render(room) {
          return <RoomCard key={room.slug} room={room} />;
        })}
      </div>

      <div className="mt-10">
        <GlowButton to="/explorar" size="lg">
          Explorar todas as ofertas
        </GlowButton>
      </div>
    </div>
  );
}
