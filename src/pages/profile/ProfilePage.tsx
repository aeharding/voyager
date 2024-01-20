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
  accountsListEmptySelector,
} from "../../features/auth/authSelectors";
import LoggedOut from "../../features/user/LoggedOut";
import { useContext } from "react";
import { PageContext } from "../../features/auth/PageContext";
import FeedContent from "../shared/FeedContent";
import ProfilePageActions from "../../features/user/ProfilePageActions";

export default function ProfilePage() {
  const accountsListEmpty = useAppSelector(accountsListEmptySelector);
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
          {!accountsListEmpty && (
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
        <LoggedOut />
      )}
    </IonPage>
  );
}
