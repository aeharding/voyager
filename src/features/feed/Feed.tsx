import React, {
  Fragment,
  useCallback,
  useContext,
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
import FeedLoadMoreFailed from "./endItems/FeedLoadMoreFailed";
import { VList, VListHandle } from "virtua";
import { FeedSearchContext } from "../../pages/shared/CommunityPage";

export type FetchFn<I> = (page: number) => Promise<I[]>;

export interface FeedProps<I> {
  itemsRef?: React.MutableRefObject<I[] | undefined>;
  fetchFn: FetchFn<I>;
  filterFn?: (item: I) => boolean;
  getIndex?: (item: I) => number | string;
  renderItemContent: (item: I) => React.ReactNode;
  header?: React.ReactElement;
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
  const [loadFailed, setLoadFailed] = useState(true);
  const { setScrolledPastSearch } = useContext(FeedSearchContext);

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

  const footer = (() => {
    if (loadFailed)
      return (
        <FeedLoadMoreFailed
          fetchMore={fetchMore}
          loading={!!loading}
          key="footer"
        />
      );
    else if (atEnd)
      return (
        <EndPost
          empty={!items.length}
          communityName={communityName}
          key="footer"
        />
      );
  })();

  async function handleRefresh(event: RefresherCustomEvent) {
    try {
      await fetchMore(true);
    } finally {
      event.detail.complete();
    }
  }

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
        onScroll={(offset) => {
          setIsListAtTop(offset < 10);
          setScrolledPastSearch(offset > 40);
        }}
        onRangeChange={(start, end) => {
          if (end + 10 > filteredItems.length) {
            fetchMore();
          }
        }}
        overscan={markReadOnScroll ? 2 : 0}
      >
        {header}
        {filteredItems.map((i) => (
          <Fragment key={getIndex ? getIndex(i) : `${i}`}>
            {renderItemContent(i)}
          </Fragment>
        ))}
        {footer}
      </VList>
    </>
  );
}
