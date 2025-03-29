import { ComponentProps } from "react";

import { VoteButton } from "#/features/post/shared/VoteButton";
import { useCalculateSeparateScore } from "#/helpers/vote";

import Vote from "./Vote";

import styles from "../GalleryPostActions.module.css";

export default function SeparateVoteMode({
  post,
}: ComponentProps<typeof Vote>) {
  const { upvotes, downvotes } = useCalculateSeparateScore(post);

  return (
    <div className={styles.section}>
      <VoteButton type="up" post={post} />
      <div className={styles.amount}>{upvotes}</div>
      <VoteButton type="down" post={post} />
      <div className={styles.amount}>{downvotes}</div>
    </div>
  );
}
