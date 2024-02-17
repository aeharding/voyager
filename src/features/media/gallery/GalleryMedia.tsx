import {
  HTMLProps,
  MouseEvent,
  Ref,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { isUrlPotentialAnimatedImage } from "../../../helpers/url";
import GalleryGif from "./GalleryGif";
import GalleryImg from "./GalleryImg";
import { PostView } from "lemmy-js-client";
import { PreparedPhotoSwipeOptions } from "photoswipe";
import { GalleryContext } from "./GalleryProvider";
import { useAutohidePostIfNeeded } from "../../feed/PageTypeContext";
import useShouldAutoplay from "../../../core/listeners/network/useShouldAutoplay";

export interface GalleryMediaProps
  extends Omit<HTMLProps<HTMLImageElement>, "ref" | "onClick"> {
  src?: string;
  alt?: string;
  className?: string;
  post?: PostView;
  animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"];
  onClick?: (e: MouseEvent) => boolean | void;
}

export default forwardRef<
  HTMLImageElement | HTMLCanvasElement,
  GalleryMediaProps
>(function GalleryMedia(
  { post, animationType, onClick: _onClick, ...props },
  ref,
) {
  const isGif = useMemo(
    () => props.src && isUrlPotentialAnimatedImage(props.src),
    [props.src],
  );
  const shouldAutoplay = useShouldAutoplay();

  const { open } = useContext(GalleryContext);
  const autohidePostIfNeeded = useAutohidePostIfNeeded();

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (!props.src) return;

      if (
        !(
          e.currentTarget instanceof HTMLImageElement ||
          e.currentTarget instanceof HTMLCanvasElement
        )
      )
        return;

      open(e.currentTarget, props.src, post, animationType);

      // marking read happens after the gallery has finished animating
      // so that the post doesn't rerender before it's fully hidden

      // but autohiding doesn't rerender anything, and is context-sensitive,
      // so just do it now
      if (post) autohidePostIfNeeded(post);

      _onClick?.(e);
    },
    [_onClick, animationType, autohidePostIfNeeded, open, post, props.src],
  );

  if (isGif && !shouldAutoplay) {
    return <GalleryGif {...props} ref={ref} onClick={onClick} />;
  }

  return (
    <GalleryImg
      {...props}
      ref={ref as Ref<HTMLImageElement>}
      onClick={onClick}
    />
  );
});
