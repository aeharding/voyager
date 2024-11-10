import { CommunityView } from "lemmy-js-client";

import CommunitySummary from "#/features/community/CommunitySummary";

import Feed, { FeedProps } from "./Feed";

interface PostCommentFeed
  extends Omit<FeedProps<CommunityView>, "renderItemContent"> {}

export default function CommunityFeed({ ...rest }: PostCommentFeed) {
  return (
    <Feed renderItemContent={renderItemContent} getIndex={getIndex} {...rest} />
  );
}

function renderItemContent(community: CommunityView) {
  return <CommunitySummary community={community} />;
}

const getIndex = (item: CommunityView) => item.community.id;
