import { PostView } from "lemmy-js-client";
import { isUrlImage } from "../../helpers/lemmy";
import { findLoneImage } from "../../helpers/markdown";
import { GalleryImg, GalleryImgProps } from "./GalleryImg";

export interface PostGalleryImgProps extends Omit<GalleryImgProps, "src"> {
  post: PostView;
}

export default function PostGalleryImg({
  post,
  ...props
}: PostGalleryImgProps) {
  return <GalleryImg {...props} src={getPostImage(post)} post={post} />;
}

function getPostImage(post: PostView): string | undefined {
  if (post.post.thumbnail_url) return post.post.thumbnail_url;

  if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return loneImage.url;
}
