import { IonItem, IonLabel, IonList, IonRange, IonToggle } from "@ionic/react";

import { HelperText, ListHeader } from "#/features/settings/shared/formatting";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  setAccommodateLargeText,
  setFontSizeMultiplier,
  setUseSystemFontSize,
} from "../settingsSlice";

import styles from "./TextSize.module.css";

const MAX_REGULAR_FONT_ADJUSTMENT = 1.6;
const MIN_LARGER_FONT_ADJUSTMENT = 2;

export default function TextSize() {
  const dispatch = useAppDispatch();
  const { fontSizeMultiplier, useSystemFontSize, accommodateLargeText } =
    useAppSelector((state) => state.settings.appearance.font);

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
          <IonRange
            className={styles.range}
            disabled={useSystemFontSize}
            ticks
            snaps
            {...ranges}
            value={fontSizeMultiplier}
            onIonInput={(e) => {
              dispatch(setFontSizeMultiplier(e.detail.value as number));
            }}
          >
            <div className={styles.aSmall} slot="start">
              A
            </div>
            <div className={styles.a} slot="end">
              A
            </div>
          </IonRange>
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

        <IonItem>
          <IonToggle
            checked={accommodateLargeText}
            onIonChange={(e) =>
              dispatch(setAccommodateLargeText(e.detail.checked))
            }
          >
            <span className="ion-text-wrap">Accommodate Large Text</span>
          </IonToggle>
        </IonItem>
      </IonList>
      <HelperText>Default is two ticks from the left.</HelperText>
    </>
  );
}
