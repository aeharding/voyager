import { IonIcon, IonSkeletonText } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { PostView } from "threadiverse";

import Vote from "#/features/labels/vote/Vote";
import { cx } from "#/helpers/css";
import { formatNumber } from "#/helpers/number";

import CrosspostContainer from "./CrosspostContainer";

import styles from "./CompactCrosspost.module.css";

interface CrosspostProps {
  post: PostView;
  url: string;
  className?: string;
}

export default function CompactCrosspost(props: CrosspostProps) {
  return (
    <CrosspostContainer
      {...props}
      className={cx(styles.container, props.className)}
    >
      {({ crosspost }) => (
        <>
          <IonIcon className={styles.crosspostIcon} icon={repeat} />
          {crosspost ? (
            <div className={styles.communityTitle}>
              {crosspost.community.title}
            </div>
          ) : (
            <IonSkeletonText className={styles.communityIonSkeletonText} />
          )}
          <div className={styles.stat}>
            {crosspost ? (
              <Vote
                item={crosspost}
                colorized={false}
                className={styles.vote}
              />
            ) : (
              <>
                <IonIcon icon={arrowUpSharp} />{" "}
                <IonSkeletonText className={styles.statIonSkeletonText} />
              </>
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
        </>
      )}
    </CrosspostContainer>
  );
}
