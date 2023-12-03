import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../helpers/markdown";
import GalleryImg, { GalleryImgProps } from "./GalleryImg";
import { isUrlMedia, isUrlVideo } from "../../helpers/url";
import Video, { VideoProps } from "../shared/Video";
import { forwardRef } from "react";

export interface PostGalleryImgProps
  extends Omit<GalleryImgProps & VideoProps, "src"> {
  post: PostView;
}

export default forwardRef<HTMLImageElement, PostGalleryImgProps>(
  function PostMedia({ post, ...props }, ref) {
    const src = getPostMedia(post);

    if (src && isUrlVideo(src)) return <Video src={src} {...props} />;

    return <GalleryImg {...props} ref={ref} src={src} post={post} />;
  },
);

export function getPostMedia(post: PostView): string | undefined {
  if (post.post.url && isUrlMedia(post.post.url)) return post.post.url;

  if (post.post.thumbnail_url) return post.post.thumbnail_url;

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return loneImage.url;
}
