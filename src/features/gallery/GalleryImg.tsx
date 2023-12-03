import {
  FocusEvent,
  HTMLProps,
  KeyboardEvent,
  forwardRef,
  useContext,
  useRef,
} from "react";
import "photoswipe/dist/photoswipe.css";
import { PostView } from "lemmy-js-client";
import { GalleryContext } from "./GalleryProvider";
import { PreparedPhotoSwipeOptions } from "photoswipe";

export interface GalleryImgProps
  extends Omit<HTMLProps<HTMLImageElement>, "ref"> {
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

export default forwardRef<HTMLImageElement, GalleryImgProps>(
  function GalleryImg(
    { src, alt, className, post, animationType, ...rest },
    imgRef,
  ) {
    const loaded = useRef(false);
    const { open } = useContext(GalleryContext);

    return (
      <img
        {...rest}
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
          rest.onLoad?.(e);

          if (!(e.target instanceof HTMLImageElement)) return;
          if (!src) return;

          loaded.current = true;
        }}
      />
    );
  },
);
