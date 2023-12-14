import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="mx-auto p-4 max-w-5xl w-full">{children}</div>;
};
