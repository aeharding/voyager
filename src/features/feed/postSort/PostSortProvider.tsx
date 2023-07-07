import { SortType } from "lemmy-js-client";
import React, { createContext, useState } from "react";

interface IPostSortContext {
  // used for determining whether page needs to be scrolled up first
  sort: SortType;
  setSort: (sort: SortType) => void;
}

export const PostSortContext = createContext<IPostSortContext>({
  sort: "Active",
  setSort: () => {},
});

export function PostSortContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sort, setSort] = useState<SortType>("Active");

  return (
    <PostSortContext.Provider value={{ sort, setSort }}>
      {children}
    </PostSortContext.Provider>
  );
}
