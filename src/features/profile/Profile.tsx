import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRouterLink,
  IonSpinner,
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
import { MaxWidthContainer, maxWidthCss } from "../../components/AppContent";

const StyledIonItem = styled(IonItem)`
  --background: var(
    --ion-tab-bar-background,
    var(--ion-color-step-50, #f7f7f7)
  );
`;

const Label = styled(IonLabel)`
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
          <StyledIonItem>
            <IonIcon icon={albumsOutline} color="primary" />{" "}
            <Label>Posts</Label>
            <IonIcon icon={chevronForward} color="medium" />
          </StyledIonItem>
          <StyledIonItem>
            <IonIcon icon={chatbubbleOutline} color="primary" />{" "}
            <Label>Comments</Label>
            <IonIcon icon={chevronForward} color="medium" />
          </StyledIonItem>
          <StyledIonItem>
            <IonIcon icon={bookmarkOutline} color="primary" />{" "}
            <Label>Saved</Label>
            <IonIcon icon={chevronForward} color="medium" />
          </StyledIonItem>
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
                c.comment.id
              }`
            )}
          />
          <CommentHr depth={0} />
        </React.Fragment>
      ))}
    </>
  );
}
