import { compact } from "es-toolkit";
import { Fragment } from "react";
import { PostTag as PostTagType, PostView } from "threadiverse";

import { isNsfw } from "#/features/labels/Nsfw";
import { cx } from "#/helpers/css";

import styles from "./PostTags.module.css";

type Item = { type: "nsfw" } | ({ type: "tag" } & PostTagType);

interface PostTagsProps {
  post: PostView;
}

export default function PostTags({ post }: PostTagsProps) {
  const items: Item[] = compact([
    isNsfw(post) && { type: "nsfw" as const },
    ...post.tags.map((tag) => ({ type: "tag" as const, ...tag })),
  ]);

  if (!items.length) return;

  return items.map((item, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <PostTag item={item} />
    </Fragment>
  ));
}

function PostTag({ item }: { item: Item }) {
  switch (item.type) {
    case "nsfw":
      return <span className={cx(styles.tag, styles.nsfwTag)}>NSFW</span>;
    case "tag":
      return (
        <span className={styles.tag}>{item.display_name || item.name}</span>
      );
  }
}
