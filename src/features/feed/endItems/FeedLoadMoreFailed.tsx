import { Container } from "./EndPost";

interface FeedLoadMoreFailedProps {
  fetchMore: () => void;
}

export default function FeedLoadMoreFailed({
  fetchMore,
}: FeedLoadMoreFailedProps) {
  return (
    <Container onClick={fetchMore}>
      Failed to load more posts. Try again?
    </Container>
  );
}
