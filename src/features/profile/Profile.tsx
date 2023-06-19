import { IonIcon, IonItem, IonLabel, IonList, IonSpinner } from "@ionic/react";
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

const StyledIonItem = styled(IonItem)`
  --background: var(
    --ion-tab-bar-background,
    var(--ion-color-step-50, #f7f7f7)
  );
`;

const Label = styled(IonLabel)`
  margin-left: 1rem;
`;

const PageContentIonSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  margin-top: 5rem;
`;

export default function Profile() {
  const myUser = useAppSelector((state) => state.auth.site?.my_user);

  if (!myUser) return <PageContentIonSpinner />;

  return (
    <>
      <Scores
        aggregates={myUser.local_user_view.counts}
        accountCreated={myUser.local_user_view.person.published}
      />
      <IonList inset color="primary">
        <StyledIonItem>
          <IonIcon icon={albumsOutline} color="primary" /> <Label>Posts</Label>
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
    </>
  );
}
