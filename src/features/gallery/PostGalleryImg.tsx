import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../helpers/markdown";
import { GalleryImg, GalleryImgProps } from "./GalleryImg";
import { isUrlImage } from "../../helpers/url";

export interface PostGalleryImgProps extends Omit<GalleryImgProps, "src"> {
  post: PostView;
  thumbnail?: boolean;
}

export default function PostGalleryImg({
  post,
  thumbnail = false,
  ...props
}: PostGalleryImgProps) {
  return (
    <GalleryImg {...props} src={getPostImage(post, thumbnail)} post={post} />
  );
}

function getPostImage(post: PostView, thumbnail: boolean): string | undefined {
  if (thumbnail && post.post.thumbnail_url) {
    return post.post.thumbnail_url;
  }

  if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return loneImage.url;
}
