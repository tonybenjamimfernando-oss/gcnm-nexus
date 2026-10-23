import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Explore from "@/pages/Explore";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import ListingDetail from "@/pages/ListingDetail";
import MapPage from "@/pages/MapPage";
import Marketing from "@/pages/Marketing";
import Messages from "@/pages/Messages";
import NewListing from "@/pages/NewListing";
import Proposals from "@/pages/Proposals";
import NotFound from "@/pages/NotFound";
import Panel from "@/pages/Panel";
import Plans from "@/pages/Plans";
import RoomDetail from "@/pages/RoomDetail";
import Rooms from "@/pages/Rooms";
import SignIn from "@/pages/SignIn";
import Stores from "@/pages/Stores";
import StoreBuilder from "@/pages/StoreBuilder";
import StoreDetail from "@/pages/StoreDetail";
import StorePanel from "@/pages/StorePanel";
import { CurrencyProvider } from "@/lib/currency";
import { FavoritesProvider } from "@/lib/favorites";
import { LanguageProvider } from "@/lib/i18n";
import { SessionProvider } from "@/lib/session";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SessionProvider>
        <CurrencyProvider>
          <FavoritesProvider>
            <LanguageProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/explorar" element={<Explore />} />
                <Route path="/anuncio/:id" element={<ListingDetail />} />
                <Route path="/anuncio/:id/propostas" element={<Proposals />} />
                <Route path="/publicar" element={<NewListing />} />
                <Route path="/mensagens/:id?" element={<Messages />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/salas" element={<Rooms />} />
                <Route path="/salas/:slug" element={<RoomDetail />} />
                <Route path="/lojas" element={<Stores />} />
                <Route path="/lojas/montar" element={<StoreBuilder />} />
                <Route path="/lojas/painel" element={<StorePanel />} />
                <Route path="/loja/:slug" element={<StoreDetail />} />
                <Route path="/mapa" element={<MapPage />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/planos" element={<Plans />} />
                <Route path="/entrar" element={<SignIn />} />
                <Route path="/painel" element={<Panel />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </LanguageProvider>
          </FavoritesProvider>
        </CurrencyProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
