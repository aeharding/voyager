import {
  IonButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
  useIonViewWillEnter,
} from "@ionic/react";
import AppContent from "../components/AppContent";
import { handleSelector, logout } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store";
import Login from "../features/auth/Login";
import { useContext, useRef } from "react";
import Profile from "../features/profile/Profile";
import { ReactComponent as IncognitoSvg } from "../features/profile/incognito.svg";
import styled from "@emotion/styled";
import UserPage from "./UserPage";
import { AppContext } from "../features/auth/AppContext";

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
  const { setActivePage } = useContext(AppContext);

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const handle = useAppSelector(handleSelector);

  useIonViewWillEnter(() => {
    if (pageRef.current) setActivePage(pageRef.current);
  });

  if (jwt)
    return (
      <UserPage
        handle={handle}
        toolbar={
          <IonButton onClick={() => dispatch(logout())}>Logout</IonButton>
        }
      />
    );

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Anonymous</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => login({ presentingElement: pageRef.current })}
            >
              Login
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <p className="ion-padding-start">You're logged out.</p>
        <Incognito />
      </AppContent>
    </IonPage>
  );
}
