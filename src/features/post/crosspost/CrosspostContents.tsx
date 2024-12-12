import { IonIcon } from "@ionic/react";
import { IonSkeletonText } from "@ionic/react";
import { repeat } from "ionicons/icons";
import { arrowUpSharp } from "ionicons/icons";
import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { useEffect } from "react";

import { imageLoaded } from "#/features/media/imageSlice";
import useAspectRatio from "#/features/media/useAspectRatio";
import LargePostContents from "#/features/post/inFeed/large/LargePostContents";
import usePostSrc from "#/features/post/inFeed/usePostSrc";
import { cx } from "#/helpers/css";
import { formatNumber } from "#/helpers/number";
import { useAppDispatch } from "#/store";

import { CrosspostProps } from "./Crosspost";

import styles from "./CrosspostContents.module.css";

interface CrosspostContentsProps extends CrosspostProps {
  crosspost: PostView | undefined;
  hasBeenRead: boolean;
}

export default function CrosspostContents({
  crosspost,
  hasBeenRead,
  post,
}: CrosspostContentsProps) {
  const dispatch = useAppDispatch();
  const postAspectRatio = useAspectRatio(usePostSrc(post));
  const crosspostSrc = usePostSrc(crosspost);
  const crosspostAspectRatio = useAspectRatio(crosspostSrc);

  // Workaround to immediately copy over the aspect ratio of the original image
  // to avoid flickering when the new crosspost image src loads
  useEffect(() => {
    if (!crosspostSrc) return;
    if (postAspectRatio && !crosspostAspectRatio) {
      dispatch(
        imageLoaded({ src: crosspostSrc, aspectRatio: postAspectRatio }),
      );
    }
  }, [crosspostSrc, postAspectRatio, crosspostAspectRatio, dispatch]);

  return (
    <>
      {crosspost ? (
        <div
          className={cx(
            styles.title,
            hasBeenRead ? styles.titleRead : undefined,
          )}
        >
          {crosspost.post.name}
        </div>
      ) : (
        <IonSkeletonText />
      )}
      <LargePostContents post={crosspost ?? post} />
      <div
        className={cx(
          styles.bottom,
          hasBeenRead ? styles.bottomRead : undefined,
        )}
      >
        <IonIcon className={styles.crosspostIcon} icon={repeat} />
        {crosspost ? (
          crosspost.community.title
        ) : (
          <IonSkeletonText className={styles.communityIonSkeletonText} />
        )}
        <div className={styles.stat}>
          <IonIcon icon={arrowUpSharp} />{" "}
          {crosspost ? (
            formatNumber(crosspost.counts.score)
          ) : (
            <IonSkeletonText className={styles.statIonSkeletonText} />
          )}
        </div>
        <div className={styles.stat}>
          <IonIcon icon={chatbubbleOutline} />{" "}
          {crosspost ? (
            formatNumber(crosspost.counts.comments)
          ) : (
            <IonSkeletonText className={styles.statIonSkeletonText} />
          )}
        </div>
      </div>
    </>
  );
}
