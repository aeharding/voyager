import { ComponentProps } from "react";

import { unfurlLemmyImageProxy } from "#/helpers/url";
import { useAppDispatch, useAppSelector } from "#/store";

import { IMAGE_FAILED, imageFailed } from "./imageSlice";

interface UnproxiedFallbackImgProps extends Omit<ComponentProps<"img">, "src"> {
  src: string;
}

export default function UnproxiedFallbackImg(props: UnproxiedFallbackImgProps) {
  const dispatch = useAppDispatch();

  const originalSrcFailed = useAppSelector((state) => {
    return state.image.loadedBySrc[props.src] === IMAGE_FAILED;
  });
  const src = originalSrcFailed ? unfurlLemmyImageProxy(props.src) : props.src;

  function onError(e: React.SyntheticEvent<HTMLImageElement>) {
    if (!originalSrcFailed && src === props.src) {
      dispatch(imageFailed(src));
    }

    // Only call parent onError if tried to fallback and failed
    if (originalSrcFailed && src !== props.src) {
      props.onError?.(e);
    }
  }

  return <img {...props} src={src} onError={onError} />;
}
