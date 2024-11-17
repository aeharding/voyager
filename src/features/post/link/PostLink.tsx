import { PostView } from "lemmy-js-client";
import { ComponentProps, useContext } from "react";

import { InFeedContext } from "#/features/feed/Feed";
import { useAutohidePostIfNeeded } from "#/features/feed/PageTypeContext";
import { isNsfwBlurred } from "#/features/labels/Nsfw";
import { useAppDispatch, useAppSelector } from "#/store";

import { setPostRead } from "../postSlice";
import Link from "./Link";

interface PostLinkProps
  extends Omit<ComponentProps<typeof Link>, "url" | "thumbnail"> {
  post: PostView;
}

export default function PostLink({ post, ...props }: PostLinkProps) {
  const dispatch = useAppDispatch();
  const autohidePostIfNeeded = useAutohidePostIfNeeded();

  const inFeed = useContext(InFeedContext);
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );

  const blur = inFeed ? isNsfwBlurred(post, blurNsfw) : false;

  if (!post.post.url) return;

  return (
    <Link
      {...props}
      onClickCompleted={() => {
        dispatch(setPostRead(post.post.id));
        autohidePostIfNeeded(post);
      }}
      blur={blur}
      url={post.post.url}
      thumbnail={post.post.thumbnail_url}
      compact={!inFeed}
    />
  );
}
