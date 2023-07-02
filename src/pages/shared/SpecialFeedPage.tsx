import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback, useContext, useState } from "react";
import PostSort from "../../features/feed/PostSort";
import { ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { useAppSelector } from "../../store";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { jwtSelector } from "../../features/auth/authSlice";
import { AppContext } from "../../features/auth/AppContext";
import {
  activateFabOnPagePosition,
  scrollFabIfNeeded,
} from "../../features/shared/scroll/scrollUtils";
import ScrollToTopFab from "../../features/shared/scroll/ScrollToTopFab";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const { activePage } = useContext(AppContext);
  const [previousTop, setPreviousTop] = useState(0);
  const [fabActivated, setFabActivated] = useState(false);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);
  const jwt = useAppSelector(jwtSelector);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
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
    <IonPage
      onScrollCapture={() =>
        activateFabOnPagePosition(
          activePage,
          previousTop,
          fabActivated,
          setFabActivated
        )
      }
    >
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
        <PostCommentFeed fetchFn={fetchFn} />
        <ScrollToTopFab
          activated={fabActivated}
          onClick={() =>
            scrollFabIfNeeded(
              activePage,
              previousTop,
              setPreviousTop,
              setFabActivated
            )
          }
        />
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
