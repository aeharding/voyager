import { IonIcon } from "@ionic/react";
import { arrowUndoOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import { SaveButton } from "#/features/post/shared/SaveButton";
import { VoteButton } from "#/features/post/shared/VoteButton";

import { ActionButton } from "./ActionButton";
import ShareButton from "./ShareButton";

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
      <ActionButton onClick={onReply}>
        <IonIcon icon={arrowUndoOutline} />
      </ActionButton>
      <ShareButton post={post} />
    </div>
  );
}
