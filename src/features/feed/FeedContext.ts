import { createContext } from "react";

interface IFeedContext {
  refresh: () => void;
}

export const FeedContext = createContext<IFeedContext>({
  refresh: () => {},
});
