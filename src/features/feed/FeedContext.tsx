import React, { MutableRefObject, createContext, useMemo, useRef } from "react";
import { PostCommentItem } from "./PostCommentFeed";

type ItemsRef = MutableRefObject<PostCommentItem[] | undefined>;

interface IFeedContext {
  setItemsRef: (ref: ItemsRef | undefined) => void;

  /**
   * yodawg
   */
  itemsRefRef: React.MutableRefObject<ItemsRef | undefined> | undefined;
}

export const FeedContext = createContext<IFeedContext>({
  setItemsRef: () => undefined,
  itemsRefRef: undefined,
});

interface FeedContextProviderProps {
  children: React.ReactNode;
}

export default function FeedContextProvider({
  children,
}: FeedContextProviderProps) {
  const itemsRef = useRef<ItemsRef | undefined>();

  const feedContextValue: IFeedContext = useMemo(
    () => ({
      setItemsRef: (ref) => (itemsRef.current = ref),
      itemsRefRef: itemsRef,
    }),
    [],
  );

  return (
    <FeedContext.Provider value={feedContextValue}>
      {children}
    </FeedContext.Provider>
  );
}
