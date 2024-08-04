import { useCallback, useMemo, useState } from "react";

export default function useFeedUpdate() {
  const [fetchFnLastUpdated, setFetchFnLastUpdated] = useState(0);

  const notifyFeedUpdated = useCallback(() => {
    setFetchFnLastUpdated(Date.now());
  }, []);

  return useMemo(
    () => ({
      notifyFeedUpdated,
      fetchFnLastUpdated,
    }),
    [notifyFeedUpdated, fetchFnLastUpdated],
  );
}
