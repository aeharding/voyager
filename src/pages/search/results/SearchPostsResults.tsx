import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useCallback, useRef } from "react";
import { PageContext } from "../../../features/auth/PageContext";
import Posts, { PostsFetchFn } from "../../../features/post/inFeed/Posts";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../features/post/inFeed/PostSort";
import { useAppSelector } from "../../../store";

export default function SearchPostsResults() {
  const { search } = useParams<{ search: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const pageRef = useRef<HTMLElement | undefined>();
  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);

  const fetchFn: PostsFetchFn = useCallback(
    async (page) => {
      const response = await client.search({
        limit: LIMIT,
        q: search,
        type_: "Posts",
        page,
        sort,
      });
      return response.posts;
    },
    [search, client, sort]
  );

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Search"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>“{search}”</IonTitle>

          <IonButtons slot="end">
            <PostSort />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageContext.Provider value={{ page: pageRef.current }}>
          <Posts fetchFn={fetchFn} />
        </PageContext.Provider>
      </IonContent>
    </IonPage>
  );
}
