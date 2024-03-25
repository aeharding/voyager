import { Container } from "./EndPost";

interface FeedLoadMoreFailedProps {
  fetchMore: () => void;
  loading: boolean;
  pluralType?: string;
}

export default function FeedLoadMoreFailed({
  fetchMore,
  loading,
  pluralType = "posts",
}: FeedLoadMoreFailedProps) {
  return (
    <Container onClick={() => fetchMore()}>
      Failed to load more {pluralType}. {loading ? "Loading..." : "Try again?"}
    </Container>
  );
}
