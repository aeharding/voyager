import { useAppSelector } from "#/store";

import styles from "./Save.module.css";

interface SaveProps {
  type: "comment" | "post";
  id: number;
}

export default function Save({ type, id }: SaveProps) {
  const saved = useAppSelector((state) =>
    type === "comment"
      ? state.comment.commentSavedById[id]
      : state.post.postSavedById[id],
  );

  if (!saved) return null;

  return <div className={styles.marker} />;
}
