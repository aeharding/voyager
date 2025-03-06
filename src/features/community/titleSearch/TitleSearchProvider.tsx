import { noop } from "es-toolkit";
import React, { createContext, useState } from "react";

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
  function setOnSubmit(fn: () => void) {
    return _setOnSubmit(() => fn);
  }

  return (
    <TitleSearchContext
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
    </TitleSearchContext>
  );
}
