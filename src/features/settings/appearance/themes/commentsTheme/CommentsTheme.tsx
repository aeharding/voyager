import {
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { startCase } from "es-toolkit";

import { ListHeader } from "#/features/settings/shared/formatting";
import { OCommentsThemeType } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import { setCommentsTheme } from "../../../settingsSlice";
import Color from "./Color";
import COMMENT_THEMES from "./values";

import styles from "./CommentsTheme.module.css";

export default function CommentsTheme() {
  const dispatch = useAppDispatch();
  const commentsTheme = useAppSelector(
    (state) => state.settings.appearance.commentsTheme,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Comments Theme</IonLabel>
      </ListHeader>
      <IonRadioGroup
        value={commentsTheme}
        onIonChange={(e) => {
          dispatch(setCommentsTheme(e.detail.value));
        }}
      >
        <IonList inset>
          {Object.entries(OCommentsThemeType).map(([label, value]) => (
            <IonItem key={value}>
              <IonRadio value={value} className={styles.radio}>
                <div className={styles.container}>
                  <IonLabel>{startCase(label)}</IonLabel>
                  <div className={styles.colors}>
                    {COMMENT_THEMES[value].map((color, index) => (
                      <Color key={index} color={color} />
                    ))}
                  </div>
                </div>
              </IonRadio>
            </IonItem>
          ))}
        </IonList>
      </IonRadioGroup>
    </>
  );
}
