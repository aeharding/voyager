import { FocusEvent, KeyboardEvent, useContext, useRef } from "react";
import "photoswipe/dist/photoswipe.css";
import { PostView } from "lemmy-js-client";
import { GalleryContext } from "./GalleryProvider";
import { PreparedPhotoSwipeOptions } from "photoswipe";

export interface GalleryImgProps {
  src?: string;
  alt?: string;
  className?: string;
  post?: PostView;
  animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"];
}

/**
 * TODO: photoswipe traps focus, so onFocusCapture and onKeyDown is a hack to prevent it
 * from detecting that we're changing focus. It's not great.. but it's what we got
 * https://github.com/dimsemenov/PhotoSwipe/issues/1968
 */
export const preventPhotoswipeGalleryFocusTrap = {
  onFocusCapture: (e: FocusEvent) => e.stopPropagation(),
  onKeyDown: (e: KeyboardEvent) => e.stopPropagation(),
};

export function GalleryImg({
  src,
  alt,
  className,
  post,
  animationType,
}: GalleryImgProps) {
  const loaded = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { open } = useContext(GalleryContext);

  const isVideo = src?.endsWith(".webm");

  const InnerComponent = !isVideo ? (
    <img
      ref={imgRef}
      draggable="false"
      alt={alt}
      onClick={(e) => {
        if (!loaded.current) return;

        e.stopPropagation();

        open(e.currentTarget, post, animationType);
      }}
      src={src}
      className={className}
      onLoad={(e) => {
        if (!(e.target instanceof HTMLImageElement)) return;
        if (!src) return;

        loaded.current = true;
      }}
    />
  ) : (
    <video width="100%" controls loop preload="metadata">
      <source type="video/webm" src={src} />
      Your browser does not support playing HTML5 video. You can{" "}
      <a href={src} download>
        download a copy of the video file
      </a>{" "}
      instead.
    </video>
  );

  return InnerComponent;
}
