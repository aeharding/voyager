import { IonItem, IonLabel, IonList, IonRange, IonToggle } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setFontSizeMultiplier, setUseSystemFontSize } from "../settingsSlice";
import { HelperText, ListHeader } from "../shared/formatting";
import { styled } from "@linaria/react";

const Range = styled(IonRange)`
  --bar-background: var(--ion-color-medium);

  ::part(tick) {
    background: var(--ion-color-medium);
  }
`;

const A = styled.div<{ small?: boolean }>`
  padding: 0 6px;
  font-weight: 500;
  font-size: ${({ small }) => (small ? "0.8em" : "1.3em")};
`;

const MAX_REGULAR_FONT_ADJUSTMENT = 1.6;
const MIN_LARGER_FONT_ADJUSTMENT = 2;

export default function TextSize() {
  const dispatch = useAppDispatch();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.settings.appearance.font,
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
        <IonItem>
          <IonToggle
            checked={useSystemFontSize}
            onIonChange={(e) =>
              dispatch(setUseSystemFontSize(e.detail.checked))
            }
          >
            Use System Text Size
          </IonToggle>
        </IonItem>
        <IonItem>
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
        </IonItem>
        {fontSizeMultiplier >= 1.4 && (
          <IonItem>
            <IonToggle
              checked={fontSizeMultiplier > MAX_REGULAR_FONT_ADJUSTMENT}
              onIonChange={() =>
                dispatch(
                  setFontSizeMultiplier(
                    fontSizeMultiplier >= MIN_LARGER_FONT_ADJUSTMENT
                      ? MAX_REGULAR_FONT_ADJUSTMENT
                      : MIN_LARGER_FONT_ADJUSTMENT,
                  ),
                )
              }
            >
              Larger Text Mode
            </IonToggle>
          </IonItem>
        )}
      </IonList>
      <HelperText>Default is two ticks from the left.</HelperText>
    </>
  );
}
