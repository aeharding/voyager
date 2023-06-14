import {
  IonButton,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import "./Tab2.css";
import AppContent from "../components/AppContent";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store";
import Login from "../features/auth/Login";
import { useContext } from "react";
import { PageContext } from "../features/auth/PageContext";

const Tab2: React.FC = () => {
  const dispatch = useAppDispatch();

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const pageContext = useContext(PageContext);

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
        {jwt ? (
          <IonButton onClick={() => dispatch(logout())}>Logout</IonButton>
        ) : (
          <IonButton
            onClick={() => login({ presentingElement: pageContext.page })}
          >
            Login
          </IonButton>
        )}
      </AppContent>
    </IonPage>
  );
};

export default Tab2;
