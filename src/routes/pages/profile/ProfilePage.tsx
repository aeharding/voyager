import {
  IonButton,
  IonButtons,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { swapHorizontalSharp } from "ionicons/icons";
import { use } from "react";

import {
  accountsListEmptySelector,
  loggedInSelector,
  userHandleSelector,
} from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import AppHeader from "#/features/shared/AppHeader";
import DocumentTitle from "#/features/shared/DocumentTitle";
import AsyncProfile from "#/features/user/AsyncProfile";
import LoggedOut from "#/features/user/LoggedOut";
import ProfilePageActions from "#/features/user/ProfilePageActions";
import { AppPage } from "#/helpers/AppPage";
import { isIosTheme } from "#/helpers/device";
import { useAppSelector } from "#/store";

export default function ProfilePage() {
  const accountsListEmpty = useAppSelector(accountsListEmptySelector);
  const handle = useAppSelector(userHandleSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const loggedIn = useAppSelector(loggedInSelector);

  const { presentAccountSwitcher } = use(PageContext);

  const title = handle ?? connectedInstance;

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          {!accountsListEmpty && (
            <IonButtons slot="secondary">
              <IonButton onClick={() => presentAccountSwitcher()}>
                {isIosTheme() ? (
                  "Accounts"
                ) : (
                  <IonIcon icon={swapHorizontalSharp} slot="icon-only" />
                )}
              </IonButton>
            </IonButtons>
          )}

          <DocumentTitle>{title}</DocumentTitle>
          <IonTitle>{title}</IonTitle>

          {loggedIn && (
            <IonButtons slot="end">
              <ProfilePageActions />
            </IonButtons>
          )}
        </IonToolbar>
      </AppHeader>

      {handle ? <AsyncProfile handle={handle} /> : <LoggedOut />}
    </AppPage>
  );
}
