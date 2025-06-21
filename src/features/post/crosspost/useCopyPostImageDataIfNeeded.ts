import { useEffect } from "react";
import { PostView } from "threadiverse";

import { IMAGE_FAILED, imageLoaded } from "#/features/media/imageSlice";
import useImageData from "#/features/media/useImageData";
import usePostSrc from "#/features/post/inFeed/usePostSrc";
import { useAppDispatch } from "#/store";

/**
 * Workaround to immediately copy over the image data of the original image
 * to avoid flickering when the new crosspost image src loads
 */
export function useCopyPostImageDataIfNeeded(
  post: PostView | undefined,
  crosspost: PostView | undefined,
) {
  const dispatch = useAppDispatch();
  const postImageData = useImageData(usePostSrc(post));
  const crosspostSrc = usePostSrc(crosspost);
  const crosspostImageData = useImageData(crosspostSrc);

  useEffect(() => {
    if (!crosspostSrc) return;
    if (
      postImageData &&
      !crosspostImageData &&
      postImageData !== IMAGE_FAILED
    ) {
      dispatch(
        imageLoaded({
          src: crosspostSrc,
          width: postImageData.width,
          height: postImageData.height,
        }),
      );
    }
  }, [crosspostSrc, postImageData, crosspostImageData, dispatch]);
}
