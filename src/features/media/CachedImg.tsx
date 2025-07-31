import { ComponentProps, useEffect } from "react";

import { supportsWebp } from "#/helpers/device";
import { isUrlPictrsLike } from "#/helpers/url";
import { parseUrl } from "#/helpers/url";

interface PictrsOptions {
  /**
   * maximum image dimension
   */
  size?: number;

  devicePixelRatio?: number;

  format?: "jpg" | "png" | "webp";
}

const GLOBAL_IMAGE_CACHE = new Map<string, PictrsOptions | null>();

interface CachedImgProps extends Omit<ComponentProps<"img">, "src"> {
  /** Maybe potential pictrs-like URL */
  src: string;

  /**
   * Options to pass to pictrs
   *
   * Has no effect if src is not pictrs-like
   */
  pictrsOptions?: PictrsOptions;
}

export default function CachedImg({ pictrsOptions, ...props }: CachedImgProps) {
  const src = (() => {
    if (GLOBAL_IMAGE_CACHE.has(props.src)) {
      const previousOptions = GLOBAL_IMAGE_CACHE.get(props.src);

      if (
        previousOptions !== undefined &&
        previousOptions?.devicePixelRatio === pictrsOptions?.devicePixelRatio &&
        previousOptions?.format === pictrsOptions?.format
      ) {
        return buildImageSrc(props.src, previousOptions ?? undefined);
      }
    }

    return buildImageSrc(props.src as string, pictrsOptions);
  })();

  useEffect(() => {
    // Cache the fullscreen image. We could cache a given size
    // (and return it later if subsequent requested size is smaller)
    // but this is simpler and works for most cases rn in Voyager
    if (!pictrsOptions?.size) {
      GLOBAL_IMAGE_CACHE.set(props.src, pictrsOptions ?? null);
    }

    return () => {
      GLOBAL_IMAGE_CACHE.delete(props.src);
    };
  }, [pictrsOptions, props.src]);

  return <img {...props} src={src} />;
}

const defaultFormat = supportsWebp() ? "webp" : "jpg";

export function buildImageSrc(url: string, options?: PictrsOptions): string {
  if (!options) return url;

  const mutableUrl = parseUrl(url);

  if (!mutableUrl) return url;
  if (!isUrlPictrsLike(mutableUrl)) return url;

  const params = mutableUrl.searchParams;

  if (options.size) {
    const thumbnail = Math.round(
      options.size * (options?.devicePixelRatio ?? window.devicePixelRatio),
    );

    params.set("thumbnail", `${thumbnail}`);
  }

  params.set("format", options.format ?? defaultFormat);

  return mutableUrl.toString();
}
