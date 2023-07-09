import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import AsyncProfile from "../../features/user/AsyncProfile";
import { useAppSelector } from "../../store";
import { handleSelector } from "../../features/auth/authSlice";
import LoggedOut from "../../features/user/LoggedOut";
import AccountSwitcher from "../../features/auth/AccountSwitcher";
import { useContext, useRef } from "react";
import { useSetActivePage } from "../../features/auth/AppContext";
import AppContent from "../../features/shared/AppContent";
import { PageContext } from "../../features/auth/PageContext";

export default function ProfilePage() {
  const pageRef = useRef();
  const handle = useAppSelector(handleSelector);

  const [presentAccountSwitcher, onDismissAccountSwitcher] = useIonModal(
    AccountSwitcher,
    {
      onDismiss: (data: string, role: string) =>
        onDismissAccountSwitcher(data, role),
      page: pageRef.current,
    }
  );
  const { presentLoginIfNeeded } = useContext(PageContext);

  useSetActivePage(pageRef.current);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          {handle ? (
            <>
              <IonButtons slot="start">
                <IonButton
                  onClick={() => presentAccountSwitcher({ cssClass: "small" })}
                >
                  Accounts
                </IonButton>
              </IonButtons>

              <IonTitle>{handle}</IonTitle>
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
        <IonContent>
          <AsyncProfile handle={handle} />
        </IonContent>
      ) : (
        <AppContent>
          <LoggedOut />
        </AppContent>
      )}
    </IonPage>
  );
}
