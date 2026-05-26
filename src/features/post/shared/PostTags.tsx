import { Fragment } from "react";
import { PostView } from "threadiverse";

import styles from "./PostTags.module.css";

interface PostTagsProps {
  post: PostView;
}

export default function PostTags({ post }: PostTagsProps) {
  if (!post.tags.length) return;

  return (
    <>
      {post.tags.map((tag, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className={styles.tag}>{tag.display_name || tag.name}</span>
        </Fragment>
      ))}
    </>
  );
}
