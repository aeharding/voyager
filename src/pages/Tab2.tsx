import {
  IonButton,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Tab2.css";
import AppContent from "../components/AppContent";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store";

const Tab2: React.FC = () => {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((state) => state.auth.jwt);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        {jwt && (
          <IonButton onClick={() => dispatch(logout())}>Logout</IonButton>
        )}
      </AppContent>
    </IonPage>
  );
};

export default Tab2;
