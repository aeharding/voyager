import { styled } from "@linaria/react";
import { CommentView, PostView } from "lemmy-js-client";
import { createContext, ReactNode, useContext } from "react";

import { isPost } from "#/helpers/lemmy";
import { useAppSelector } from "#/store";

import ModeratableItemBanner, {
  getModStateBackgroundColor,
  ItemModStateType,
  useItemModState,
} from "./banner/ModeratableItemBanner";
import useCanModerate from "./useCanModerate";

const ModeratableItemContainer = styled.div<{
  modState?: ItemModStateType;
  highlighted?: boolean;
}>`
  width: 100%;

  background: ${({ modState, highlighted }) => {
    const color =
      modState !== undefined ? getModStateBackgroundColor(modState) : undefined;

    if (color) return color;

    if (highlighted) return "var(--ion-color-light)";

    return "none";
  }};
`;

interface ModeratableItemProps {
  itemView: PostView | CommentView;
  children?: ReactNode;
  highlighted?: boolean;
}

export default function ModeratableItem({
  itemView,
  children,
  highlighted,
}: ModeratableItemProps) {
  const canModerate = useCanModerate(itemView.community);

  const item = useAppSelector((state) => {
    if (isPost(itemView)) {
      const potentialPost = state.post.postById[itemView.post.id];
      if (!potentialPost || potentialPost === "not-found") return itemView.post;

      return potentialPost.post ?? itemView.post;
    }

    return state.comment.commentById[itemView.comment.id] ?? itemView.comment;
  });

  const modState = useItemModState(item);

  const shouldShowModBanner = canModerate && modState;

  if (highlighted && !shouldShowModBanner) {
    return (
      <ModeratableItemContainer highlighted>
        {children}
      </ModeratableItemContainer>
    );
  }

  if (!shouldShowModBanner) return children;

  const banner = (
    <ModeratableItemBanner modState={modState} itemView={itemView} />
  );

  return (
    <ModeratableItemContext.Provider value={{ banner }}>
      <ModeratableItemContainer modState={modState}>
        {children}
      </ModeratableItemContainer>
    </ModeratableItemContext.Provider>
  );
}

interface IModeratableItemContext {
  banner: ReactNode | undefined;
}

const ModeratableItemContext = createContext<IModeratableItemContext>({
  banner: undefined,
});

export function ModeratableItemBannerOutlet() {
  const { banner } = useContext(ModeratableItemContext);

  return banner;
}
