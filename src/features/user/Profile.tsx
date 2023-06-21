import React from "react";
import { IonIcon, IonLabel, IonList, IonItem } from "@ionic/react";
import styled from "@emotion/styled";
import Scores from "./Scores";
import {
  albumsOutline,
  bookmarkOutline,
  chatbubbleOutline,
} from "ionicons/icons";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import Comment from "../comment/Comment";
import CommentHr from "../comment/CommentHr";
import PostContext from "./PostContext";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import { MaxWidthContainer } from "../shared/AppContent";

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 1rem;
`;

interface ProfileProps {
  person: GetPersonDetailsResponse;
}

export default function Profile({ person }: ProfileProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <>
      <MaxWidthContainer>
        <Scores
          aggregates={person.person_view.counts}
          accountCreated={person.person_view.person.published}
        />
        <IonList inset color="primary">
          <InsetIonItem routerLink="/">
            <IonIcon icon={albumsOutline} color="primary" />{" "}
            <SettingLabel>Posts</SettingLabel>
          </InsetIonItem>
          <InsetIonItem routerLink="/">
            <IonIcon icon={chatbubbleOutline} color="primary" />{" "}
            <SettingLabel>Comments</SettingLabel>
          </InsetIonItem>
          <InsetIonItem routerLink="/">
            <IonIcon icon={bookmarkOutline} color="primary" />{" "}
            <SettingLabel>Saved</SettingLabel>
          </InsetIonItem>
        </IonList>
      </MaxWidthContainer>
      {person.comments.map((c) => (
        <React.Fragment key={c.comment.id}>
          <Comment
            comment={c}
            depth={0}
            collapsed={false}
            childCount={0}
            opId={c.post.creator_id}
            fullyCollapsed={false}
            context={<PostContext post={c.post} community={c.community} />}
            routerLink={buildGeneralBrowseLink(
              `/c/${getHandle(c.community)}/comments/${c.post.id}/${
                c.comment.path
              }`
            )}
          />
          <CommentHr depth={0} />
        </React.Fragment>
      ))}
    </>
  );
}
