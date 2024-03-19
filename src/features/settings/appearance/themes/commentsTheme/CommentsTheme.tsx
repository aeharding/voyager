import {
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { ListHeader } from "../../../shared/formatting";
import { OCommentsThemeType } from "../../../../../services/db";
import COMMENT_THEMES from "./values";
import Color from "./Color";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setCommentsTheme } from "../../../settingsSlice";
import { startCase } from "lodash";

const ColorsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Colors = styled.div`
  display: flex;
  gap: 6px;
  margin: 0 6px;

  .theme-dark & {
    opacity: 0.7;
  }
`;

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
              <IonRadio
                value={value}
                className={css`
                  &::part(label) {
                    flex: 1;
                  }
                `}
              >
                <ColorsContainer>
                  <IonLabel>{startCase(label)}</IonLabel>
                  <Colors>
                    {COMMENT_THEMES[value].map((color, index) => (
                      <Color key={index} color={color} />
                    ))}
                  </Colors>
                </ColorsContainer>
              </IonRadio>
            </IonItem>
          ))}
        </IonList>
      </IonRadioGroup>
    </>
  );
}
