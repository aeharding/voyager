import { ComponentProps, useContext } from "react";
import Link from "./Link";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useAutohidePostIfNeeded } from "../../feed/PageTypeContext";
import { InFeedContext } from "../../feed/Feed";
import { isNsfwBlurred } from "../../labels/Nsfw";
import { PostView } from "lemmy-js-client";
import { setPostRead } from "../postSlice";

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
      onClick={() => {
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
