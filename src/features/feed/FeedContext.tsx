import React, { createContext, useRef } from "react";

type ItemsRef<I> = React.MutableRefObject<I[]>;

interface IFeedContext<I> {
  setItemsRef: (ref: ItemsRef<I> | undefined) => void;
  getCurrentItems: ItemsRef<I> | undefined;
}

export const FeedContext = createContext<IFeedContext<I>>({
  setItemsRef: () => undefined,
  itemsRef: undefined,
});

interface FeedContextProviderProps {
  children: React.ReactNode;
}

export default function FeedContextProvider({
  children,
}: FeedContextProviderProps) {
  const itemsRef = useRef(null);

  return (
    <FeedContext.Provider
      value={{
        setItemsRef: (ref) => (itemsRef.current = ref),
        itemsRef: itemsRef.current,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}
