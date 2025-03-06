import React, { createContext, MutableRefObject, useRef } from "react";

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

export default function FeedContextProvider({
  children,
}: React.PropsWithChildren) {
  const itemsRef = useRef<ItemsRef>(undefined);

  return (
    <FeedContext
      value={{
        setItemsRef: (ref) => (itemsRef.current = ref),
        itemsRefRef: itemsRef,
      }}
    >
      {children}
    </FeedContext>
  );
}
