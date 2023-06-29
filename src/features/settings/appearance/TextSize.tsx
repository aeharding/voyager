import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { IonLabel, IonList, IonRange, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setFontSizeMultiplier, setUseSystemFontSize } from "./appearanceSlice";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

const Range = styled(IonRange)`
  --bar-background: var(--ion-color-medium);

  ::part(tick) {
    background: var(--ion-color-medium);
  }
`;

const A = styled.div<{ small?: boolean }>`
  font-size: 1.3em;
  padding: 0 0.5rem;
  font-weight: 500;

  ${({ small }) =>
    small &&
    css`
      font-size: 0.8em;
    `}
`;

const HelperText = styled.div`
  margin: 0 32px;
  font-size: 0.9em;
  color: var(--ion-color-medium);
`;

export default function TextSize() {
  const dispatch = useAppDispatch();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.appearance.font
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Text size</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Use System Text Size</IonLabel>
          <IonToggle
            checked={useSystemFontSize}
            onIonChange={(e) =>
              dispatch(setUseSystemFontSize(e.detail.checked))
            }
          />
        </InsetIonItem>
        <InsetIonItem>
          <Range
            disabled={useSystemFontSize}
            ticks
            snaps
            min={0.8}
            max={1.6}
            step={0.1}
            value={fontSizeMultiplier}
            onIonInput={(e) => {
              dispatch(setFontSizeMultiplier(e.detail.value as number));
            }}
          >
            <A slot="start" small>
              A
            </A>
            <A slot="end">A</A>
          </Range>
        </InsetIonItem>
      </IonList>
      <HelperText>Default is two ticks from the left.</HelperText>
    </>
  );
}
