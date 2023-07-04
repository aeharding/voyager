import { CommentView } from "lemmy-js-client";
import { createContext } from "react";

interface IFeedContext {
  refresh: () => void;
  appendComments: (comments: CommentView[]) => void;
}

export const FeedContext = createContext<IFeedContext>({
  refresh: () => {},
  appendComments: () => {},
});
