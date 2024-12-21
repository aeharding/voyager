import { Community, Post } from "lemmy-js-client";
import { Link } from "react-router-dom";

import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import styles from "./PostContext.module.css";

interface PostContextProps {
  post: Post;
  community: Community;
}

export default function PostContext({ post, community }: PostContextProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <Link
      className={styles.link}
      onClick={(e) => e.stopPropagation()}
      draggable={false}
      to={buildGeneralBrowseLink(
        `/c/${getHandle(community)}/comments/${post.id}`,
      )}
    >
      <div className={styles.name}>
        <InlineMarkdown>{post.name}</InlineMarkdown>
      </div>
      <div className={styles.communityName}>{getHandle(community)}</div>
    </Link>
  );
}
