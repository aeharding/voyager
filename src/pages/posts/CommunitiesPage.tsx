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
  useIonToast,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store";
import { getHandle } from "../../helpers/lemmy";
import { home, library, people, star, starOutline } from "ionicons/icons";
import styled from "@emotion/styled";
import { pullAllBy, sortBy, uniqBy } from "lodash";
import { notEmpty } from "../../helpers/array";
import { Fragment, useMemo, useRef } from "react";
import { useSetActivePage } from "../../features/auth/AppContext";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import ItemIcon from "../../features/labels/img/ItemIcon";
import { jwtSelector } from "../../features/auth/authSlice";
import { Community } from "lemmy-js-client";
import { ActionButton } from "../../features/post/actions/ActionButton";
import {
  addFavorite,
  removeFavorite,
} from "../../features/community/communitySlice";

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

  const favorites = useAppSelector((state) => state.community.favorites);

  useSetActivePage(pageRef.current);

  const communities = useMemo(() => {
    const communities = uniqBy(
      [
        ...(follows || []).map((f) => f.community),
        ...Object.values(communityByHandle).map((c) => c?.community),
      ].filter(notEmpty),
      "id"
    );

    pullAllBy(
      communities,
      Object.values(communityByHandle)
        .filter((response) => response?.subscribed === "NotSubscribed")
        .map((c) => c?.community),
      "id"
    );

    return communities;
  }, [follows, communityByHandle]);

  const favoritesAsCommunitiesIfFound = useMemo(
    () =>
      favorites.map(
        (community) =>
          communities.find((c) => community === getHandle(c)) || community
      ),
    [communities, favorites]
  );

  const communitiesGroupedByLetter = useMemo(() => {
    const alphabeticallySortedCommunities = sortBy(communities, (c) =>
      c.name.toLowerCase()
    );

    return Object.entries(
      alphabeticallySortedCommunities.reduce<Record<string, Community[]>>(
        (acc, community) => {
          const firstLetter = community.name[0].toUpperCase();
          if (!acc[firstLetter]) {
            acc[firstLetter] = [];
          }
          acc[firstLetter].push(community);
          return acc;
        },
        {}
      )
    );
  }, [communities]);

  const dispatch = useAppDispatch();
  const [present] = useIonToast();

  function renderCommunity(community: Community) {
    const isFavorite = favorites.includes(getHandle(community));

    return (
      <IonItem
        key={community.id}
        routerLink={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
      >
        <Content>
          <ItemIcon item={community} size={28} />
          {getHandle(community)}
        </Content>
        <ActionButton
          slot="end"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            const handle = getHandle(community);

            if (!isFavorite) {
              dispatch(addFavorite(handle));
            } else {
              dispatch(removeFavorite(handle));
            }

            present({
              message: `${
                isFavorite ? "Unfavorited" : "Favorited"
              } c/${handle}.`,
              duration: 3500,
              position: "bottom",
              color: "success",
            });
          }}
        >
          <IonIcon icon={isFavorite ? star : starOutline} />
        </ActionButton>
      </IonItem>
    );
  }

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

          {favoritesAsCommunitiesIfFound.length > 0 && (
            <>
              <IonItemGroup>
                <IonItemDivider>
                  <IonLabel>Favorites</IonLabel>
                </IonItemDivider>
              </IonItemGroup>

              {favoritesAsCommunitiesIfFound.map((favorite) =>
                typeof favorite === "string" ? (
                  <IonItem
                    key={favorite}
                    routerLink={buildGeneralBrowseLink(`/c/${favorite}`)}
                  >
                    <Content>
                      <ItemIcon item={favorite} size={28} />
                      {favorite}
                    </Content>
                  </IonItem>
                ) : (
                  renderCommunity(favorite)
                )
              )}
            </>
          )}

          {communitiesGroupedByLetter.map(([letter, communities]) => (
            <Fragment key={letter}>
              <IonItemGroup>
                <IonItemDivider>
                  <IonLabel>{letter}</IonLabel>
                </IonItemDivider>
              </IonItemGroup>
              {communities.map((community) => renderCommunity(community))}
            </Fragment>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
