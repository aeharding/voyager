import { FocusEvent, KeyboardEvent, forwardRef, useRef } from "react";
import "photoswipe/dist/photoswipe.css";
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

export default forwardRef<HTMLImageElement, GalleryMediaProps>(
  function GalleryImg({ src, alt, className, onClick, ...rest }, imgRef) {
    const loaded = useRef(false);

    return (
      <img
        {...rest}
        ref={imgRef}
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
  },
);
