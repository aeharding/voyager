import { useParams } from "react-router";

import CommentsPage from "./CommentsPage";

export default function CommunityCommentsPage() {
  const { community } = useParams<{
    community: string;
  }>();

  return <CommentsPage communityName={community} />;
}
