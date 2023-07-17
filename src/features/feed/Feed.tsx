import React, {
  ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Virtuoso, VirtuosoHandle, VirtuosoProps } from "react-virtuoso";
import {
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  useIonToast,
} from "@ionic/react";
import { LIMIT as DEFAULT_LIMIT } from "../../services/lemmy";
import { CenteredSpinner } from "../../pages/posts/PostPage";
import { pullAllBy } from "lodash";
import { useSetActivePage } from "../auth/AppContext";
import EndPost from "./EndPost";
import { useAppSelector } from "../../store";
import { OPostAppearanceType } from "../../services/db";
import { markReadOnScrollSelector } from "../settings/settingsSlice";

export type FetchFn<I> = (page: number) => Promise<I[]>;

export interface FeedProps<I> {
  fetchFn: FetchFn<I>;
  filterFn?: (item: I) => boolean;
  getIndex?: (item: I) => number | string;
  renderItemContent: (item: I) => React.ReactNode;
  header?: ComponentType<{ context?: unknown }>;
  limit?: number;

  communityName?: string;
}

export default function Feed<I>({
  fetchFn,
  filterFn,
  renderItemContent,
  header,
  communityName,
  getIndex,
  limit = DEFAULT_LIMIT,
}: FeedProps<I>) {
  const [page, setPage] = useState(0);
  const [items, setitems] = useState<I[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const [atEnd, setAtEnd] = useState(false);
  const [present] = useIonToast();
  const postAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type
  );

  const filteredItems = useMemo(
    () => (filterFn ? items.filter(filterFn) : items),
    [filterFn, items]
  );

  const markReadOnScroll = useAppSelector(markReadOnScrollSelector);

  // Fetch more items if there are less than FETCH_MORE_THRESHOLD items left due to filtering
  useEffect(() => {
    const fetchMoreThreshold = limit / 2;
    const currentPageItems = items.slice((page - 1) * limit, page * limit);

    const currentPageFilteredItems = filteredItems.filter(
      (item) => currentPageItems.indexOf(item) !== -1
    );

    if (
      loading ||
      currentPageItems.length - currentPageFilteredItems.length <
        fetchMoreThreshold
    )
      return;

    fetchMore();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems, filteredItems, items, items, page, loading]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useSetActivePage(virtuosoRef);

  useEffect(() => {
    fetchMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  const footer = useCallback(() => {
    if (atEnd)
      return <EndPost empty={!items.length} communityName={communityName} />;
  }, [atEnd, communityName, items.length]);

  async function fetchMore(refresh = false) {
    if (loading) return;
    if (atEnd && !refresh) return;
    setLoading(true);

    const currentPage = refresh ? 1 : page + 1;

    let items: I[];

    try {
      items = await fetchFn(currentPage);
    } catch (error) {
      present({
        message: "Problem fetching posts. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    if (refresh) {
      setAtEnd(false);
      setitems(items);
    } else {
      setitems((existingPosts) => {
        const result = [...existingPosts];
        const newPosts = pullAllBy(items.slice(), existingPosts, "post.id");
        result.splice(currentPage * limit, limit, ...newPosts);
        return result;
      });
    }

    if (!items.length) setAtEnd(true);

    setPage(currentPage);
  }

  async function handleRefresh(event: RefresherCustomEvent) {
    try {
      await fetchMore(true);
    } finally {
      event.detail.complete();
    }
  }

  // TODO looks like a Virtuoso bug where virtuoso checks if computeItemKey exists,
  // not if it's not undefined (needs report)
  const computeProp: Partial<VirtuosoProps<unknown, unknown>> = getIndex
    ? {
        computeItemKey: (index) => getIndex(filteredItems[index]),
      }
    : {};

  if ((loading && !filteredItems.length) || loading === undefined)
    return <CenteredSpinner />;

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={handleRefresh}
        // disabled={!isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>

      <Virtuoso
        className="ion-content-scroll-host"
        ref={virtuosoRef}
        style={{ height: "100%" }}
        // atTopStateChange={setIsListAtTop}
        {...computeProp}
        totalCount={filteredItems.length}
        itemContent={(index) => {
          const item = filteredItems[index];

          return renderItemContent(item);
        }}
        endReached={() => {
          fetchMore();
        }}
        components={{ Header: header, Footer: footer }}
        increaseViewportBy={
          postAppearanceType === OPostAppearanceType.Compact
            ? // Compact posts have fixed size, so we don't need to proactively render
              markReadOnScroll
              ? {
                  // Intersection observer needs time to work when quickly scrolling
                  // TODO it would be nice if we could just detect if removed from top or bottom of
                  // page on unmount
                  top: 150,
                  bottom: 0,
                }
              : 0
            : {
                // Height of post depends on image aspect ratio, so load extra off screen
                top: 200,
                bottom: 800,
              }
        }
      />
    </>
  );
}
