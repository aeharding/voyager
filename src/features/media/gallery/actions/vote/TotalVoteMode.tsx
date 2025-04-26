import { ComponentProps } from "react";

import { VoteButton } from "#/features/post/shared/VoteButton";
import { useCalculateTotalScore } from "#/helpers/vote";

import Vote from "./Vote";

import styles from "../GalleryPostActions.module.css";

export default function TotalVoteMode({ post }: ComponentProps<typeof Vote>) {
  const score = useCalculateTotalScore(post);

  return (
    <div className={styles.section}>
      <VoteButton type="up" post={post} />
      <div className={styles.amount}>{score}</div>
      <VoteButton type="down" post={post} />
    </div>
  );
}
