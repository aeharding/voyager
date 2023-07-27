import React, { MutableRefObject, createContext, useRef } from "react";
import { PostCommentItem } from "./PostCommentFeed";

type ItemsRef = MutableRefObject<PostCommentItem[] | undefined>;

interface IFeedContext {
  setItemsRef: (ref: ItemsRef | undefined) => void;
  itemsRef: ItemsRef | undefined;
}

export const FeedContext = createContext<IFeedContext>({
  setItemsRef: () => undefined,
  itemsRef: undefined,
});

interface FeedContextProviderProps {
  children: React.ReactNode;
}

export default function FeedContextProvider({
  children,
}: FeedContextProviderProps) {
  const itemsRef = useRef<ItemsRef>();

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
