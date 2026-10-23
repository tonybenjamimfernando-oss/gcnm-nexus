import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Explore from "@/pages/Explore";
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import NotFound from "@/pages/NotFound";
import Panel from "@/pages/Panel";
import Plans from "@/pages/Plans";
import RoomDetail from "@/pages/RoomDetail";
import Rooms from "@/pages/Rooms";
import SignIn from "@/pages/SignIn";
import { CurrencyProvider } from "@/lib/currency";
import { FavoritesProvider } from "@/lib/favorites";
import { SessionProvider } from "@/lib/session";

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <CurrencyProvider>
          <FavoritesProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/explorar" element={<Explore />} />
                <Route path="/anuncio/:id" element={<ListingDetail />} />
                <Route path="/salas" element={<Rooms />} />
                <Route path="/salas/:slug" element={<RoomDetail />} />
                <Route path="/planos" element={<Plans />} />
                <Route path="/entrar" element={<SignIn />} />
                <Route path="/painel" element={<Panel />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </FavoritesProvider>
        </CurrencyProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
