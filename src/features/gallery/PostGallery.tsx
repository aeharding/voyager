import { useContext, useMemo } from "react";
import GalleryPostActions from "./GalleryPostActions";
import { Gallery } from "./Gallery";
import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../helpers/markdown";
import { isUrlImage } from "../../helpers/lemmy";
import { PreparedPhotoSwipeOptions } from "photoswipe";
import { GalleryContext } from "./GalleryProvider";

interface PostGalleryProps {
  post: PostView;

  className?: string;
  animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"];
}

export default function PostGallery({
  post,
  className,
  animationType,
}: PostGalleryProps) {
  const { open } = useContext(GalleryContext);

  const images = useMemo(() => getImages(post), [post]);

  if (!images) return null;

  return (
    <Gallery
      id={post.post.id}
      onClick={(e) => {
        e.stopPropagation();

        open(post, animationType);
      }}
      src={images[0]}
      footer={<GalleryPostActions post={post} />}
      className={className}
    />
  );
}

function getImages(post: PostView): string[] | undefined {
  if (post.post.url && isUrlImage(post.post.url)) return [post.post.url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
