import { createContext } from "react";
import { Outlet } from "react-router-dom";

export const TabNameContext = createContext("");

export function TabOutlet({ name }: { name: string }) {
  return (
    <TabNameContext value={name}>
      <Outlet />
    </TabNameContext>
  );
}
