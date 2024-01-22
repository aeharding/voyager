import styled from "@emotion/styled";
import {
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useAppSelector } from "../../../store";
import { jwtSelector } from "../../auth/authSelectors";
import { memo, useMemo, useRef } from "react";
import { sortBy } from "lodash";
import { getHandle } from "../../../helpers/lemmy";
import { Community } from "lemmy-js-client";
import { home, library, people, shieldCheckmark } from "ionicons/icons";
import CommunityListItem from "./CommunityListItem";
import { VList, VListHandle } from "virtua";
import { maxWidthCss } from "../../shared/AppContent";
import AlphabetJump from "./AlphabetJump";
import useShowModeratorFeed from "./useShowModeratorFeed";

const SubIcon = styled(IonIcon)<{ color: string }>`
  border-radius: 50%;
  padding: 6px;
  width: 1rem;
  height: 1rem;

  background: ${({ color }) => color};
  --ion-color-base: white;
`;

export const Content = styled.div`
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

const StyledIonList = styled(IonList)`
  height: 100%;
`;

const StyledVList = styled(VList)`
  height: 100%;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  ion-item-group {
    ${maxWidthCss}
  }
`;

interface CommunitiesListParams {
  actor: string;
  communities: Community[];
}

function ResolvedCommunitiesList({
  actor,
  communities,
}: CommunitiesListParams) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const jwt = useAppSelector(jwtSelector);

  const virtuaRef = useRef<VListHandle>(null);

  const moderates = useAppSelector(
    (state) => state.site.response?.my_user?.moderates,
  );

  const showModeratorFeed = useShowModeratorFeed();

  const favorites = useAppSelector((state) => state.community.favorites);

  const favoritesAsCommunitiesIfFound = useMemo(
    () =>
      favorites.map(
        (community) =>
          communities.find((c) => community === getHandle(c)) || community,
      ),
    [communities, favorites],
  );

  const communitiesGroupedByLetter = useMemo(() => {
    return sortBy(
      Object.entries(
        communities.reduce<Record<string, Community[]>>((acc, community) => {
          const firstLetter = /[0-9]/.test(community.name[0]!)
            ? "#"
            : community.name[0]!.toUpperCase();

          acc[firstLetter] ??= [];
          acc[firstLetter]!.push(community);

          return acc;
        }, {}),
      ),
      ([letter]) => (letter === "#" ? "\uffff" : letter), // sort # at bottom
    );
  }, [communities]);

  return (
    <>
      <StyledIonList>
        <StyledVList
          ref={virtuaRef}
          overscan={0}
          className="ion-content-scroll-host virtual-scroller"
        >
          <IonItemGroup key="list">
            {jwt && (
              <IonItem
                routerLink={buildGeneralBrowseLink(`/home`)}
                detail={false}
              >
                <Content>
                  <SubIcon icon={home} color="red" />
                  <div>
                    Home
                    <aside>Posts from subscriptions</aside>
                  </div>
                </Content>
              </IonItem>
            )}
            <IonItem routerLink={buildGeneralBrowseLink(`/all`)} detail={false}>
              <Content>
                <SubIcon icon={library} color="#009dff" />
                <div>
                  All<aside>Posts across all federated communities</aside>
                </div>
              </Content>
            </IonItem>
            <IonItem
              routerLink={buildGeneralBrowseLink(`/local`)}
              detail={false}
              lines={showModeratorFeed ? "inset" : "none"}
            >
              <Content>
                <SubIcon icon={people} color="#00f100" />
                <div>
                  Local<aside>Posts from communities on {actor}</aside>
                </div>
              </Content>
            </IonItem>
            {showModeratorFeed && (
              <IonItem
                routerLink={buildGeneralBrowseLink(`/mod`)}
                detail={false}
                lines="none"
              >
                <Content>
                  <SubIcon icon={shieldCheckmark} color="#464646" />
                  <div>
                    Moderator Posts
                    <aside>Posts from moderated communities</aside>
                  </div>
                </Content>
              </IonItem>
            )}
          </IonItemGroup>

          {favoritesAsCommunitiesIfFound.length > 0 && (
            <IonItemGroup key="favorites">
              <IonItemDivider sticky>
                <IonLabel>Favorites</IonLabel>
              </IonItemDivider>

              {favoritesAsCommunitiesIfFound.map((favorite) => (
                <CommunityListItem
                  key={typeof favorite === "string" ? favorite : favorite.id}
                  community={favorite}
                  favorites={favorites}
                />
              ))}
            </IonItemGroup>
          )}

          {moderates?.length ? (
            <IonItemGroup key="moderates">
              <IonItemDivider sticky>
                <IonLabel>Moderator</IonLabel>
              </IonItemDivider>
              {moderates.map(({ community }) => (
                <CommunityListItem
                  key={community.id}
                  community={community}
                  favorites={favorites}
                />
              ))}
            </IonItemGroup>
          ) : (
            ""
          )}
          {communitiesGroupedByLetter.map(([letter, communities]) => (
            <IonItemGroup key={letter}>
              <IonItemDivider sticky>
                <IonLabel>{letter}</IonLabel>
              </IonItemDivider>
              {communities.map((community) => (
                <CommunityListItem
                  key={community.id}
                  community={community}
                  favorites={favorites}
                />
              ))}
            </IonItemGroup>
          ))}
        </StyledVList>
      </StyledIonList>

      <AlphabetJump
        virtuaRef={virtuaRef}
        hasFavorited={!!favoritesAsCommunitiesIfFound.length}
        hasModerated={!!moderates?.length}
        letters={communitiesGroupedByLetter.map(([letter]) => letter)}
      />
    </>
  );
}

export default memo(ResolvedCommunitiesList);
