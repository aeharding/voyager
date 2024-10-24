import React, { createContext, useCallback, useMemo, useState } from "react";

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
  const [onSubmit, _setOnSubmit] = useState(() => () => {});
  const setOnSubmit = useCallback(
    (fn: () => void) => _setOnSubmit(() => fn),
    [],
  );

  const value = useMemo(
    () => ({
      search,
      setSearch,
      searching,
      setSearching,
      onSubmit,
      setOnSubmit,
    }),
    [onSubmit, search, searching, setOnSubmit],
  );

  return (
    <TitleSearchContext.Provider value={value}>
      {children}
    </TitleSearchContext.Provider>
  );
}
