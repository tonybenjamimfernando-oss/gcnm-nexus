import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import MobileDock from "./MobileDock";
import Navbar from "./Navbar";

function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="a1" />
      <span className="a2" />
      <span className="a3" />
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();

  useEffect(
    function top() {
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [location.pathname],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Aurora />
      <Navbar />
      <main className="relative z-10 px-4 pt-[6.6rem] pb-24 md:px-6 md:pt-32 md:pb-16">
        <Outlet />
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}
