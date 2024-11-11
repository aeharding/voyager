import { useState } from "react";

export default function useFeedUpdate() {
  const [fetchFnLastUpdated, setFetchFnLastUpdated] = useState(0);

  function notifyFeedUpdated() {
    setFetchFnLastUpdated(Date.now());
  }

  return {
    notifyFeedUpdated,
    fetchFnLastUpdated,
  };
}
