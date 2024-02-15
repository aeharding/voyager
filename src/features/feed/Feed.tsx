import React, {
  Fragment,
  createContext,
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
import { CenteredSpinner } from "../../routes/pages/posts/PostPage";
import { pullAllBy } from "lodash";
import { useSetActivePage } from "../auth/AppContext";
import EndPost, { EndPostProps } from "./endItems/EndPost";
import { isSafariFeedHackEnabled } from "../../routes/pages/shared/FeedContent";
import FeedLoadMoreFailed from "./endItems/FeedLoadMoreFailed";
import { VList, VListHandle } from "virtua";
import { FeedSearchContext } from "../../routes/pages/shared/CommunityPage";
import { useAppSelector } from "../../store";
import FetchMore from "./endItems/FetchMore";

type PageData =
  | {
      page: number;
    }
  | {
      page_cursor: string;
    };

export type FetchFn<I> = (pageData: PageData) => Promise<FetchFnResult<I>>;

type FetchFnResult<I> = I[] | { data: I[]; next_page?: string };

export interface FeedProps<I>
  extends Partial<Pick<EndPostProps, "sortDuration">> {
  itemsRef?: React.MutableRefObject<I[] | undefined>;
  fetchFn: FetchFn<I>;

  /**
   * Filters feed immediately. You can hide and unhide live
   * (hidden items are kept in memory)
   *
   * @related filterOnRxFn
   */
  filterFn?: (item: I) => boolean;

  /**
   * `filterOnRxFn` runs once data is received from the API.
   * If an item is filtered, it's tossed and cannot be recovered
   * without refreshing the feed.
   *
   * @related filterFn
   */
  filterOnRxFn?: (item: I) => boolean;

  getIndex?: (item: I) => number | string;
  renderItemContent: (item: I) => React.ReactNode;
  header?: React.ReactElement;
  limit?: number;

  /**
   * Called with item(s) scrolled off the top of the users' viewport
   */
  onRemovedFromTop?: (items: I[]) => void;

  communityName?: string;
}

/**
 * Maximum requests to loop through (for example, searching for unhidden posts) before giving up
 */
const MAX_REQUEST_LOOP = 20;

export default function Feed<I>({
  itemsRef,
  fetchFn,
  filterFn,
  filterOnRxFn,
  renderItemContent,
  header,
  communityName,
  getIndex,
  limit = DEFAULT_LIMIT,
  sortDuration,
  onRemovedFromTop,
}: FeedProps<I>) {
  const [page, setPage] = useState<number | string>(0);
  const [numberedPage, setNumberedPage] = useState(0);
  const [items, setItems] = useState<I[]>([]);

  // Loading needs to be initially `undefined` so that IonRefresher is
  // never initially rendered, which breaks pull to refresh on Android
  // See: https://github.com/aeharding/voyager/issues/718
  const [loading, _setLoading] = useState<boolean | undefined>(undefined);
  const loadingRef = useRef(false);

  const [isListAtTop, setIsListAtTop] = useState(true);

  const [atEnd, _setAtEnd] = useState(false);
  const atEndRef = useRef(false);

  const [loadFailed, setLoadFailed] = useState(false);

  const { setScrolledPastSearch } = useContext(FeedSearchContext);

  const startRangeRef = useRef(0);
  const scrollingRef = useRef(false);

  const infiniteScrolling = useAppSelector(
    (state) => state.settings.general.posts.infiniteScrolling,
  );

  // If you have everything filtered, don't continue polling API indefinitely
  const requestLoopRef = useRef(0);

  const filteredItems = useMemo(
    () => (filterFn ? items.filter(filterFn) : items),
    [filterFn, items],
  );

  function setLoading(loading: boolean) {
    _setLoading(loading);
    loadingRef.current = loading;
  }

  function setAtEnd(atEnd: boolean) {
    _setAtEnd(atEnd);
    atEndRef.current = atEnd;
  }

  const fetchMore = useCallback(
    async (refresh = false) => {
      if (loadingRef.current) return;
      if (atEndRef.current && !refresh) return;

      setLoading(true);

      let currentPage = (() => {
        if (refresh) return 1;

        if (typeof page === "number") return page + 1;

        return page;
      })();

      let newPageItems: I[];

      try {
        const result = await fetchFn(withPageData(currentPage));
        if (Array.isArray(result)) newPageItems = result;
        else {
          newPageItems = result.data;
          if (result.next_page) currentPage = result.next_page;
        }
      } catch (error) {
        setLoadFailed(true);

        throw error;
      } finally {
        setLoading(false);
      }

      const filteredNewPageItems = filterOnRxFn
        ? newPageItems.filter(filterOnRxFn)
        : newPageItems;

      setLoadFailed(false);

      if (refresh) {
        setAtEnd(false);
        setItems(filteredNewPageItems);
      } else {
        setItems((existingItems) => {
          const newItems = pullAllBy(
            filteredNewPageItems.slice(),
            existingItems,
            getIndex,
          );

          return [...existingItems, ...newItems];
        });
      }

      if (!filteredNewPageItems.length) {
        requestLoopRef.current++;
      } else {
        requestLoopRef.current = 0;
      }

      if (!newPageItems.length || requestLoopRef.current > MAX_REQUEST_LOOP)
        setAtEnd(true);

      setNumberedPage((numberedPage) => (refresh ? 1 : numberedPage + 1));
      setPage(currentPage);
    },
    [fetchFn, page, getIndex, filterOnRxFn],
  );

  useEffect(() => {
    if (!itemsRef) return;

    itemsRef.current = items;
  }, [items, itemsRef]);

  // Fetch more items if there are less than FETCH_MORE_THRESHOLD items left due to filtering
  useEffect(() => {
    const FETCH_MORE_THRESHOLD = limit / 2;

    if (loading || loadFailed || filteredItems.length > FETCH_MORE_THRESHOLD)
      return;

    fetchMore();
  }, [filteredItems, items, page, loading, limit, loadFailed, fetchMore]);

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
          sortDuration={sortDuration}
          key="footer"
        />
      );
    else if (!infiniteScrolling)
      return (
        <FetchMore
          fetchMore={fetchMore}
          loading={!!loading}
          page={numberedPage}
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

      <InFeedContext.Provider value={true}>
        <VList
          className={
            isSafariFeedHackEnabled
              ? "virtual-scroller"
              : "ion-content-scroll-host virtual-scroller"
          }
          ref={virtuaHandle}
          style={{ height: "100%" }}
          onScrollEnd={() => {
            scrollingRef.current = false;
          }}
          onScroll={(offset) => {
            scrollingRef.current = true;
            setIsListAtTop(offset < 10);
            setScrolledPastSearch(offset > 40);
          }}
          onRangeChange={(start, end) => {
            if (start < 0 || end < 0 || (!start && !end)) return; // no items rendered

            // if scrolled down
            const startOffset = header ? 1 : 0; // header counts as item to VList
            if (
              scrollingRef.current &&
              start > startOffset &&
              start > startRangeRef.current
            ) {
              // emit what was removed
              onRemovedFromTop?.(
                filteredItems.slice(
                  startRangeRef.current - startOffset,
                  start - startOffset,
                ),
              );
            }

            startRangeRef.current = start;

            if (
              end + 10 > filteredItems.length &&
              !loadFailed &&
              infiniteScrolling
            ) {
              fetchMore();
            }
          }}
          /* Large posts reflow with image load, so mount to dom a bit sooner */
          overscan={1}
        >
          {header}
          {filteredItems.map((item, i) => (
            <Fragment key={getIndex ? getIndex(item) : i}>
              {renderItemContent(item)}
            </Fragment>
          ))}
          {footer}
        </VList>
      </InFeedContext.Provider>
    </>
  );
}

function withPageData(page: number | string): PageData {
  if (typeof page === "number") return { page };
  return { page_cursor: page };
}

export function isFirstPage(pageData: PageData): boolean {
  if ("page" in pageData) return pageData.page === 1;
  return !pageData.page_cursor;
}

export const InFeedContext = createContext(false);
