import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { changeAccount, logoutAccount } from "./authSlice";
import Login from "./Login";

interface AccountSwitcherProps {
  onDismiss: (data?: string, role?: string) => void;
  page: HTMLElement | undefined;
}

export default function AccountSwitcher({
  onDismiss,
  page,
}: AccountSwitcherProps) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);
  const activeAccountHandle = useAppSelector(
    (state) => state.auth.accountData?.activeAccountHandle
  );

  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => onDismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>Accounts</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => login({ presentingElement: page })}>
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRadioGroup
          value={activeAccountHandle}
          onIonChange={(e) => {
            dispatch(changeAccount(e.target.value));
          }}
        >
          <IonList>
            {accounts?.map((account) => (
              <IonItemSliding key={account.handle}>
                <IonItemOptions
                  side="end"
                  onIonSwipe={(e) => {
                    dispatch(logoutAccount(e.detail.value));
                  }}
                >
                  <IonItemOption
                    color="danger"
                    expandable
                    onClick={() => {
                      dispatch(logoutAccount(account.handle));
                    }}
                  >
                    Log out
                  </IonItemOption>
                </IonItemOptions>
                <IonItem>
                  <IonRadio value={account.handle}>{account.handle}</IonRadio>
                </IonItem>
              </IonItemSliding>
            ))}
          </IonList>
        </IonRadioGroup>
      </IonContent>
    </IonPage>
  );
}
