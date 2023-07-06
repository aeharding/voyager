import React, { createContext, useState } from "react";

type TitleSearchContext = {
  search: string;
  setSearch: (search: string) => void;
  searching: boolean;
  setSearching: (searching: boolean) => void;
  onSubmit: () => void;
  setOnSubmit: (onSubmit: () => void) => void;
};
export const TitleSearchContext = createContext<TitleSearchContext>({
  search: "",
  setSearch: () => {},
  searching: false,
  setSearching: () => {},
  onSubmit: () => {},
  setOnSubmit: () => {},
});

interface TitleSearchProviderProps {
  children: React.ReactNode;
}

export function TitleSearchProvider({ children }: TitleSearchProviderProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [onSubmit, setOnSubmit] = useState(() => () => {});

  return (
    <TitleSearchContext.Provider
      value={{
        search,
        setSearch,
        searching,
        setSearching,
        onSubmit,
        setOnSubmit: (fn) => setOnSubmit(() => fn),
      }}
    >
      {children}
    </TitleSearchContext.Provider>
  );
}
