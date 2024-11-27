import {
  IonButton,
  IonButtons,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { swapHorizontalSharp } from "ionicons/icons";
import { useContext, useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
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
import { isIosTheme } from "#/helpers/device";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppSelector } from "#/store";

export default function ProfilePage() {
  const pageRef = useRef<HTMLElement>(null);

  const accountsListEmpty = useAppSelector(accountsListEmptySelector);
  const handle = useAppSelector(userHandleSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const loggedIn = useAppSelector(loggedInSelector);

  const { presentAccountSwitcher } = useContext(PageContext);

  useSetActivePage(pageRef, !handle);

  const title = handle ?? connectedInstance;

  return (
    <IonPage className="grey-bg" ref={pageRef}>
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

      {handle ? (
        <FeedContent>
          <AsyncProfile handle={handle} />
        </FeedContent>
      ) : (
        <LoggedOut />
      )}
    </IonPage>
  );
}
