import { CommunityView } from "lemmy-js-client";
import { useCallback } from "react";

import CommunitySummary from "#/features/community/CommunitySummary";

import Feed, { FeedProps } from "./Feed";

interface PostCommentFeed
  extends Omit<FeedProps<CommunityView>, "renderItemContent"> {}

export default function CommunityFeed({ ...rest }: PostCommentFeed) {
  const renderItemContent = useCallback(
    (community: CommunityView) => <CommunitySummary community={community} />,
    [],
  );

  return (
    <Feed renderItemContent={renderItemContent} getIndex={getIndex} {...rest} />
  );
}

const getIndex = (item: CommunityView) => item.community.id;
