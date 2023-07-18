import { CommentView } from "lemmy-js-client";
import { createContext } from "react";

interface IFeedContext {
  refresh: () => void;
  prependComments: (comments: CommentView[]) => void;
  appendComments: (comments: CommentView[]) => void;
}

export const FeedContext = createContext<IFeedContext>({
  refresh: () => {},
  appendComments: () => {},
  prependComments: () => {},
});
