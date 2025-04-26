import { ComponentProps } from "react";

import { VoteButton } from "#/features/post/shared/VoteButton";

import Vote from "./Vote";

import styles from "../GalleryPostActions.module.css";

export default function HideVoteMode({ post }: ComponentProps<typeof Vote>) {
  return (
    <div className={styles.section}>
      <VoteButton type="up" post={post} />
      <VoteButton type="down" post={post} />
    </div>
  );
}
