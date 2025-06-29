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
import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import { getSite } from "#/features/auth/siteSlice";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import DocumentTitle from "#/features/shared/DocumentTitle";
import LoggedOut from "#/features/user/LoggedOut";
import Profile from "#/features/user/Profile";
import ProfilePageActions from "#/features/user/ProfilePageActions";
import { AppPage } from "#/helpers/AppPage";
import { isIosTheme } from "#/helpers/device";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

export default function ProfilePage() {
  const accountsListEmpty = useAppSelector(accountsListEmptySelector);
  const handle = useAppSelector(userHandleSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const loggedIn = useAppSelector(loggedInSelector);
  const dispatch = useAppDispatch();

  const { presentAccountSwitcher } = use(SharedDialogContext);

  const myPerson = useAppSelector((state) => state.site.response?.my_user);

  const title = handle ?? connectedInstance;

  function renderContent() {
    if (!handle) return <LoggedOut />;

    if (!myPerson) return <CenteredSpinner />;

    return (
      <Profile
        person={{
          person: myPerson.local_user_view.person,
          counts: myPerson.local_user_view.counts,
        }}
        onPull={() => dispatch(getSite()) satisfies Promise<void>}
      />
    );
  }

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

      <FeedContent color="light-bg">{renderContent()}</FeedContent>
    </AppPage>
  );
}
