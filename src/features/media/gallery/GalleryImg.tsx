import "photoswipe/dist/photoswipe.css";
import { FocusEvent, KeyboardEvent, useRef } from "react";

import { GalleryMediaProps } from "./GalleryMedia";

/**
 * TODO: photoswipe traps focus, so onFocusCapture and onKeyDown is a hack to prevent it
 * from detecting that we're changing focus. It's not great.. but it's what we got
 * https://github.com/dimsemenov/PhotoSwipe/issues/1968
 */
export const preventPhotoswipeGalleryFocusTrap = {
  onFocusCapture: (e: FocusEvent) => e.stopPropagation(),
  onKeyDown: (e: KeyboardEvent) => e.stopPropagation(),
};

interface GalleryImgProps extends Omit<GalleryMediaProps, "ref"> {
  ref?: React.RefObject<HTMLImageElement>;
}

export default function GalleryImg({
  src,
  alt,
  className,
  onClick,
  ...rest
}: GalleryImgProps) {
  const loaded = useRef(false);

  return (
    <img
      {...rest}
      draggable="false"
      alt={alt}
      onClick={(e) => {
        if (!loaded.current) return;

        e.stopPropagation();

        onClick?.(e);
      }}
      src={src}
      className={className}
      onLoad={(e) => {
        rest.onLoad?.(e);

        if (!(e.target instanceof HTMLImageElement)) return;
        if (!src) return;

        loaded.current = true;
      }}
    />
  );
}
