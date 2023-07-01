import {
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  breakDownCommunityActorId,
  getHandle,
  getInstance,
} from "../../helpers/lemmy";
import { home, library, people } from "ionicons/icons";
import styled from "@emotion/styled";
import { pullAllBy, sortBy, uniqBy } from "lodash";
import { notEmpty } from "../../helpers/array";
import { useEffect, useMemo, useRef } from "react";
import { useSetActivePage } from "../../features/auth/AppContext";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import ItemIcon from "../../features/labels/img/ItemIcon";
import { jwtSelector } from "../../features/auth/authSlice";
import { getFavouriteCommunities } from "../../features/community/communitySlice";
import { Community } from "lemmy-js-client";

const SubIcon = styled(IonIcon)<{ color: string }>`
  border-radius: 50%;
  padding: 6px;
  width: 1rem;
  height: 1rem;

  background: ${({ color }) => color};
  --ion-color-base: white;
`;

const Content = styled.div`
  margin: 0.7rem 0;

  display: flex;
  align-items: center;
  gap: 1rem;

  aside {
    margin-top: 0.2rem;
    color: var(--ion-color-medium);
    font-size: 0.8em;
  }
`;

export default function CommunitiesPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { actor } = useParams<{ actor: string }>();
  const jwt = useAppSelector(jwtSelector);
  const pageRef = useRef();

  const follows = useAppSelector((state) => state.auth.site?.my_user?.follows);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const dispatch = useAppDispatch();

  const favouriteCommunityActorIDs = useAppSelector(
    (state) => state.community.favouriteCommunityActorIDs
  );

  const activeHandle = useAppSelector(
    (state) => state.auth.accountData?.activeHandle
  );

  useEffect(() => {
    if (!jwt) return;

    dispatch(getFavouriteCommunities());
  }, [dispatch, jwt]);

  useSetActivePage(pageRef.current);

  const communities = useMemo(() => {
    const communities = uniqBy(
      [
        ...(follows || []).map((f) => f.community),
        ...Object.values(communityByHandle).map(
          (c) => c?.community_view.community
        ),
      ].filter(notEmpty),
      "id"
    );

    pullAllBy(
      communities,
      Object.values(communityByHandle)
        .filter(
          (response) => response?.community_view.subscribed === "NotSubscribed"
        )
        .map((c) => c?.community_view.community),
      "id"
    );

    return communities;
  }, [follows, communityByHandle]);

  const favouriteCommunities = useMemo(() => {
    // get the community obj from the handle from communities.
    // if the community is not in the subscribed list, we should display it anyways, but without a sub icon.

    const subscribedFavourites = communities.filter((c) =>
      favouriteCommunityActorIDs?.includes(c.actor_id)
    );

    const unsubscribedFavourites = favouriteCommunityActorIDs?.filter(
      (id) => !communities.find((c) => c.actor_id === id)
    );

    if (!unsubscribedFavourites || !activeHandle) return subscribedFavourites;

    const userInstance = getInstance(activeHandle);

    // create a basic community object for the unsubscribed favourites
    const unsubscribedFavouritesCommunities = unsubscribedFavourites.map(
      (id) => {
        const brokenDownCommunity = breakDownCommunityActorId(id);

        return {
          id: 1000,
          actor_id: id,
          name: brokenDownCommunity.communityName,
          local: userInstance === brokenDownCommunity.hostname,
        } as Community;
      }
    );

    return [...subscribedFavourites, ...unsubscribedFavouritesCommunities];
  }, [favouriteCommunityActorIDs, communities, activeHandle]);

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Communities</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <IonList>
          <IonItemGroup>
            {jwt && (
              <IonItem routerLink={buildGeneralBrowseLink(`/home`)}>
                <Content>
                  <SubIcon icon={home} color="red" />
                  <div>
                    Home
                    <aside>Posts from subscriptions</aside>
                  </div>
                </Content>
              </IonItem>
            )}
            <IonItem routerLink={buildGeneralBrowseLink(`/all`)}>
              <Content>
                <SubIcon icon={library} color="#009dff" />
                <div>
                  All<aside>Posts across all federated communities</aside>
                </div>
              </Content>
            </IonItem>
            <IonItem routerLink={buildGeneralBrowseLink(`/local`)} lines="none">
              <Content>
                <SubIcon icon={people} color="#00f100" />
                <div>
                  Local<aside>Posts from communities on {actor}</aside>
                </div>
              </Content>
            </IonItem>
          </IonItemGroup>

          {(favouriteCommunityActorIDs || []).length > 0 && (
            <>
              <IonItemGroup>
                <IonItemDivider>
                  <IonLabel>Favourites</IonLabel>
                </IonItemDivider>
              </IonItemGroup>

              {sortBy(favouriteCommunities, "name")?.map((community) => (
                <IonItem
                  key={community.id}
                  routerLink={buildGeneralBrowseLink(
                    `/c/${getHandle(community)}`
                  )}
                >
                  <Content>
                    <ItemIcon item={community} size={28} />
                    {getHandle(community)}
                  </Content>
                </IonItem>
              ))}
            </>
          )}

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Communities</IonLabel>
            </IonItemDivider>
          </IonItemGroup>

          {sortBy(communities, "name")?.map((community) => (
            <IonItem
              key={community.id}
              routerLink={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
            >
              <Content>
                <ItemIcon item={community} size={28} />
                {getHandle(community)}
              </Content>
            </IonItem>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
