import { PreparedPhotoSwipeOptions } from "photoswipe";
import { ComponentProps, MouseEvent, use } from "react";
import { PostView } from "threadiverse";

import useShouldAutoplay from "#/core/listeners/network/useShouldAutoplay";
import { useAutohidePostIfNeeded } from "#/features/feed/PageTypeContext";
import Video, { VideoProps } from "#/features/media/video/Video";
import { isUrlPotentialAnimatedImage, isUrlVideo } from "#/helpers/url";

import GalleryGif from "./GalleryGif";
import GalleryImg from "./GalleryImg";
import { GalleryContext } from "./GalleryProvider";

export interface GalleryMediaProps extends Omit<VideoProps, "ref" | "src"> {
  src?: string;
  alt?: string;
  className?: string;
  post?: PostView;
  animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"];
  onClick?: (e: MouseEvent) => boolean | void;

  ref?:
    | React.Ref<HTMLImageElement>
    | React.Ref<HTMLCanvasElement>
    | React.Ref<HTMLVideoElement>;
}

export default function GalleryMedia({
  post,
  animationType,
  onClick: _onClick,
  controls,
  volume,
  progress,
  disableInlineInteraction,
  portalWithMediaId,
  allowShowPlayButton,
  ref,
  ...props
}: GalleryMediaProps) {
  const isVideo =
    props.src && isUrlVideo(props.src, post?.post.url_content_type);

  const isGif =
    props.src &&
    isUrlPotentialAnimatedImage(props.src, post?.post.url_content_type);

  const shouldAutoplay = useShouldAutoplay();

  const { open } = use(GalleryContext);
  const autohidePostIfNeeded = useAutohidePostIfNeeded();

  function onClick(e: MouseEvent) {
    if (!props.src) return;

    if (
      !(
        e.currentTarget instanceof HTMLImageElement ||
        e.currentTarget instanceof HTMLCanvasElement ||
        e.currentTarget instanceof HTMLVideoElement
      )
    )
      return;

    if (e.target instanceof HTMLElement && e.target.closest("a")) return;

    e.preventDefault();

    open(e.currentTarget, props.src, post, portalWithMediaId, animationType);

    // marking read happens after the gallery has finished animating
    // so that the post doesn't rerender before it's fully hidden

    // but autohiding doesn't rerender anything, and is context-sensitive,
    // so just do it now
    if (post) autohidePostIfNeeded(post);

    _onClick?.(e);
  }

  if (isVideo)
    return (
      <Video
        {...props}
        src={props.src!}
        controls={controls}
        disableInlineInteraction={disableInlineInteraction}
        volume={volume}
        progress={progress}
        portalWithMediaId={portalWithMediaId}
        ref={ref as ComponentProps<typeof Video>["ref"]}
        allowShowPlayButton={allowShowPlayButton}
        onClick={onClick}
      />
    );

  if (isGif && !shouldAutoplay) {
    return (
      <GalleryGif
        {...props}
        ref={ref as ComponentProps<typeof GalleryGif>["ref"]}
        onClick={onClick}
      />
    );
  }

  return (
    <GalleryImg
      {...props}
      ref={ref as React.RefObject<HTMLImageElement>}
      onClick={onClick}
    />
  );
}
