import { useCallback } from "react";
import Feed, { FeedProps, FetchFn } from "./Feed";
import FeedComment from "../comment/inFeed/FeedComment";
import { CommentView, PostView } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../store";
import { css } from "@emotion/react";
import { receivedPosts } from "../post/postSlice";
import { receivedComments } from "../comment/commentSlice";
import Post from "../post/inFeed/Post";
import CommentHr from "../comment/CommentHr";
import { useIonModal } from "@ionic/react";
import Login from "../auth/Login";
import { ModalContext } from "../../pages/shared/ModalContext";

const thickBorderCss = css`
  border-bottom: 8px solid var(--thick-separator-color);
`;

export type PostCommentItem = PostView | CommentView;

export function isPost(item: PostCommentItem): item is PostView {
  return !isComment(item);
}

export function isComment(item: PostCommentItem): item is CommentView {
  return "comment" in item;
}

interface PostCommentFeed
  extends Omit<FeedProps<PostCommentItem>, "renderItemContent"> {
  communityName?: string;
}

export default function PostCommentFeed({
  communityName,
  fetchFn: _fetchFn,
  ...rest
}: PostCommentFeed) {
  const dispatch = useAppDispatch();
  const postAppearanceType = useAppSelector(
    (state) => state.appearance.posts.type
  );

  const borderCss = (() => {
    switch (postAppearanceType) {
      case "compact":
        return undefined;
      case "large":
        return thickBorderCss;
    }
  })();

  const renderItem = useCallback(
    (item: PostCommentItem) => {
      if (isPost(item))
        return (
          <Post post={item} communityMode={!!communityName} css={borderCss} />
        );

      return <FeedComment comment={item} css={borderCss} />;
    },
    [communityName, borderCss]
  );

  const renderItemContent = useCallback(
    (item: PostCommentItem) => {
      if (postAppearanceType === "compact")
        return (
          <>
            {renderItem(item)}
            <CommentHr depth={0} />
          </>
        );

      return renderItem(item);
    },
    [postAppearanceType, renderItem]
  );

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const items = await _fetchFn(page);

      dispatch(receivedPosts(items.filter(isPost)));
      dispatch(receivedComments(items.filter(isComment)));

      return items;
    },
    [_fetchFn, dispatch]
  );

  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });

  return (
    <ModalContext.Provider value={{ login }}>
      <Feed fetchFn={fetchFn} renderItemContent={renderItemContent} {...rest} />
    </ModalContext.Provider>
  );
}
