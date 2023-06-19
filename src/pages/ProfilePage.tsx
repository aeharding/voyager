import {
  IonButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import AppContent from "../components/AppContent";
import { handleSelector, logout } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store";
import Login from "../features/auth/Login";
import { useRef } from "react";
import Profile from "../features/profile/Profile";
import { ReactComponent as IncognitoSvg } from "../features/profile/incognito.svg";
import styled from "@emotion/styled";

const Incognito = styled(IncognitoSvg)`
  opacity: 0.1;
  width: 300px;
  height: 300px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const pageRef = useRef();

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const handle = useAppSelector(handleSelector);

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{handle ?? "Anonymous"}</IonTitle>

          <IonButtons slot="end">
            {jwt ? (
              <IonButton onClick={() => dispatch(logout())}>Logout</IonButton>
            ) : (
              <IonButton
                onClick={() => login({ presentingElement: pageRef.current })}
              >
                Login
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        {jwt ? (
          <Profile />
        ) : (
          <>
            <p className="ion-padding-start">You're logged out.</p>

            <Incognito />
          </>
        )}
      </AppContent>
    </IonPage>
  );
}
