import { Community, Post } from "lemmy-js-client";
import { Link } from "react-router-dom";

import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import { getHandle } from "#/helpers/lemmy";
import { useOpenPostInSecondColumnIfNeededProps } from "#/routes/twoColumn/useOpenInSecondColumnIfNeededProps";

import styles from "./PostContext.module.css";

interface PostContextProps {
  post: Post;
  community: Community;
}

export default function PostContext({ post, community }: PostContextProps) {
  const itemLinkProps = useOpenPostInSecondColumnIfNeededProps(post, community);
  const linkProps = {
    onClick: itemLinkProps.onClick,
    to: itemLinkProps.routerLink,
  };

  return (
    <Link
      className={styles.link}
      draggable={false}
      {...linkProps}
      onClick={(e) => {
        e.stopPropagation();
        linkProps.onClick(e);
      }}
    >
      <div className={styles.name}>
        <InlineMarkdown parseBlocks={false}>{post.name}</InlineMarkdown>
      </div>
      <div className={styles.communityName}>{getHandle(community)}</div>
    </Link>
  );
}
