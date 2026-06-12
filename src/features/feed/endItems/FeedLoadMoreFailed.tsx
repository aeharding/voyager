import endPostStyles from "./EndPost.module.css";

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
    <button onClick={() => fetchMore()} className={endPostStyles.button}>
      Failed to load more {pluralType}. {loading ? "Loading..." : "Try again?"}
    </button>
  );
}
