import { PostView } from "lemmy-js-client";
import { useEffect } from "react";

import { imageLoaded } from "#/features/media/imageSlice";
import useAspectRatio from "#/features/media/useAspectRatio";
import usePostSrc from "#/features/post/inFeed/usePostSrc";
import { useAppDispatch } from "#/store";

/**
 * Workaround to immediately copy over the aspect ratio of the original image
 * to avoid flickering when the new crosspost image src loads
 */
export function useCopyPostAspectRatioIfNeeded(
  post: PostView | undefined,
  crosspost: PostView | undefined,
) {
  const dispatch = useAppDispatch();
  const postAspectRatio = useAspectRatio(usePostSrc(post));
  const crosspostSrc = usePostSrc(crosspost);
  const crosspostAspectRatio = useAspectRatio(crosspostSrc);

  useEffect(() => {
    if (!crosspostSrc) return;
    if (postAspectRatio && !crosspostAspectRatio) {
      dispatch(
        imageLoaded({ src: crosspostSrc, aspectRatio: postAspectRatio }),
      );
    }
  }, [crosspostSrc, postAspectRatio, crosspostAspectRatio, dispatch]);
}
