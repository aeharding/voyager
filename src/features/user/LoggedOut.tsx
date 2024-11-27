import { IonButton, IonText } from "@ionic/react";
import { useContext } from "react";

import { accountsListEmptySelector } from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import AppContent from "#/features/shared/AppContent";
import sharedStyles from "#/features/shared/shared.module.css";
import { useAppSelector } from "#/store";

import IncognitoSvg from "./incognito.svg?react";
import styles from "./LoggedOut.module.css";

export default function LoggedOut() {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const accountsListEmpty = useAppSelector(accountsListEmptySelector);

  const { presentLoginIfNeeded, presentAccountSwitcher } =
    useContext(PageContext);

  return (
    <AppContent className={styles.content}>
      <div>
        <IonText color="medium">
          <p className={styles.message}>
            You are browsing <strong>{connectedInstance}</strong> as a guest.
            Log in to vote, comment and post!
          </p>
        </IonText>
        <IonButton
          className="ion-padding-start ion-padding-end"
          expand="block"
          onClick={() => {
            presentLoginIfNeeded();
          }}
        >
          {accountsListEmpty ? "Get Started" : "Log In"}
        </IonButton>
        {!accountsListEmpty && (
          <IonButton
            className="ion-padding-start ion-padding-end"
            expand="block"
            fill="clear"
            onClick={() => {
              presentAccountSwitcher();
            }}
          >
            Switch Accounts
          </IonButton>
        )}
      </div>
      <IncognitoSvg className={sharedStyles.emptyStateIcon} />
    </AppContent>
  );
}
