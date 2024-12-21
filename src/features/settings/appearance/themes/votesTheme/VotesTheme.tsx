import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { startCase } from "es-toolkit";
import { arrowDownOutline, arrowUpOutline } from "ionicons/icons";

import { ListHeader } from "#/features/settings/shared/formatting";
import { OVotesThemeType } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import { setVotesTheme } from "../../../settingsSlice";

import styles from "./VotesTheme.module.css";

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

interface VoteProps extends React.PropsWithChildren {
  bgColor: string;
}

function Vote({ bgColor, ...props }: VoteProps) {
  return (
    <div
      {...props}
      className={styles.vote}
      style={{ backgroundColor: bgColorToVariable(bgColor) }}
    />
  );
}

export function bgColorToVariable(bgColor: string): string {
  return `var(--ion-color-${bgColor})`;
}

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
              <IonRadio value={value} className={styles.radio}>
                <div className={styles.container}>
                  <IonLabel>{startCase(label)}</IonLabel>
                  <div className={styles.votes}>
                    <Vote bgColor={VOTE_COLORS.UPVOTE[value]}>
                      <IonIcon icon={arrowUpOutline} />
                    </Vote>
                    <Vote bgColor={VOTE_COLORS.DOWNVOTE[value]}>
                      <IonIcon icon={arrowDownOutline} />
                    </Vote>
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
