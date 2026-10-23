import ListingCard from "@/components/listings/ListingCard";
import TrendingSidebar from "@/components/listings/TrendingSidebar";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import type { ListingView } from "@/lib/api";

type Props = {
  items: ListingView[];
  loading: boolean;
};

export default function Spotlight({ items, loading }: Props) {
  return (
    <section className="mx-auto mt-24 max-w-7xl">
      <SectionHeading
        eyebrow="Em destaque"
        title="Ofertas que estao a mover o mercado"
        description="Produtos, servicos e pedidos de compra publicados recentemente nas salas comerciais."
        action={
          <GlowButton to="/explorar" variant="glass" size="sm">
            Explorar tudo
          </GlowButton>
        }
      />
      {loading ? <Spinner label="A carregar ofertas" /> : null}
      {!loading && items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Ainda sem ofertas publicadas"
            description="Assim que as primeiras ofertas entrarem, aparecem aqui em destaque."
            action={
              <GlowButton to="/salas" size="sm">
                Ver as salas
              </GlowButton>
            }
          />
        </div>
      ) : null}
      {!loading && items.length > 0 ? (
        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(function render(item) {
              return <ListingCard key={item.id} item={item} />;
            })}
          </div>
          <TrendingSidebar />
        </div>
      ) : null}
    </section>
  );
}
