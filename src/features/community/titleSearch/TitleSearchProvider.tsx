import React, { createContext, useState } from "react";

type TitleSearchContext = {
  search: string;
  setSearch: (search: string) => void;
  searching: boolean;
  setSearching: (searching: boolean) => void;
};
export const TitleSearchContext = createContext<TitleSearchContext>({
  search: "",
  setSearch: () => {},
  searching: false,
  setSearching: () => {},
});

interface TitleSearchProviderProps {
  children: React.ReactNode;
}

export function TitleSearchProvider({ children }: TitleSearchProviderProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  return (
    <TitleSearchContext.Provider
      value={{ search, setSearch, searching, setSearching }}
    >
      {children}
    </TitleSearchContext.Provider>
  );
}
