import { IonIcon } from "@ionic/react";
import { IonSkeletonText } from "@ionic/react";
import { repeat } from "ionicons/icons";
import { arrowUpSharp } from "ionicons/icons";
import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import LargePostContents from "#/features/post/inFeed/large/LargePostContents";
import { cx } from "#/helpers/css";
import { formatNumber } from "#/helpers/number";

import { CrosspostProps } from "./Crosspost";
import { useCopyPostAspectRatioIfNeeded } from "./useCopyPostAspectRatioIfNeeded";

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
  useCopyPostAspectRatioIfNeeded(post, crosspost);

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
