import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto px-4 pt-2 pb-12 max-w-5xl w-full">{children}</div>
  );
};
