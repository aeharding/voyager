import {
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
} from "@ionic/react";
import { sortBy } from "es-toolkit";
import { earth, home, people, shieldCheckmark } from "ionicons/icons";
import { Community } from "lemmy-js-client";
import { memo, useMemo, useRef } from "react";
import { VList, VListHandle } from "virtua";

import { jwtSelector } from "#/features/auth/authSelectors";
import { cx } from "#/helpers/css";
import { attributedPreventOnClickNavigationBug } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useAppSelector } from "#/store";

import AlphabetJump from "./AlphabetJump";
import CommunityListItem from "./CommunityListItem";
import useShowModeratorFeed from "./useShowModeratorFeed";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./ResolvedCommunitiesList.module.css";

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
      [([letter]) => (letter === "#" ? "\uffff" : letter)], // sort # at bottom
    );
  }, [communities]);

  return (
    <>
      <IonList className={styles.ionList}>
        <VList
          ref={virtuaRef}
          overscan={1}
          className={cx(
            styles.vList,
            "ion-content-scroll-host virtual-scroller",
          )}
        >
          <IonItemGroup key="list" className={sharedStyles.maxWidth}>
            {jwt && (
              <IonItem
                routerLink={buildGeneralBrowseLink(`/home`)}
                detail={false}
                {...attributedPreventOnClickNavigationBug}
              >
                <div className={styles.content}>
                  <IonIcon
                    className={styles.subIcon}
                    icon={home}
                    style={{ background: "red" }}
                  />
                  <div>
                    Home
                    <aside>Posts from subscriptions</aside>
                  </div>
                </div>
              </IonItem>
            )}
            <IonItem
              routerLink={buildGeneralBrowseLink(`/all`)}
              detail={false}
              {...attributedPreventOnClickNavigationBug}
            >
              <div className={styles.content}>
                <IonIcon
                  className={styles.subIcon}
                  icon={earth}
                  style={{ background: "#009dff" }}
                />
                <div>
                  All<aside>Posts across all federated communities</aside>
                </div>
              </div>
            </IonItem>
            <IonItem
              routerLink={buildGeneralBrowseLink(`/local`)}
              detail={false}
              lines={showModeratorFeed ? "inset" : "none"}
              {...attributedPreventOnClickNavigationBug}
            >
              <div className={styles.content}>
                <IonIcon
                  className={styles.subIcon}
                  icon={people}
                  style={{ background: "#00f100" }}
                />
                <div>
                  Local<aside>Posts from communities on {actor}</aside>
                </div>
              </div>
            </IonItem>
            {showModeratorFeed && (
              <IonItem
                routerLink={buildGeneralBrowseLink(`/mod`)}
                detail={false}
                lines="none"
                {...attributedPreventOnClickNavigationBug}
              >
                <div className={styles.content}>
                  <IonIcon
                    className={styles.subIcon}
                    icon={shieldCheckmark}
                    style={{ background: "#464646" }}
                  />
                  <div>
                    Moderator Posts
                    <aside>Posts from moderated communities</aside>
                  </div>
                </div>
              </IonItem>
            )}
          </IonItemGroup>

          {favoritesAsCommunitiesIfFound.length > 0 && (
            <IonItemGroup key="favorites" className={sharedStyles.maxWidth}>
              <IonItemDivider sticky>
                <IonLabel>Favorites</IonLabel>
              </IonItemDivider>

              {favoritesAsCommunitiesIfFound.map((favorite) => (
                <CommunityListItem
                  key={typeof favorite === "string" ? favorite : favorite.id}
                  community={favorite}
                  favorites={favorites}
                  removeAction="favorite"
                />
              ))}
            </IonItemGroup>
          )}

          {moderates?.length ? (
            <IonItemGroup key="moderates" className={sharedStyles.maxWidth}>
              <IonItemDivider sticky>
                <IonLabel>Moderator</IonLabel>
              </IonItemDivider>
              {moderates.map(({ community }) => (
                <CommunityListItem
                  key={community.id}
                  community={community}
                  favorites={favorites}
                  removeAction="none"
                />
              ))}
            </IonItemGroup>
          ) : (
            ""
          )}
          {communitiesGroupedByLetter.map(([letter, communities]) => (
            <IonItemGroup key={letter} className={sharedStyles.maxWidth}>
              <IonItemDivider sticky>
                <IonLabel>{letter}</IonLabel>
              </IonItemDivider>
              {communities.map((community) => (
                <CommunityListItem
                  key={community.id}
                  community={community}
                  favorites={favorites}
                  removeAction="follow"
                />
              ))}
            </IonItemGroup>
          ))}
        </VList>
      </IonList>

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
