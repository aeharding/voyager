import { IonIcon, IonSkeletonText } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { use } from "react";
import { PostView } from "threadiverse";

import Vote from "#/features/labels/vote/Vote";
import LargePostContents from "#/features/post/inFeed/large/LargePostContents";
import { ShareImageContext } from "#/features/share/asImage/ShareAsImage";
import PostTitleMarkdown from "#/features/shared/markdown/PostTitleMarkdown";
import { cx } from "#/helpers/css";
import { formatNumber } from "#/helpers/number";

import { CrosspostProps } from "./Crosspost";
import { useCopyPostImageDataIfNeeded } from "./useCopyPostImageDataIfNeeded";

import sharedStyles from "#/features/labels/links/shared.module.css";
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
  useCopyPostImageDataIfNeeded(post, crosspost);

  return (
    <>
      {crosspost ? (
        <div
          className={cx(
            styles.title,
            hasBeenRead ? styles.titleRead : undefined,
          )}
        >
          <PostTitleMarkdown>{crosspost.post.name}</PostTitleMarkdown>
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
          <span
            className={cx(
              sharedStyles.linkContainer,
              use(ShareImageContext).hideCommunity
                ? sharedStyles.hide
                : undefined,
            )}
          >
            {crosspost.community.title}
          </span>
        ) : (
          <IonSkeletonText className={styles.communityIonSkeletonText} />
        )}
        {crosspost ? (
          <Vote item={crosspost} disabled />
        ) : (
          <div className={styles.stat}>
            <IonIcon icon={arrowUpSharp} />{" "}
            <IonSkeletonText className={styles.statIonSkeletonText} />
          </div>
        )}
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
