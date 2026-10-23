import { Link } from "react-router-dom";
import { Github, Globe2, ShieldCheck } from "lucide-react";

const COLUMNS = [
  {
    title: "Mercado",
    links: [
      { label: "Explorar ofertas", to: "/explorar" },
      { label: "Todas as salas", to: "/salas" },
      { label: "Planos e precos", to: "/planos" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", to: "/entrar" },
      { label: "Painel", to: "/painel" },
      { label: "Guardados", to: "/painel" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/10 bg-ink-950/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-28 pt-14 md:grid-cols-4 md:px-6 md:pb-14">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="glass grid h-10 w-10 place-items-center rounded-2xl ring-1 ring-glow-400/40">
              <Globe2 className="h-5 w-5 text-glow-400" />
            </span>
            <span className="font-display text-lg font-extrabold text-white">
              GCNM<span className="text-glow-400">.</span> Nexus
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-haze-300">
            A rede global de comercio em camadas: 12 salas comerciais, ofertas de produtos, servicos e pedidos de
            compra, com precos na moeda de cada visitante.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-haze-500">
            <ShieldCheck className="h-4 w-4 text-mint-400" />
            Vendedores verificados e avaliacoes publicas
          </p>
        </div>
        {COLUMNS.map(function render(column) {
          return (
            <div key={column.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-haze-500">{column.title}</p>
              <div className="mt-4 grid gap-2.5">
                {column.links.map(function renderLink(link) {
                  return (
                    <Link key={link.label} to={link.to} className="text-sm text-haze-300 transition hover:text-white">
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-haze-500 md:flex-row md:items-center md:justify-between md:px-6">
          <span>GCNM Nexus - Global Commerce Network Map</span>
          <a
            href="https://github.com/tonybenjamimfernando-oss/gcnm-nexus"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <Github className="h-4 w-4" />
            Codigo e documentacao
          </a>
        </div>
      </div>
    </footer>
  );
}
