import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import Spinner from "@/components/ui/Spinner";
import { listListings } from "@/lib/api";
import type { ListingView } from "@/lib/api";
import { ROOMS } from "@/lib/rooms";
import { useCurrency } from "@/lib/currency";
import { listingKindLabel } from "@/lib/format";

const KIND_FILTERS = [
  { id: "", label: "Todos os tipos" },
  { id: "product", label: "Produtos" },
  { id: "service", label: "Servicos" },
  { id: "request", label: "Pedidos" },
  { id: "opportunity", label: "Oportunidades" },
];

const SELECT =
  "h-11 rounded-full border border-white/10 bg-ink-900/70 px-4 text-sm text-white outline-none focus:border-glow-400/60";

function dotIcon() {
  return L.divIcon({
    className: "",
    html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2d7bfd;box-shadow:0 0 14px 4px rgba(45,123,253,0.6);border:2px solid rgba(255,255,255,0.8)"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(
    function fit() {
      if (points.length === 0) return;
      map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 9 });
    },
    [map, points],
  );
  return null;
}

export default function MapPage() {
  const [items, setItems] = useState<ListingView[] | null>(null);
  const [kind, setKind] = useState("");
  const [room, setRoom] = useState("");
  const { money } = useCurrency();

  useEffect(
    function load() {
      let active = true;
      async function run() {
        const rows = await listListings({ limit: 120, kind: kind || null, room: room || null });
        if (!active) return;
        setItems(
          rows.filter(function located(row) {
            return row.latitude !== null && row.longitude !== null;
          }),
        );
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [kind, room],
  );

  const points = useMemo<[number, number][]>(
    function build() {
      return (items || []).map(function point(row) {
        return [row.latitude as number, row.longitude as number];
      });
    },
    [items],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Mapa</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
        Mapa das ofertas
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-haze-300">
        Ofertas ativas com coordenadas, prontas a localizar. Publique um anuncio com latitude e longitude para aparecer
        aqui.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select value={kind} onChange={function pick(event) { setKind(event.target.value); }} className={SELECT} aria-label="Filtrar por tipo">
          {KIND_FILTERS.map(function render(option) {
            return (
              <option key={option.id} value={option.id} className="bg-ink-900">
                {option.label}
              </option>
            );
          })}
        </select>
        <select value={room} onChange={function pick(event) { setRoom(event.target.value); }} className={SELECT} aria-label="Filtrar por sala">
          <option value="" className="bg-ink-900">
            Todas as salas
          </option>
          {ROOMS.map(function render(roomOption) {
            return (
              <option key={roomOption.slug} value={roomOption.slug} className="bg-ink-900">
                {roomOption.name}
              </option>
            );
          })}
        </select>
        {items ? (
          <span className="text-xs font-semibold text-haze-500">{items.length} ofertas no mapa</span>
        ) : null}
      </div>

      <GlassCard className="mt-5 p-2">
        {items === null ? (
          <Spinner label="A carregar o mapa" />
        ) : points.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Ainda sem ofertas localizadas"
              description="Nenhuma oferta ativa com coordenadas neste filtro. Adicione latitude e longitude ao publicar."
              action={
                <Link to="/publicar" className="text-sm font-bold text-glow-400 transition hover:text-white">
                  Publicar oferta
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl">
            <MapContainer
              center={points[0]}
              zoom={4}
              scrollWheelZoom
              style={{ height: "62vh", minHeight: 360, width: "100%", background: "#0b1120" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
                attribution="&copy; OpenStreetMap &copy; CARTO"
              />
              <FitBounds points={points} />
              {items.map(function render(row) {
                return (
                  <Marker key={row.id} position={points[items.indexOf(row)]} icon={dotIcon()}>
                    <Popup>
                      <div style={{ width: 210 }}>
                        <img src={row.cover} alt="" style={{ width: "100%", height: 92, objectFit: "cover", borderRadius: 10 }} />
                        <p style={{ margin: "8px 0 2px", fontSize: 13, fontWeight: 800 }}>{row.title}</p>
                        <p style={{ fontSize: 11, color: "#5b6472" }}>
                          {(row.city || "") + (row.country ? (row.city ? ", " : "") + row.country : "")}
                          {" - "}
                          {listingKindLabel(row.kind)}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: 13, fontWeight: 800, color: "#2d7bfd" }}>
                          {row.price !== null ? money(row.price, row.currency) : "Sob consulta"}
                        </p>
                        <Link to={"/anuncio/" + row.id} style={{ fontSize: 12, fontWeight: 800, color: "#2d7bfd" }}>
                          Ver oferta
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
