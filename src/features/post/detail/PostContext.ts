import { createContext } from "react";

interface IPostContext {
  // used for ion presentingElement
  refreshPost: () => void;
}

export const PostContext = createContext<IPostContext>({
  refreshPost: () => {},
});
