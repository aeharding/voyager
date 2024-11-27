import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Community, Person } from "lemmy-js-client";
import { useEffect } from "react";
import { useParams } from "react-router";

import useFetchCommunity from "#/features/community/useFetchCommunity";
import Feed, { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import {
  getLogDate,
  getLogIndex,
  ModlogItemType,
} from "#/features/moderation/logs/helpers";
import { ModlogItem } from "#/features/moderation/logs/ModlogItem";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { getUser } from "#/features/user/userSlice";
import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import FeedContent from "./FeedContent";

export default function ModlogPage() {
  const { community, handle } = useParams<{
    community?: string;
    handle?: string;
  }>();

  if (handle) return <ModlogByUserHandle handle={handle} />;
  if (community) return <ModlogByCommunityName communityName={community} />;

  return <GlobalModlog />;
}

function GlobalModlog() {
  return <Modlog />;
}

function ModlogByCommunityName({ communityName }: { communityName: string }) {
  const community = useFetchCommunity(communityName);

  if (!community) return <CenteredSpinner />;

  return <Modlog community={community.community} />;
}

function ModlogByUserHandle({ handle }: { handle: string }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(
    (state) => state.user.userByHandle[handle.toLowerCase()],
  );

  useEffect(() => {
    if (user) return;

    dispatch(getUser(handle));
  }, [handle, dispatch, user]);

  if (!user) return <CenteredSpinner />;

  return <Modlog user={user} />;
}

interface ModlogProps {
  community?: Community;
  user?: Person;
}

function Modlog({ community, user }: ModlogProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();

  const fetchFn: FetchFn<ModlogItemType> = async (pageData, ...rest) => {
    const logs = await client.getModlog(
      {
        ...pageData,
        limit: LIMIT,
        community_id: community?.id,
        other_person_id: user?.id,
      },
      ...rest,
    );

    return Object.values(logs)
      .reduce<ModlogItemType[]>((acc, current) => acc.concat(current), [])
      .sort((a, b) => Date.parse(getLogDate(b)) - Date.parse(getLogDate(a)));
  };

  function renderItemContent(item: ModlogItemType) {
    return <ModlogItem item={item} />;
  }

  function buildTitle() {
    if (community) return getHandle(community);
    if (user) return getHandle(user);

    return "Mod";
  }

  return (
    <FeedContextProvider>
      <IonPage>
        <AppHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton
                defaultHref={buildGeneralBrowseLink(
                  community ? buildCommunityLink(community) : "",
                )}
              />
            </IonButtons>
            <IonTitle>{buildTitle()} Logs</IonTitle>
          </IonToolbar>
        </AppHeader>
        <FeedContent>
          <Feed
            fetchFn={fetchFn}
            renderItemContent={renderItemContent}
            getIndex={getLogIndex}
          />
        </FeedContent>
      </IonPage>
    </FeedContextProvider>
  );
}
