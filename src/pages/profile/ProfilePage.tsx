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
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import {
  handleSelector,
  jwtSelector,
  updateConnectedInstance,
} from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import Login from "../../features/auth/Login";
import { useContext, useRef, useState } from "react";
import { InsetIonItem, SettingLabel } from "../../features/user/Profile";
import { ReactComponent as IncognitoSvg } from "../../features/user/incognito.svg";
import styled from "@emotion/styled";
import UserPage from "../shared/UserPage";
import { useSetActivePage } from "../../features/auth/AppContext";
import { swapHorizontalOutline } from "ionicons/icons";
import { css } from "@emotion/react";
import AccountSwitcher from "../../features/auth/AccountSwitcher";
import { PageContext } from "../../features/auth/PageContext";
import { LEMMY_SERVERS } from "../../helpers/lemmy";

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
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const jwt = useAppSelector(jwtSelector);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const pageContext = useContext(PageContext);
  const handle = useAppSelector(handleSelector);

  const [presentAccountSwitcher, onDismissAccountSwitcher] = useIonModal(
    AccountSwitcher,
    {
      onDismiss: (data: string, role: string) =>
        onDismissAccountSwitcher(data, role),
      page: pageContext.page,
    },
  );

  useSetActivePage(pageRef.current);

  if (jwt)
    return (
      <UserPage
        handle={handle}
        toolbar={
          <IonButton
            onClick={() => presentAccountSwitcher({ cssClass: "small" })}
          >
            Accounts
          </IonButton>
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
      <AppContent scrollY>
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
              options: LEMMY_SERVERS.map((server) => ({
                text: server,
                value: server,
              })),
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
