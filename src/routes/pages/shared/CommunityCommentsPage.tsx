import useRequiredParams from "#/helpers/useRequiredParams";

import CommentsPage from "./CommentsPage";

export default function CommunityCommentsPage() {
  const { community } = useRequiredParams<{
    community: string;
  }>();

  return <CommentsPage communityName={community} />;
}
