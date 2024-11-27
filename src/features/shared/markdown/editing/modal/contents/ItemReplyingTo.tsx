import { IonIcon } from "@ionic/react";
import { returnDownForwardSharp } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";

import CommentContent from "#/features/comment/CommentContent";
import Ago from "#/features/labels/Ago";
import Edited from "#/features/labels/Edited";
import Vote from "#/features/labels/Vote";
import useCanModerate from "#/features/moderation/useCanModerate";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";

import styles from "./ItemReplyingTo.module.css";

interface ItemReplyingToProps {
  item: CommentView | PostView;
}

export default function ItemReplyingTo({ item }: ItemReplyingToProps) {
  const canModerate = useCanModerate(item.community);
  const payload = "comment" in item ? item.comment : item.post;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IonIcon icon={returnDownForwardSharp} /> {getHandle(item.creator)}{" "}
        <Vote item={item} />
        <Edited item={item} />
        <Ago date={payload.published} className={styles.ago} />
      </div>
      <div
        {...preventModalSwipeOnTextSelection}
        className={styles.commentContentWrapper}
      >
        <CommentContent
          item={payload}
          showTouchFriendlyLinks={false}
          canModerate={canModerate}
        />
      </div>
    </div>
  );
}
