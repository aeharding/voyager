import { PostView } from "lemmy-js-client";
import { getPostMedia } from "../../media/gallery/Media";
import { useMemo } from "react";
import { useAppSelector } from "../../../store";
import { IMAGE_FAILED } from "./large/imageSlice";

export default function usePostSrc(post: PostView): string | undefined {
  const src = useMemo(() => getPostMedia(post), [post]);
  const primaryFailed = useAppSelector(
    (state) => src && state.image.loadedBySrc[src[0]] === IMAGE_FAILED,
  );

  if (!src) return;

  if (primaryFailed && src[1]) return src[1];

  return src[0];
}
