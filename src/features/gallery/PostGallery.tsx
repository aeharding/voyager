import { useMemo, useRef } from "react";
import GalleryPostActions from "./GalleryPostActions";
import { Gallery, GalleryHandle } from "./Gallery";
import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../helpers/markdown";
import { isUrlImage } from "../../helpers/lemmy";
import { PreparedPhotoSwipeOptions } from "photoswipe";

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
  const galleryRef = useRef<GalleryHandle>(null);

  const images = useMemo(() => getImages(post), [post]);

  if (!images) return null;

  return (
    <Gallery
      onClick={(e) => e.stopPropagation()}
      ref={galleryRef}
      src={images[0]}
      footer={
        <GalleryPostActions
          post={post}
          close={() => galleryRef.current?.close()}
        />
      }
      animationType={animationType}
      className={className}
    />
  );
}

function getImages(post: PostView): string[] | undefined {
  if (post.post.url && isUrlImage(post.post.url)) return [post.post.url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
