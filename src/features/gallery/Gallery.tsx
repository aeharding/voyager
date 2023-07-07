import React, { FocusEvent, KeyboardEvent } from "react";
import "photoswipe/dist/photoswipe.css";
import { useAppDispatch } from "../../store";
import { imageLoaded } from "./gallerySlice";

interface GalleryProps {
  src?: string;
  id: string | number;
  alt?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  footer?: React.ReactElement;
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

export function Gallery({ src, alt, className, onClick, id }: GalleryProps) {
  const dispatch = useAppDispatch();

  return (
    <img
      draggable="false"
      data-photoswipe-id={id}
      alt={alt}
      onClick={onClick}
      src={src}
      className={className}
      onLoad={(e) => {
        if (!(e.target instanceof HTMLImageElement)) return;
        if (!src) return;

        dispatch(
          imageLoaded({
            src,
            width: e.target.naturalWidth,
            height: e.target.naturalHeight,
          })
        );
      }}
    />
  );
}
