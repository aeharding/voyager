import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { IonLabel, IonList, IonRange, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setFontSizeMultiplier, setUseSystemFontSize } from "../settingsSlice";
import { ListHeader } from "../shared/formatting";

const Range = styled(IonRange)`
  --bar-background: var(--ion-color-medium);

  ::part(tick) {
    background: var(--ion-color-medium);
  }
`;

const A = styled.div<{ small?: boolean }>`
  font-size: 1.3em;
  padding: 0 6px;
  font-weight: 500;

  ${({ small }) =>
    small &&
    css`
      font-size: 0.8em;
    `}
`;

const HelperText = styled.div`
  margin: 0 32px;
  font-size: 0.875em;
  color: var(--ion-color-medium);
`;

const MAX_REGULAR_FONT_ADJUSTMENT = 1.6;
const MIN_LARGER_FONT_ADJUSTMENT = 2;

export default function TextSize() {
  const dispatch = useAppDispatch();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.settings.appearance.font
  );

  const ranges =
    fontSizeMultiplier <= MAX_REGULAR_FONT_ADJUSTMENT
      ? {
          min: 0.8,
          max: MAX_REGULAR_FONT_ADJUSTMENT,
          step: 0.1,
        }
      : {
          min: MIN_LARGER_FONT_ADJUSTMENT,
          max: 3.5,
          step: 0.25,
        };

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
            {...ranges}
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
        {fontSizeMultiplier >= 1.4 && (
          <InsetIonItem>
            <IonLabel>Larger Text Mode</IonLabel>
            <IonToggle
              checked={fontSizeMultiplier > MAX_REGULAR_FONT_ADJUSTMENT}
              onIonChange={() =>
                dispatch(
                  setFontSizeMultiplier(
                    fontSizeMultiplier >= MIN_LARGER_FONT_ADJUSTMENT
                      ? MAX_REGULAR_FONT_ADJUSTMENT
                      : MIN_LARGER_FONT_ADJUSTMENT
                  )
                )
              }
            />
          </InsetIonItem>
        )}
      </IonList>
      <HelperText>Default is two ticks from the left.</HelperText>
    </>
  );
}
