import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Footer } from "./footer";

export const Container = () => {
  return (
    <div>
      <header className="w-full sticky top-0 z-50">
        <Header />
      </header>
      <Outlet />
      <footer className="bg-slate-50">
        <Footer />
      </footer>
    </div>
  );
};
