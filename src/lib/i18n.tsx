import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "pt" | "en";

const DICT: Record<Lang, Record<string, string>> = {
  pt: {
    "nav.home": "Inicio",
    "nav.explore": "Explorar",
    "nav.rooms": "Salas",
    "nav.stores": "Lojas",
    "nav.marketing": "Marketing",
    "nav.map": "Mapa",
    "nav.plans": "Planos",
    "nav.publish": "Publicar",
    "nav.signin": "Entrar",
    "nav.dashboard": "Painel",
    "nav.exploreRooms": "Explorar salas",
    "nav.publishListing": "Publicar anuncio",
    "nav.search": "O que procura hoje?",
    "nav.searchShort": "Pesquisar",
    "footer.market": "Mercado",
    "footer.account": "Conta",
    "footer.exploreOffers": "Explorar ofertas",
    "footer.allRooms": "Todas as salas",
    "footer.map": "Mapa das ofertas",
    "footer.plansPrices": "Planos e precos",
    "footer.signin": "Entrar",
    "footer.dashboard": "Painel",
    "footer.saved": "Guardados",
    "footer.about":
      "A rede global de comercio em camadas: 12 salas comerciais, ofertas de produtos, servicos e pedidos de compra, com precos na moeda de cada visitante.",
    "footer.trust": "Vendedores verificados e avaliacoes publicas",
    "footer.code": "Codigo e documentacao",
  },
  en: {
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.rooms": "Rooms",
    "nav.stores": "Stores",
    "nav.marketing": "Marketing",
    "nav.map": "Map",
    "nav.plans": "Plans",
    "nav.publish": "Publish",
    "nav.signin": "Sign in",
    "nav.dashboard": "Dashboard",
    "nav.exploreRooms": "Explore rooms",
    "nav.publishListing": "Publish listing",
    "nav.search": "What are you looking for today?",
    "nav.searchShort": "Search",
    "footer.market": "Market",
    "footer.account": "Account",
    "footer.exploreOffers": "Browse offers",
    "footer.allRooms": "All rooms",
    "footer.map": "Offers map",
    "footer.plansPrices": "Plans and pricing",
    "footer.signin": "Sign in",
    "footer.dashboard": "Dashboard",
    "footer.saved": "Saved",
    "footer.about":
      "The layered global commerce network: 12 commerce rooms with product, service and purchase-request offers, priced in every visitor's currency.",
    "footer.trust": "Verified sellers and public reviews",
    "footer.code": "Code and documentation",
  },
};

type LanguageValue = { lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string };

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(function initial(): Lang {
    const stored = window.localStorage.getItem("gcnm-lang");
    if (stored === "pt" || stored === "en") return stored;
    return navigator.language.toLowerCase().indexOf("pt") === 0 ? "pt" : "en";
  });

  useEffect(
    function persist() {
      window.localStorage.setItem("gcnm-lang", lang);
      document.documentElement.lang = lang;
    },
    [lang],
  );

  const value = useMemo<LanguageValue>(
    function build() {
      return {
        lang,
        setLang: function choose(next: Lang) {
          setLangState(next);
        },
        t: function translate(key: string) {
          return DICT[lang][key] ?? DICT.pt[key] ?? key;
        },
      };
    },
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage precisa do LanguageProvider");
  return value;
}
