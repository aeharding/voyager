import { noop } from "es-toolkit";
import React, { createContext, useCallback, useState } from "react";

interface TitleSearchContext {
  search: string;
  setSearch: (search: string) => void;
  searching: boolean;
  setSearching: (searching: boolean) => void;
  onSubmit: () => void;
  setOnSubmit: (onSubmit: () => void) => void;
}

export const TitleSearchContext = createContext<TitleSearchContext>({
  search: "",
  setSearch: noop,
  searching: false,
  setSearching: noop,
  onSubmit: noop,
  setOnSubmit: noop,
});

export function TitleSearchProvider({ children }: React.PropsWithChildren) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [onSubmit, _setOnSubmit] = useState(() => noop);
  const setOnSubmit = useCallback(
    (fn: () => void) => _setOnSubmit(() => fn),
    [],
  );

  return (
    <TitleSearchContext.Provider
      value={{
        search,
        setSearch,
        searching,
        setSearching,
        onSubmit,
        setOnSubmit,
      }}
    >
      {children}
    </TitleSearchContext.Provider>
  );
}
