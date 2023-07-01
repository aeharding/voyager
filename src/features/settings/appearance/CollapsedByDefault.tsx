import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { IonLabel, IonList, IonRange, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  setCommentsCollapsed,
  setFontSizeMultiplier,
  setUseSystemFontSize,
} from "./appearanceSlice";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

const HelperText = styled.div`
  margin: 0 32px;
  font-size: 0.9em;
  color: var(--ion-color-medium);
`;

export default function CollapsedByDefault() {
  const dispatch = useAppDispatch();
  const { isCommentsCollapsed } = useAppSelector(
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
          <IonLabel>Automatically collapse comments threads</IonLabel>
          <IonToggle
            checked={isCommentsCollapsed}
            onIonChange={(e) =>
              dispatch(setCommentsCollapsed(e.detail.checked))
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
