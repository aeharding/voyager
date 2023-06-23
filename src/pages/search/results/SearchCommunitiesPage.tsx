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
import { FetchFn } from "../../../features/feed/Feed";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../features/feed/PostSort";
import { useAppSelector } from "../../../store";
import { CommunityView } from "lemmy-js-client";
import CommunityFeed from "../../../features/feed/CommunityFeed";

export default function SearchCommunitiesPage() {
  const { search } = useParams<{ search: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const pageRef = useRef<HTMLElement | undefined>();
  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);

  const fetchFn: FetchFn<CommunityView> = useCallback(
    async (page) => {
      const response = await client.search({
        limit: LIMIT,
        q: search,
        type_: "Communities",
        page,
        sort,
      });
      return response.communities;
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
      <IonContent scrollY={false}>
        <PageContext.Provider value={{ page: pageRef.current }}>
          <CommunityFeed fetchFn={fetchFn} />
        </PageContext.Provider>
      </IonContent>
    </IonPage>
  );
}
