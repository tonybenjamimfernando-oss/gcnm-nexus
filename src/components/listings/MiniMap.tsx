import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function dotIcon() {
  return L.divIcon({
    className: "",
    html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2d7bfd;box-shadow:0 0 12px 4px rgba(45,123,253,0.55);border:2px solid rgba(255,255,255,0.8)"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function MiniMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={12}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height: 170, width: "100%", background: "#0b1120" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      <Marker position={[latitude, longitude]} icon={dotIcon()} />
    </MapContainer>
  );
}
