import { CommentView } from "lemmy-js-client";
import { createContext } from "react";

interface ICommentsContext {
  refresh: () => void;
  prependComments: (comments: CommentView[]) => void;
  appendComments: (comments: CommentView[]) => void;
  getComments: () => CommentView[] | void;
}

export const CommentsContext = createContext<ICommentsContext>({
  refresh: () => {},
  appendComments: () => {},
  prependComments: () => {},
  getComments: () => {},
});
