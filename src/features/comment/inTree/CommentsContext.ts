import { noop } from "es-toolkit";
import { createContext } from "react";
import { CommentView } from "threadiverse";

interface ICommentsContext {
  refresh: () => void;
  prependComments: (comments: CommentView[]) => void;
  appendComments: (comments: CommentView[]) => void;
  getComments: () => CommentView[] | void;
}

export const CommentsContext = createContext<ICommentsContext>({
  refresh: noop,
  appendComments: noop,
  prependComments: noop,
  getComments: noop,
});
