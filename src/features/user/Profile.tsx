import React, { useCallback } from "react";
import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
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
import { getHandle, getRemoteHandle, isPost } from "../../helpers/lemmy";
import { MaxWidthContainer } from "../shared/AppContent";
import { FetchFn } from "../feed/Feed";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { useAppSelector } from "../../store";
import PostCommentFeed, { PostCommentItem } from "../feed/PostCommentFeed";
import { userHandleSelector } from "../auth/authSelectors";
import {
  getModColor,
  getModIcon,
  getModName,
} from "../moderation/useCanModerate";
import useModZoneActions from "../moderation/useModZoneActions";
import { styled } from "@linaria/react";

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
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/u/${getHandle(person.person_view.person)}/posts`,
          )}
        >
          <IonIcon icon={albumsOutline} color="primary" />{" "}
          <SettingLabel>Posts</SettingLabel>
        </IonItem>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/u/${getHandle(person.person_view.person)}/comments`,
          )}
        >
          <IonIcon icon={chatbubbleOutline} color="primary" />{" "}
          <SettingLabel>Comments</SettingLabel>
        </IonItem>
        {isSelf && (
          <>
            <IonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person_view.person)}/saved`,
              )}
            >
              <IonIcon icon={bookmarkOutline} color="primary" />{" "}
              <SettingLabel>Saved</SettingLabel>
            </IonItem>
            <IonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person_view.person)}/upvoted`,
              )}
            >
              <IonIcon icon={arrowUp} color="primary" />{" "}
              <SettingLabel>Upvoted</SettingLabel>
            </IonItem>
            <IonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person_view.person)}/downvoted`,
              )}
            >
              <IonIcon icon={arrowDown} color="primary" />{" "}
              <SettingLabel>Downvoted</SettingLabel>
            </IonItem>
            <IonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person_view.person)}/hidden`,
              )}
            >
              <IonIcon icon={eyeOffOutline} color="primary" />{" "}
              <SettingLabel>Hidden</SettingLabel>
            </IonItem>
          </>
        )}
      </IonList>
      {isSelf && role && (
        <IonList inset>
          <IonItem detail onClick={presentModZoneActions}>
            <IonIcon icon={getModIcon(role)} color={getModColor(role)} />{" "}
            <SettingLabel>{getModName(role)} Zone</SettingLabel>
          </IonItem>
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
  if (isPost(item)) return Date.parse(item.post.published);
  return Date.parse(item.comment.published);
}
