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
import { handleSelector } from "../../features/auth/authSlice";
import LoggedOut from "../../features/user/LoggedOut";
import { useContext } from "react";
import AppContent from "../../features/shared/AppContent";
import { PageContext } from "../../features/auth/PageContext";
import FeedContent from "../shared/FeedContent";
import ProfilePageActions from "../../features/user/ProfilePageActions";

export default function ProfilePage() {
  const handle = useAppSelector(handleSelector);
  const { presentAccountSwitcher, presentLoginIfNeeded } =
    useContext(PageContext);

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          {handle ? (
            <>
              <IonButtons slot="start">
                <IonButton onClick={() => presentAccountSwitcher()}>
                  Accounts
                </IonButton>
              </IonButtons>

              <IonTitle>{handle}</IonTitle>

              <IonButtons slot="end">
                <ProfilePageActions />
              </IonButtons>
            </>
          ) : (
            <>
              <IonTitle>Anonymous</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => presentLoginIfNeeded()}>
                  Login
                </IonButton>
              </IonButtons>
            </>
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
