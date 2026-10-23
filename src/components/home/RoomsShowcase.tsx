import RoomCard from "@/components/rooms/RoomCard";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";
import { ROOMS } from "@/lib/rooms";

export default function RoomsShowcase() {
  const featured = ROOMS.slice(0, 6);
  return (
    <section className="mx-auto mt-24 max-w-7xl">
      <SectionHeading
        eyebrow="Salas comerciais"
        title="Doze salas, dez modulos em cada uma"
        description="Cada sala junta catalogo, pedidos de compra, servicos, comparador, tendencias de preco e verificacao de vendedores no mesmo lugar."
        action={
          <GlowButton to="/salas" variant="glass" size="sm">
            Ver todas as salas
          </GlowButton>
        }
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map(function render(room) {
          return <RoomCard key={room.slug} room={room} />;
        })}
      </div>
    </section>
  );
}
