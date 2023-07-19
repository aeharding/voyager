import styled from "@emotion/styled";
import { IonLabel, IonList } from "@ionic/react";
import DefaultSort from "./DefaultSort";
import ShowCollapsedComment from "./ShowCollapsedComment";
import CollapsedByDefault from "./CollapsedByDefault";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function Comments() {
  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <CollapsedByDefault />
        <ShowCollapsedComment />
        <DefaultSort />
      </IonList>
    </>
  );
}
