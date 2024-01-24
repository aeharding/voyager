import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../helpers/markdown";
import GalleryImg, { GalleryImgProps } from "./GalleryImg";
import { isUrlMedia, isUrlVideo } from "../../helpers/url";
import Video, { VideoProps } from "../shared/Video";
import { RefObject, forwardRef, memo, useMemo } from "react";

export interface PostGalleryImgProps
  extends Omit<GalleryImgProps & VideoProps, "src"> {
  post: PostView;
}

const PostMedia = forwardRef<
  HTMLVideoElement | HTMLImageElement,
  PostGalleryImgProps
>(function PostMedia({ post, ...props }, ref) {
  const src = useMemo(() => getPostMedia(post), [post]);
  const isVideo = useMemo(() => src && isUrlVideo(src), [src]);

  if (isVideo)
    return (
      <Video ref={ref as RefObject<HTMLVideoElement>} src={src!} {...props} />
    );

  return (
    <GalleryImg
      {...props}
      ref={ref as RefObject<HTMLImageElement>}
      src={src}
      post={post}
    />
  );
});

export default memo(PostMedia);

export function getPostMedia(post: PostView): string | undefined {
  if (post.post.url && isUrlMedia(post.post.url)) {
    if (post.post.thumbnail_url) return post.post.thumbnail_url;

    return post.post.url;
  }

  if (post.post.thumbnail_url) return post.post.thumbnail_url;

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return loneImage.url;
}
