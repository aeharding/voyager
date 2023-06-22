import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { PostView } from "lemmy-js-client";
import Post from "./Post";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useAppDispatch } from "../../../store";
import { receivedPosts } from "../postSlice";
import {
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import { LIMIT } from "../../../services/lemmy";
import { CenteredSpinner } from "../detail/PostDetail";
import EndPost from "./EndPost";
import { pullAllBy } from "lodash";
import { notEmpty } from "../../../helpers/array";
import { AppContext } from "../../auth/AppContext";

export type PostsFetchFn = (page: number) => Promise<PostView[]>;

interface PostsProps {
  fetchFn: PostsFetchFn;

  communityName?: string;
}

type EndItem = { type: "AT_END " };
type Item = PostView | EndItem;

export default function Posts({ fetchFn, communityName }: PostsProps) {
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState<PostView[]>([]);
  const loading = useRef(false);
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const [atEnd, setAtEnd] = useState(false);
  const dispatch = useAppDispatch();
  const [present] = useIonToast();

  const { setActivePage } = useContext(AppContext);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useIonViewDidEnter(() => {
    setActivePage(virtuosoRef);
  });

  const items: Item[] = useMemo(
    () =>
      [...posts, atEnd ? ({ type: "AT_END " } as EndItem) : undefined].filter(
        notEmpty
      ),
    [posts, atEnd]
  );

  useEffect(() => {
    fetchMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  async function fetchMore(refresh = false) {
    if (loading.current) return;
    if (atEnd && !refresh) return;
    loading.current = true;

    const currentPage = refresh ? 1 : page + 1;

    let posts: PostView[];

    try {
      posts = await fetchFn(page);
    } catch (error) {
      present({
        message: "Problem fetching posts. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      loading.current = false;
    }

    if (refresh) {
      setAtEnd(false);
      setPosts(posts);
    } else {
      setPosts((existingPosts) => {
        const result = [...existingPosts];
        const newPosts = pullAllBy(posts, existingPosts, "post.id");
        result.splice(currentPage * LIMIT, LIMIT, ...newPosts);
        return result;
      });
    }

    if (!posts.length) setAtEnd(true);
    setPage(currentPage);
    dispatch(receivedPosts(posts));
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
          const post = items[index];

          if ("type" in post)
            return (
              <EndPost empty={!posts.length} communityName={communityName} />
            );

          return <Post post={post} communityMode={!!communityName} />;
        }}
        endReached={() => {
          fetchMore();
        }}
        increaseViewportBy={800}
      />
    </>
  );
}
