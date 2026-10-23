import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  BadgeDollarSign,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Factory,
  Megaphone,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { listListings } from "@/lib/api";
import { ROOMS } from "@/lib/rooms";

const ORBIT_ITEMS = [
  { Icon: Megaphone, label: "Marketing", className: "wormhole-item item-one" },
  { Icon: Factory, label: "Indústria", className: "wormhole-item item-two" },
  { Icon: ShoppingCart, label: "Compras", className: "wormhole-item item-three" },
  { Icon: BadgeDollarSign, label: "Vendas", className: "wormhole-item item-four" },
  { Icon: BarChart3, label: "Gestão", className: "wormhole-item item-five" },
  { Icon: Truck, label: "Logística", className: "wormhole-item item-six" },
  { Icon: Package, label: "Produtos", className: "wormhole-item item-seven" },
  { Icon: BriefcaseBusiness, label: "Negócios", className: "wormhole-item item-eight" },
  { Icon: Boxes, label: "Mercadorias", className: "wormhole-item item-nine" },
  { Icon: ArrowLeftRight, label: "Trocas", className: "wormhole-item item-ten" },
];

const RANDOM_TERMS = [
  "tecnologia", "agricultura", "construção", "energia", "logística",
  "moda", "serviços", "máquinas", "alimentos", "educação",
  "decoração", "automóveis",
];

export default function CosmicWormhole() {
  const navigate = useNavigate();
  const [travelling, setTravelling] = useState(false);

  async function enterWormhole() {
    if (travelling) return;
    setTravelling(true);
    try {
      const listings = await listListings({ sort: "recent", limit: 100 });
      if (listings.length > 0) {
        const pick = listings[Math.floor(Math.random() * listings.length)];
        navigate("/anuncio/" + encodeURIComponent(pick.id));
        return;
      }
    } catch {
      // A descoberta aleatória continua disponível mesmo se o catálogo falhar.
    } finally {
      setTravelling(false);
    }

    const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
    if (room) {
      navigate("/salas/" + encodeURIComponent(room.slug));
      return;
    }
    const term = RANDOM_TERMS[Math.floor(Math.random() * RANDOM_TERMS.length)];
    navigate("/explorar?q=" + encodeURIComponent(term));
  }

  return (
    <section className="cosmic-wormhole mx-auto mt-10 mb-4 max-w-5xl" aria-labelledby="wormhole-title">
      <div className="wormhole-heading">
        <span className="wormhole-kicker"><Sparkles className="h-3.5 w-3.5" /> PORTAL DE DESCOBERTA GCNM</span>
        <h2 id="wormhole-title">Entre no <span>desconhecido comercial</span></h2>
        <p>Uma passagem para oportunidades inesperadas — produtos, mercados, ideias e negócios à sua espera.</p>
      </div>

      <div className="wormhole-scene">
        <div className="wormhole-stars" aria-hidden="true" />
        <div className="wormhole-nebula nebula-a" aria-hidden="true" />
        <div className="wormhole-nebula nebula-b" aria-hidden="true" />
        <div className="wormhole-orbit orbit-outer" aria-hidden="true" />
        <div className="wormhole-orbit orbit-middle" aria-hidden="true" />
        <div className="wormhole-orbit orbit-inner" aria-hidden="true" />
        <div className="wormhole-accretion" aria-hidden="true" />
        <div className="wormhole-lens" aria-hidden="true" />
        <div className="wormhole-core" aria-hidden="true" />
        {ORBIT_ITEMS.map(({ Icon, label, className }) => (
          <div key={label} className={className} aria-label={label} title={label}>
            <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.7} />
            <span>{label}</span>
          </div>
        ))}
        <button
          type="button"
          className="wormhole-enter"
          onClick={enterWormhole}
          disabled={travelling}
          aria-label="Entrar no buraco de minhoca e descobrir uma oferta aleatória"
        >
          <span className="wormhole-enter-icon"><Search className="h-5 w-5" /></span>
          <span>{travelling ? "A atravessar..." : "Entrar no portal"}</span>
          <small>{travelling ? "A calcular trajecto" : "Descoberta aleatória"}</small>
        </button>
        <span className="wormhole-caption caption-left" aria-hidden="true">EVENT HORIZON · GCNM</span>
        <span className="wormhole-caption caption-right" aria-hidden="true">NOVAS ROTAS · NOVAS OPORTUNIDADES</span>
      </div>
      <p className="wormhole-footnote">Cada entrada revela uma oferta activa ao acaso; se o catálogo estiver vazio, o portal abre uma sala comercial aleatória.</p>
    </section>
  );
}
