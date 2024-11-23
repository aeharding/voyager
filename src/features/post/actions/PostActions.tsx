import { IonIcon } from "@ionic/react";
import { arrowUndoOutline, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import { SaveButton } from "#/features/post/shared/SaveButton";
import { VoteButton } from "#/features/post/shared/VoteButton";
import { getShareIcon } from "#/helpers/device";
import { share } from "#/helpers/lemmy";

import { ActionButton } from "./ActionButton";
import styles from "./PostActions.module.css";

interface PostActionsProps {
  post: PostView;
  onReply: () => void;
}

export default function PostActions({ post, onReply }: PostActionsProps) {
  return (
    <div className={styles.container}>
      <VoteButton type="up" post={post} />
      <VoteButton type="down" post={post} />
      <SaveButton post={post} />
      <ActionButton>
        <a
          className={styles.link}
          href={post.post.ap_id}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IonIcon icon={linkOutline} />
        </a>
      </ActionButton>
      <ActionButton onClick={onReply}>
        <IonIcon icon={arrowUndoOutline} />
      </ActionButton>
      <ActionButton>
        <IonIcon icon={getShareIcon()} onClick={() => share(post.post)} />
      </ActionButton>
    </div>
  );
}
