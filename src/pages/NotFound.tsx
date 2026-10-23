import EmptyState from "@/components/ui/EmptyState";
import GlowButton from "@/components/ui/GlowButton";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl">
      <EmptyState
        title="Pagina nao encontrada"
        description="O endereco que abriu nao existe neste mercado. Volte ao inicio ou explore as salas comerciais."
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <GlowButton to="/" size="sm">
              Voltar ao inicio
            </GlowButton>
            <GlowButton to="/salas" variant="glass" size="sm">
              Ver as salas
            </GlowButton>
          </div>
        }
      />
    </div>
  );
}
