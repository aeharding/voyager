import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import {
  arrowDownSharp,
  arrowUndoOutline,
  arrowUpSharp,
  bookmarkOutline,
  bookmarkSharp,
  shareOutline,
} from "ionicons/icons";

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  color: var(--ion-color-primary);
  font-size: 1.5em;

  width: 100%;
`;

export default function PostActions() {
  return (
    <Container>
      <IonIcon icon={arrowUpSharp} />
      <IonIcon icon={arrowDownSharp} />
      <IonIcon icon={bookmarkOutline} />
      <IonIcon icon={arrowUndoOutline} />
      <IonIcon icon={shareOutline} />
    </Container>
  );
}
