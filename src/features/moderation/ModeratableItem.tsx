import { css } from "@emotion/react";
import RemovedByBanner, {
  ItemModState,
  getItemModState,
  getModStateBackgroundColor,
} from "./RemovedByBanner";
import { CommentView, PostView } from "lemmy-js-client";
import { ReactNode, createContext, useContext } from "react";
import styled from "@emotion/styled";
import useCanModerate from "./useCanModerate";
import { useAppSelector } from "../../store";
import { isPost } from "../feed/PostCommentFeed";

const ModeratableItemContainer = styled.div<{ modState?: ItemModState }>`
  width: 100%;

  ${({ modState }) => {
    const color =
      modState !== undefined ? getModStateBackgroundColor(modState) : undefined;

    if (color)
      return css`
        background: ${color};
      `;
  }}
`;

interface ModeratableItemProps {
  itemView: PostView | CommentView;
  children?: ReactNode;
}

export default function ModeratableItem({
  itemView,
  children,
}: ModeratableItemProps) {
  const canModerate = useCanModerate(itemView.community.id);

  const item = useAppSelector((state) => {
    if (isPost(itemView)) {
      const potentialPost = state.post.postById[itemView.post.id];
      if (!potentialPost || potentialPost === "not-found") return itemView.post;

      return potentialPost.post ?? itemView.post;
    }

    return state.comment.commentById[itemView.comment.id] ?? itemView.comment;
  });

  const modState = getItemModState(item);

  if (!canModerate || !modState) return children;

  const banner = <RemovedByBanner modState={modState} item={item} />;

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
