import React, {
  ComponentType,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import {
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import { LIMIT } from "../../services/lemmy";
import { CenteredSpinner } from "../post/detail/PostDetail";
import { pullAllBy } from "lodash";
import { AppContext } from "../auth/AppContext";
import EndPost from "./EndPost";

export type FetchFn<I> = (page: number) => Promise<I[]>;

export interface FeedProps<I> {
  fetchFn: FetchFn<I>;
  renderItemContent: (item: I) => React.ReactNode;
  header?: ComponentType<{ context?: unknown }>;

  communityName?: string;
}

export default function Feed<I>({
  fetchFn,
  renderItemContent,
  header,
  communityName,
}: FeedProps<I>) {
  const [page, setPage] = useState(0);
  const [items, setitems] = useState<I[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const [atEnd, setAtEnd] = useState(false);
  const [present] = useIonToast();

  const { setActivePage } = useContext(AppContext);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useIonViewDidEnter(() => {
    setActivePage(virtuosoRef);
  });

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
        const newPosts = pullAllBy(items, existingPosts, "post.id");
        result.splice(currentPage * LIMIT, LIMIT, ...newPosts);
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

  if (loading && !items.length) return <CenteredSpinner />;

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={handleRefresh}
        disabled={!isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%" }}
        atTopStateChange={setIsListAtTop}
        totalCount={items.length}
        itemContent={(index) => {
          const item = items[index];

          return renderItemContent(item);
        }}
        endReached={() => {
          fetchMore();
        }}
        components={{ Header: header, Footer: footer }}
        increaseViewportBy={800}
      />
    </>
  );
}
