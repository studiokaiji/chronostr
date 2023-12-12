import { Outlet } from "react-router-dom";
import { Header } from "./header";

export const Container = () => {
  return (
    <div>
      <header className="w-full sticky top-0 z-50">
        <Header />
      </header>
      <Outlet />
    </div>
  );
};
