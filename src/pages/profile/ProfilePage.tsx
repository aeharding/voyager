import {
  IonButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AsyncProfile from "../../features/user/AsyncProfile";
import { useAppSelector } from "../../store";
import {
  handleSelector,
  loggedInSelector,
  profilesEmptySelector,
} from "../../features/auth/authSelectors";
import LoggedOut from "../../features/user/LoggedOut";
import { useContext } from "react";
import AppContent from "../../features/shared/AppContent";
import { PageContext } from "../../features/auth/PageContext";
import FeedContent from "../shared/FeedContent";
import ProfilePageActions from "../../features/user/ProfilePageActions";

export default function ProfilePage() {
  const profilesEmpty = useAppSelector(profilesEmptySelector);
  const handle = useAppSelector(handleSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const loggedIn = useAppSelector(loggedInSelector);

  const { presentAccountSwitcher } = useContext(PageContext);

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          {!profilesEmpty && (
            <IonButtons slot="start">
              <IonButton onClick={() => presentAccountSwitcher()}>
                Accounts
              </IonButton>
            </IonButtons>
          )}

          <IonTitle>{handle ?? connectedInstance}</IonTitle>

          {loggedIn && (
            <IonButtons slot="end">
              <ProfilePageActions />
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      {handle ? (
        <FeedContent>
          <AsyncProfile handle={handle} />
        </FeedContent>
      ) : (
        <AppContent>
          <LoggedOut />
        </AppContent>
      )}
    </IonPage>
  );
}
