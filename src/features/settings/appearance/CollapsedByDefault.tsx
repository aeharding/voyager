import styled from "@emotion/styled";
import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  OCommentThreadCollapse,
  setCommentsCollapsed,
} from "./appearanceSlice";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function CollapsedByDefault() {
  const dispatch = useAppDispatch();
  const { collapseCommentThreads } = useAppSelector(
    // this needs a better naming
    (state) => state.appearance.comments
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Collapse comment threads</IonLabel>
          <IonToggle
            checked={collapseCommentThreads === OCommentThreadCollapse.Always}
            onIonChange={(e) =>
              dispatch(
                setCommentsCollapsed(
                  e.detail.checked
                    ? OCommentThreadCollapse.Always
                    : OCommentThreadCollapse.Never
                )
              )
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
