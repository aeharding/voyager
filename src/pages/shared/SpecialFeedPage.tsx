import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Posts, { PostsFetchFn } from "../../features/post/inFeed/Posts";
import { PageContext } from "../../features/auth/PageContext";
import { useCallback, useRef } from "react";
import PostSort from "../../features/post/inFeed/PostSort";
import { ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { useAppSelector } from "../../store";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const pageRef = useRef<HTMLElement | undefined>();

  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);
  const jwt = useAppSelector((state) => state.auth.jwt);

  const fetchFn: PostsFetchFn = useCallback(
    async (page) => {
      const response = await client.getPosts({
        limit: LIMIT,
        page,
        sort,
        type_: type,
        auth: jwt,
      });
      return response.posts;
    },
    [client, sort, type, jwt]
  );

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Communities"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>{listingTypeTitle(type)}</IonTitle>

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

function listingTypeTitle(type: ListingType): string {
  switch (type) {
    case "All":
    case "Local":
      return type;
    case "Subscribed":
      return "Home";
  }
}
