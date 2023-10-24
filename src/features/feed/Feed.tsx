import React, {
  ComponentType,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from "@ionic/react";
import { LIMIT as DEFAULT_LIMIT } from "../../services/lemmy";
import { CenteredSpinner } from "../../pages/posts/PostPage";
import { pullAllBy } from "lodash";
import { useSetActivePage } from "../auth/AppContext";
import EndPost from "./endItems/EndPost";
import { useAppSelector } from "../../store";
import { markReadOnScrollSelector } from "../settings/settingsSlice";
import { isSafariFeedHackEnabled } from "../../pages/shared/FeedContent";
import useFeedOnScroll from "./useFeedOnScroll";
import FeedLoadMoreFailed from "./endItems/FeedLoadMoreFailed";
import { VList, VListHandle } from "virtua";

export type FetchFn<I> = (page: number) => Promise<I[]>;

export interface FeedProps<I> {
  itemsRef?: React.MutableRefObject<I[] | undefined>;
  fetchFn: FetchFn<I>;
  filterFn?: (item: I) => boolean;
  getIndex?: (item: I) => number | string;
  renderItemContent: (item: I) => React.ReactNode;
  header?: ComponentType<{ context?: unknown }>;
  limit?: number;

  communityName?: string;
}

export default function Feed<I>({
  itemsRef,
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
  const postAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );
  const [loadFailed, setLoadFailed] = useState(true);

  const filteredItems = useMemo(
    () => (filterFn ? items.filter(filterFn) : items),
    [filterFn, items],
  );

  const markReadOnScroll = useAppSelector(markReadOnScrollSelector);

  const fetchMore = useCallback(
    async (refresh = false) => {
      if (loading) return;
      if (atEnd && !refresh) return;
      setLoading(true);

      const currentPage = refresh ? 1 : page + 1;

      let items: I[];

      try {
        items = await fetchFn(currentPage);
      } catch (error) {
        setLoadFailed(true);

        throw error;
      } finally {
        setLoading(false);
      }

      setLoadFailed(false);

      if (refresh) {
        setAtEnd(false);
        setitems(items);
      } else {
        setitems((existingPosts) => {
          const result = [...existingPosts];
          const newPosts = pullAllBy(items.slice(), existingPosts, getIndex);
          result.splice(currentPage * limit, limit, ...newPosts);
          return result;
        });
      }

      if (!items.length) setAtEnd(true);

      setPage(currentPage);
    },
    [atEnd, fetchFn, limit, loading, page, getIndex],
  );

  const { onScroll } = useFeedOnScroll({ fetchMore });

  useEffect(() => {
    if (!itemsRef) return;

    itemsRef.current = items;
  }, [items, itemsRef]);

  // Fetch more items if there are less than FETCH_MORE_THRESHOLD items left due to filtering
  useEffect(() => {
    const fetchMoreThreshold = limit / 2;
    const currentPageItems = items.slice((page - 1) * limit, page * limit);

    const currentPageFilteredItems = filteredItems.filter(
      (item) => currentPageItems.indexOf(item) !== -1,
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

  const virtuaHandle = useRef<VListHandle>(null);

  useSetActivePage(virtuaHandle);

  useEffect(() => {
    fetchMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  const footer = useCallback(() => {
    if (loadFailed)
      return <FeedLoadMoreFailed fetchMore={fetchMore} loading={!!loading} />;
    else if (atEnd)
      return <EndPost empty={!items.length} communityName={communityName} />;
  }, [atEnd, communityName, items.length, loadFailed, fetchMore, loading]);

  async function handleRefresh(event: RefresherCustomEvent) {
    try {
      await fetchMore(true);
    } finally {
      event.detail.complete();
    }
  }

  const itemContent = useCallback(
    (index: number) => {
      const item = filteredItems[index];

      return renderItemContent(item);
    },
    [filteredItems, renderItemContent],
  );

  const computeItemKey = useCallback(
    (index: number) => (getIndex ? getIndex(filteredItems[index]) : index),
    [filteredItems, getIndex],
  );

  if ((loading && !filteredItems.length) || loading === undefined)
    return <CenteredSpinner />;

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={handleRefresh}
        disabled={isSafariFeedHackEnabled && !isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>

      <VList
        className={
          isSafariFeedHackEnabled
            ? "virtual-scroller"
            : "ion-content-scroll-host virtual-scroller"
        }
        ref={virtuaHandle}
        style={{ height: "100%" }}
        // atTopStateChange={setIsListAtTop}
        // computeItemKey={computeItemKey}
        // totalCount={filteredItems.length}
        // itemContent={itemContent}
        // components={{ Header: header, Footer: footer }}
        onScroll={(offset) => {
          setIsListAtTop(offset < 10);
        }}
        onRangeChange={(start, end) => {
          if (end + 10 > filteredItems.length) {
            fetchMore();
          }
        }}
        overscan={markReadOnScroll ? 2 : 0}
      >
        {header?.()}
        {filteredItems.map((i) => (
          <Fragment key={getIndex ? getIndex(i) : `${i}`}>
            {renderItemContent(i)}
          </Fragment>
        ))}
      </VList>
    </>
  );
}
