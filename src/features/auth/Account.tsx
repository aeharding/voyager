import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonRadio,
  IonReorder,
  ItemSlidingCustomEvent,
} from "@ionic/react";
import { removeCircle } from "ionicons/icons";
import { Credential, logoutAccount } from "./authSlice";
import { useAppDispatch } from "../../store";
import { useRef } from "react";
import styled from "@emotion/styled";

const RemoveIcon = styled(IonIcon)`
  position: relative;

  &:after {
    z-index: -1;
    content: "";
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: white;
  }
`;

const Line = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  ion-label {
    min-width: 0;
    text-overflow: clip !important;
    overflow: hidden;
    white-space: nowrap;
  }
`;

interface AccountProps {
  editing: boolean;
  account: Credential;
  allowEdit: boolean;
}

export default function Account({ editing, account, allowEdit }: AccountProps) {
  const dispatch = useAppDispatch();
  const slidingRef = useRef<ItemSlidingCustomEvent["target"]>(null);

  function logout() {
    dispatch(logoutAccount(account.handle));
  }

  return (
    <IonItemSliding ref={slidingRef}>
      {allowEdit && (
        <IonItemOptions side="end" onIonSwipe={logout}>
          <IonItemOption color="danger" expandable onClick={logout}>
            Log out
          </IonItemOption>
        </IonItemOptions>
      )}
      <IonItem>
        {editing && (
          <IonButton
            color="none"
            slot="start"
            onClick={() => {
              slidingRef.current?.open("end");
            }}
          >
            <RemoveIcon icon={removeCircle} color="danger" slot="icon-only" />
          </IonButton>
        )}
        {editing ? (
          <Line>
            <IonLabel>{account.handle}</IonLabel>
            <IonReorder />
          </Line>
        ) : (
          <IonRadio value={account.handle}>{account.handle}</IonRadio>
        )}
      </IonItem>
    </IonItemSliding>
  );
}
