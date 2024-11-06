import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { arrowDownOutline, arrowUpOutline } from "ionicons/icons";
import * as _ from "radashi";

import { ListHeader } from "#/features/settings/shared/formatting";
import { OVotesThemeType } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import { setVotesTheme } from "../../../settingsSlice";

export const VOTE_COLORS = {
  UPVOTE: {
    [OVotesThemeType.Lemmy]: "primary-fixed",
    [OVotesThemeType.Reddit]: "reddit-upvote",
  },
  DOWNVOTE: {
    [OVotesThemeType.Lemmy]: "danger",
    [OVotesThemeType.Reddit]: "primary-fixed",
  },
};

export function bgColorToVariable(bgColor: string): string {
  return `var(--ion-color-${bgColor})`;
}

const VotesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Votes = styled.div`
  display: flex;
  gap: 6px;
  margin: 0 6px;
`;

const Vote = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;

  background: ${({ bgColor }) => bgColorToVariable(bgColor)};
  color: white;
`;

export default function VotesTheme() {
  const dispatch = useAppDispatch();
  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Votes Theme</IonLabel>
      </ListHeader>
      <IonRadioGroup
        value={votesTheme}
        onIonChange={(e) => {
          dispatch(setVotesTheme(e.detail.value));
        }}
      >
        <IonList inset>
          {Object.entries(OVotesThemeType).map(([label, value]) => (
            <IonItem key={value}>
              <IonRadio
                value={value}
                className={css`
                  &::part(label) {
                    flex: 1;
                  }
                `}
              >
                <VotesContainer>
                  <IonLabel>{_.title(label)}</IonLabel>
                  <Votes>
                    <Vote bgColor={VOTE_COLORS.UPVOTE[value]}>
                      <IonIcon icon={arrowUpOutline} />
                    </Vote>
                    <Vote bgColor={VOTE_COLORS.DOWNVOTE[value]}>
                      <IonIcon icon={arrowDownOutline} />
                    </Vote>
                  </Votes>
                </VotesContainer>
              </IonRadio>
            </IonItem>
          ))}
        </IonList>
      </IonRadioGroup>
    </>
  );
}
