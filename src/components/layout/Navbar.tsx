import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Search, UserRound, X } from "lucide-react";
import CurrencySwitcher from "@/components/ui/CurrencySwitcher";
import GlowButton from "@/components/ui/GlowButton";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/explorar", label: "Explorar" },
  { to: "/salas", label: "Salas" },
  { to: "/planos", label: "Planos" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const path = location.pathname;

  useEffect(function onScroll() {
    function update() {
      setScrolled(window.scrollY > 12);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return function stop() {
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(
    function closeOnRoute() {
      setOpen(false);
    },
    [path],
  );

  function activeIndex(): number {
    for (let index = 0; index < LINKS.length; index += 1) {
      const link = LINKS[index];
      if (link.to === "/" && path === "/") return index;
      if (link.to !== "/" && path.indexOf(link.to) === 0) return index;
    }
    return -1;
  }

  function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const value = term.trim();
    navigate(value.length > 0 ? "/explorar?q=" + encodeURIComponent(value) : "/explorar");
    setOpen(false);
  }

  const current = activeIndex();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-ink-950/75 backdrop-blur-2xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="GCNM Nexus">
          <span className="glass grid h-10 w-10 place-items-center rounded-2xl ring-1 ring-glow-400/40">
            <span className="h-3.5 w-3.5 rounded-full bg-glow-500 shadow-[0_0_18px_4px_rgba(45,123,253,0.65)]" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-extrabold tracking-tight text-white">
              GCNM<span className="text-glow-400">.</span>
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.3em] text-haze-500">Nexus</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center md:flex" aria-label="Navegacao principal">
          {LINKS.map(function render(link, index) {
            const isActive = index === current;
            const showPill = hovered === index || (hovered === null && isActive);
            return (
              <Link
                key={link.to}
                to={link.to}
                onMouseEnter={function enter() {
                  setHovered(index);
                }}
                onMouseLeave={function leave() {
                  setHovered(null);
                }}
                className="relative rounded-full px-3.5 py-2 text-sm font-semibold"
              >
                {showPill ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-glow-400/40 bg-white/10 shadow-[0_10px_30px_-16px_rgba(45,123,253,0.9)]"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <span className={cn("relative z-10 transition-colors", isActive ? "text-white" : "text-haze-300")}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submit} className="relative ml-auto hidden w-full max-w-xs lg:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
          <input
            value={term}
            onChange={function change(event) {
              setTerm(event.target.value);
            }}
            placeholder="O que procura hoje?"
            aria-label="Pesquisar no mercado"
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-haze-500 focus:border-glow-400/60"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <div className="hidden sm:block">
            <CurrencySwitcher />
          </div>
          <GlowButton to={user ? "/painel" : "/entrar"} variant="glass" size="sm" className="hidden sm:inline-flex">
            <UserRound className="h-4 w-4" />
            {user ? "Painel" : "Entrar"}
          </GlowButton>
          <GlowButton to="/salas" size="sm" className="hidden md:inline-flex">
            Explorar salas
          </GlowButton>
          <button
            type="button"
            onClick={function toggle() {
              setOpen(function next(value) {
                return !value;
              });
            }}
            className="glass grid h-10 w-10 place-items-center rounded-full text-haze-100 md:hidden"
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-4 mb-4 rounded-3xl border border-white/10 bg-ink-950/95 p-4 backdrop-blur-2xl md:hidden">
          <form onSubmit={submit} className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-500" />
            <input
              value={term}
              onChange={function change(event) {
                setTerm(event.target.value);
              }}
              placeholder="Pesquisar"
              aria-label="Pesquisar"
              className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
            />
          </form>
          <nav className="mt-4 grid gap-1" aria-label="Navegacao movel">
            {LINKS.map(function render(link) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-haze-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to={user ? "/painel" : "/entrar"}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-haze-300 hover:bg-white/5 hover:text-white"
            >
              {user ? "Painel" : "Entrar"}
            </Link>
          </nav>
          <div className="mt-4 flex items-center justify-between gap-3">
            <CurrencySwitcher />
            <GlowButton to="/salas" size="sm">
              Explorar salas
            </GlowButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
