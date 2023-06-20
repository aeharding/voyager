import {
  IonIcon,
  IonLabel,
  IonList,
  IonRouterLink,
  IonSpinner,
  IonItem,
} from "@ionic/react";
import { useAppSelector } from "../../store";
import styled from "@emotion/styled";
import Scores from "./Scores";
import {
  albumsOutline,
  bookmark,
  bookmarkOutline,
  chatbubble,
  chatbubbleOutline,
  chevronForward,
} from "ionicons/icons";
import { GetPersonDetailsResponse, PersonViewSafe } from "lemmy-js-client";
import Comment from "../../components/Comment";
import CommentHr from "../../components/CommentHr";
import PostContext from "./PostContext";
import React from "react";
import { Link } from "react-router-dom";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import { MaxWidthContainer } from "../../components/AppContent";

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 1rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
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
