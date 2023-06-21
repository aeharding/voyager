import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonPicker,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
  useIonViewWillEnter,
} from "@ionic/react";
import AppContent from "../features/shared/AppContent";
import {
  handleSelector,
  logout,
  updateConnectedInstance,
} from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store";
import Login from "../features/auth/Login";
import { useContext, useRef, useState } from "react";
import { InsetIonItem, SettingLabel } from "../features/user/Profile";
import { ReactComponent as IncognitoSvg } from "../features/user/incognito.svg";
import styled from "@emotion/styled";
import UserPage from "./UserPage";
import { AppContext } from "../features/auth/AppContext";
import { swapHorizontalOutline } from "ionicons/icons";
import { css } from "@emotion/react";

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
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const [pickerOpen, setPickerOpen] = useState(false);

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
        hideBack
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
        <IonText color="medium">
          <p
            css={css`
              font-size: 0.9em;
              padding: 1rem;
            `}
          >
            Change the instance you&apos;re currently connected to below.
            Alternatively, click <strong>login</strong> to join your instance
            with your account.
          </p>
        </IonText>
        <IonList inset>
          <InsetIonItem
            onClick={() => {
              setPickerOpen(true);
            }}
            detail
          >
            <IonIcon icon={swapHorizontalOutline} color="primary" />
            <SettingLabel>
              Connected to {connectedInstance}{" "}
              <IonText color="medium">(as guest)</IonText>
            </SettingLabel>
          </InsetIonItem>
        </IonList>
        <IonPicker
          isOpen={pickerOpen}
          onDidDismiss={() => setPickerOpen(false)}
          columns={[
            {
              name: "server",
              options: [
                "lemmy.ml",
                "lemmy.world",
                "beehaw.org",
                "sh.itjust.works",
              ].map((server) => ({ text: server, value: server })),
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Confirm",
              handler: (value) => {
                dispatch(updateConnectedInstance(value.server.value));
              },
            },
          ]}
        />
        <Incognito />
      </AppContent>
    </IonPage>
  );
}
