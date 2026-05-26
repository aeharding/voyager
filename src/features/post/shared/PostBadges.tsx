import { compact } from "es-toolkit";
import { Fragment } from "react";
import { PostTag, PostView } from "threadiverse";

import { cx } from "#/helpers/css";
import { isNsfw } from "#/helpers/nsfw";

import styles from "./PostBadges.module.css";

type Item = { type: "nsfw" } | ({ type: "tag" } & PostTag);

interface PostBadgesProps {
  post: PostView;
}

export default function PostBadges({ post }: PostBadgesProps) {
  const items: Item[] = compact([
    isNsfw(post) && { type: "nsfw" as const },
    ...post.tags.map((tag) => ({ type: "tag" as const, ...tag })),
  ]);

  if (!items.length) return;

  return items.map((item, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <PostBadge item={item} />
    </Fragment>
  ));
}

function PostBadge({ item }: { item: Item }) {
  switch (item.type) {
    case "nsfw":
      return <span className={cx(styles.badge, styles.nsfwBadge)}>NSFW</span>;
    case "tag":
      return (
        <span className={styles.badge}>{item.display_name || item.name}</span>
      );
  }
}
