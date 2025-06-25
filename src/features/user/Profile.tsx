import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import {
  albumsOutline,
  arrowDown,
  arrowUp,
  bookmarkOutline,
  chatbubbleOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { ComponentProps } from "react";
import { CommentView, PersonView } from "threadiverse";

import { userHandleSelector } from "#/features/auth/authSelectors";
import { receivedComments } from "#/features/comment/commentSlice";
import { FetchFn } from "#/features/feed/Feed";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import {
  getModColor,
  getModIcon,
  getModName,
} from "#/features/moderation/useCanModerate";
import useModZoneActions from "#/features/moderation/useModZoneActions";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import { getHandle, getRemoteHandle, isPost } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useMode } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import Scores from "./Scores";

interface ProfileProps
  extends Pick<ComponentProps<typeof PostCommentFeed>, "onPull"> {
  person: Pick<PersonView, "person" | "counts">;
}

export default function Profile({ person, onPull }: ProfileProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const mode = useMode();
  const client = useClient();
  const myHandle = useAppSelector(userHandleSelector);
  const { present: presentModZoneActions, role } = useModZoneActions({
    type: "ModeratorView",
  });
  const dispatch = useAppDispatch();

  const isSelf = getRemoteHandle(person.person) === myHandle;

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const response = await client.listPersonContent(
      {
        ...pageData,
        limit: LIMIT,
        person_id: person.person.id,
      },
      ...rest,
    );

    const content = response.content;

    dispatch(
      receivedComments(
        response.content.filter((c) => !isPost(c)) as CommentView[],
      ),
    );

    return content;
  };

  const header = (
    <MaxWidthContainer>
      <Scores
        aggregates={person.counts}
        accountCreated={person.person.published}
      />
      <IonList inset>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/u/${getHandle(person.person)}/posts`,
          )}
          detail
        >
          <IonIcon icon={albumsOutline} color="primary" slot="start" />{" "}
          <IonLabel className="ion-text-nowrap">Posts</IonLabel>
        </IonItem>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/u/${getHandle(person.person)}/comments`,
          )}
          detail
        >
          <IonIcon icon={chatbubbleOutline} color="primary" slot="start" />{" "}
          <IonLabel className="ion-text-nowrap">Comments</IonLabel>
        </IonItem>
        {isSelf && (
          <>
            {mode !== "piefed" && (
              <>
                <IonItem
                  routerLink={buildGeneralBrowseLink(
                    `/u/${getHandle(person.person)}/saved`,
                  )}
                  detail
                >
                  <IonIcon
                    icon={bookmarkOutline}
                    color="primary"
                    slot="start"
                  />{" "}
                  <IonLabel className="ion-text-nowrap">Saved</IonLabel>
                </IonItem>
                <IonItem
                  routerLink={buildGeneralBrowseLink(
                    `/u/${getHandle(person.person)}/upvoted`,
                  )}
                  detail
                >
                  <IonIcon icon={arrowUp} color="primary" slot="start" />{" "}
                  <IonLabel className="ion-text-nowrap">Upvoted</IonLabel>
                </IonItem>
                <IonItem
                  routerLink={buildGeneralBrowseLink(
                    `/u/${getHandle(person.person)}/downvoted`,
                  )}
                  detail
                >
                  <IonIcon icon={arrowDown} color="primary" slot="start" />{" "}
                  <IonLabel className="ion-text-nowrap">Downvoted</IonLabel>
                </IonItem>
              </>
            )}
            <IonItem
              routerLink={buildGeneralBrowseLink(
                `/u/${getHandle(person.person)}/hidden`,
              )}
              detail
            >
              <IonIcon icon={eyeOffOutline} color="primary" slot="start" />{" "}
              <IonLabel className="ion-text-nowrap">Hidden</IonLabel>
            </IonItem>
          </>
        )}
      </IonList>
      {isSelf && role && (
        <IonList inset>
          <IonItem detail button onClick={presentModZoneActions}>
            <IonIcon
              icon={getModIcon(role)}
              color={getModColor(role)}
              slot="start"
            />{" "}
            <IonLabel className="ion-text-nowrap">
              {getModName(role)} Zone
            </IonLabel>
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
      filterKeywordsAndWebsites={false}
      onPull={onPull}
    />
  );
}
