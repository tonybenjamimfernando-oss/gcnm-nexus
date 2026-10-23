import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, TrendingUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { listListings } from "@/lib/api";
import type { ListingView } from "@/lib/api";
import { useCurrency } from "@/lib/currency";

export default function TrendingSidebar() {
  const [items, setItems] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(true);
  const { money } = useCurrency();

  useEffect(function loadTrends() {
    let active = true;
    async function run() {
      try {
        const recent = await listListings({ sort: "recent", limit: 100 });
        const now = new Date();
        const thisMonth = recent
          .filter(function publishedThisMonth(item) {
            const created = new Date(item.createdAt);
            return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
          })
          .sort(function mostViewedFirst(a, b) {
            return b.views - a.views;
          })
          .slice(0, 8);
        if (!active) return;
        if (thisMonth.length > 0) {
          setItems(thisMonth);
          setMonthly(true);
        } else {
          const popular = await listListings({ sort: "views", limit: 8 });
          if (!active) return;
          setItems(popular);
          setMonthly(false);
        }
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return function stop() {
      active = false;
    };
  }, []);

  if (!loading && items.length === 0) return null;
  const loopItems = items.length > 1 ? items.concat(items) : items;

  return (
    <aside className="trend-panel" aria-label="Tendências do mês">
      <div className="trend-panel-heading">
        <span className="trend-heading-icon"><Flame className="h-4 w-4" /></span>
        <div>
          <p className="trend-eyebrow">A mover o mercado</p>
          <h2>{monthly ? "Tendências do mês" : "Populares agora"}</h2>
        </div>
        <TrendingUp className="trend-heading-chart h-5 w-5" />
      </div>
      <p className="trend-intro">{monthly ? "Ofertas publicadas este mês, ordenadas pelas visualizações." : "Ainda sem ofertas deste mês; veja as ofertas mais vistas."}</p>
      {loading ? (
        <div className="trend-loading"><span /> A reunir tendências...</div>
      ) : (
        <div className="trend-viewport">
          <div className="trend-track">
            {loopItems.map(function render(item, index) {
              return (
                <motion.div
                  key={item.id + "-" + index}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.18 }}
                  className="trend-item"
                >
                  <Link to={"/anuncio/" + encodeURIComponent(item.id)} className="trend-item-link">
                    <span className="trend-rank">{(index % items.length) + 1}</span>
                    <img src={item.cover} alt="" loading="lazy" />
                    <span className="trend-item-copy">
                      <span className="trend-item-title">{item.title}</span>
                      <span className="trend-item-price">{item.price === null ? "Preço sob consulta" : money(item.price, item.currency)}</span>
                      <span className="trend-item-meta">{item.views.toLocaleString()} visualizações</span>
                    </span>
                    <ArrowUpRight className="trend-item-arrow h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      <Link to="/explorar?ordenar=views" className="trend-footer">
        Explorar ofertas populares <ArrowUpRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
