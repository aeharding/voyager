import React, { useCallback } from "react";
import { IonIcon, IonLabel, IonList, IonItem } from "@ionic/react";
import Scores from "./Scores";
import {
  albumsOutline,
  arrowDown,
  arrowUp,
  bookmarkOutline,
  chatbubbleOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle, getRemoteHandle } from "../../helpers/lemmy";
import { MaxWidthContainer } from "../shared/AppContent";
import { FetchFn } from "../feed/Feed";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { useAppSelector } from "../../store";
import PostCommentFeed, {
  PostCommentItem,
  isPost,
} from "../feed/PostCommentFeed";
import { userHandleSelector } from "../auth/authSelectors";
import { fixLemmyDateString } from "../../helpers/date";
import {
  getModColor,
  getModIcon,
  getModName,
} from "../moderation/useCanModerate";
import useModZoneActions from "../moderation/useModZoneActions";
import useSupported from "../../helpers/useSupported";
import { styled } from "@linaria/react";

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 16px;
`;

interface ProfileProps {
  person: GetPersonDetailsResponse;
}

export default function Profile({ person }: ProfileProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const myHandle = useAppSelector(userHandleSelector);
  const { present: presentModZoneActions, role } = useModZoneActions({
    type: "ModeratorView",
  });
  const showUpvoteDownvote = useSupported("Profile Upvote/Downvote");

  const isSelf = getRemoteHandle(person.person_view.person) === myHandle;

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const response = await client.getPersonDetails({
        ...pageData,
        limit: LIMIT,
        username: getHandle(person.person_view.person),
        sort: "New",
      });
      return [...response.posts, ...response.comments].sort(
        (a, b) =>
          getPostCommentItemCreatedDate(b) - getPostCommentItemCreatedDate(a),
      );
    },
    [person, client],
  );

  const header = (
    <MaxWidthContainer>
      <Scores
        aggregates={person.person_view.counts}
        accountCreated={person.person_view.person.published}
      />
      <IonList inset>
        <InsetIonItem
          routerLink={buildGeneralBrowseLink(
            `/u/${getHandle(person.person_view.person)}/posts`,
          )}
        >
          <IonIcon icon={albumsOutline} color="primary" />{" "}
          <SettingLabel>Posts</SettingLabel>
        </InsetIonItem>
        <InsetIonItem
          routerLink={buildGeneralBrowseLink(
            `/u/${getHandle(person.person_view.person)}/comments`,
          )}
        >
          <IonIcon icon={chatbubbleOutline} color="primary" />{" "}
          <SettingLabel>Comments</SettingLabel>
        </InsetIonItem>
        {isSelf && (
          <>
            <InsetIonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person_view.person)}/saved`,
              )}
            >
              <IonIcon icon={bookmarkOutline} color="primary" />{" "}
              <SettingLabel>Saved</SettingLabel>
            </InsetIonItem>
            {showUpvoteDownvote && (
              <>
                <InsetIonItem
                  routerLink={buildGeneralBrowseLink(
                    `/u/${getHandle(person.person_view.person)}/upvoted`,
                  )}
                >
                  <IonIcon icon={arrowUp} color="primary" />{" "}
                  <SettingLabel>Upvoted</SettingLabel>
                </InsetIonItem>
                <InsetIonItem
                  routerLink={buildGeneralBrowseLink(
                    `/u/${getHandle(person.person_view.person)}/downvoted`,
                  )}
                >
                  <IonIcon icon={arrowDown} color="primary" />{" "}
                  <SettingLabel>Downvoted</SettingLabel>
                </InsetIonItem>
              </>
            )}
            <InsetIonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person_view.person)}/hidden`,
              )}
            >
              <IonIcon icon={eyeOffOutline} color="primary" />{" "}
              <SettingLabel>Hidden</SettingLabel>
            </InsetIonItem>
          </>
        )}
      </IonList>
      {isSelf && role && (
        <IonList inset>
          <InsetIonItem detail onClick={presentModZoneActions}>
            <IonIcon icon={getModIcon(role)} color={getModColor(role)} />{" "}
            <SettingLabel>{getModName(role)} Zone</SettingLabel>
          </InsetIonItem>
        </IonList>
      )}
    </MaxWidthContainer>
  );

  return (
    <PostCommentFeed
      fetchFn={fetchFn}
      header={header}
      filterHiddenPosts={false}
      filterKeywords={false}
    />
  );
}

export function getPostCommentItemCreatedDate(item: PostCommentItem): number {
  if (isPost(item)) return Date.parse(fixLemmyDateString(item.post.published));
  return Date.parse(fixLemmyDateString(item.comment.published));
}
