import { throttle } from "lodash";
import { UIEventHandler, useMemo } from "react";

interface UseFeedOnScrollProps {
  fetchMore: () => void;
}

export default function useFeedOnScroll({ fetchMore }: UseFeedOnScrollProps) {
  const throttledOnScroll: UIEventHandler<HTMLDivElement> = useMemo(
    () =>
      throttle<UIEventHandler<HTMLDivElement>>((e) => {
        const scrollView = e.target;

        if (!(scrollView instanceof HTMLElement)) return;

        const nearBottom =
          Math.abs(
            scrollView.scrollHeight -
              scrollView.scrollTop -
              scrollView.clientHeight
          ) <
          document.body.clientHeight * 2;

        if (!nearBottom) return;

        fetchMore();
      }, 500),
    [fetchMore]
  );

  return { onScroll: throttledOnScroll };
}
