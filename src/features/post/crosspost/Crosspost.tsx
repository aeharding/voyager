import { IonIcon, IonSkeletonText } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import LargePostContents from "#/features/post/inFeed/large/LargePostContents";
import { cx } from "#/helpers/css";
import { formatNumber } from "#/helpers/number";

import CrosspostContainer from "./CrosspostContainer";

import styles from "./Crosspost.module.css";

interface CrosspostProps {
  post: PostView;
  url: string;
  className?: string;
}

export default function Crosspost(props: CrosspostProps) {
  return (
    <CrosspostContainer
      {...props}
      el="div"
      className={cx(styles.container, props.className)}
    >
      {({ crosspost, hasBeenRead }) => (
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
          <LargePostContents post={crosspost ?? props.post} />
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
      )}
    </CrosspostContainer>
  );
}
