import { Container } from "./EndPost";

interface FeedLoadMoreFailedProps {
  fetchMore: () => void;
  loading: boolean;
}

export default function FeedLoadMoreFailed({
  fetchMore,
  loading,
}: FeedLoadMoreFailedProps) {
  return (
    <Container onClick={fetchMore}>
      Failed to load more posts. {loading ? "Loading..." : "Try again?"}
    </Container>
  );
}
