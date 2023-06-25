import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonRadio,
  ItemSlidingCustomEvent,
} from "@ionic/react";
import { removeCircle } from "ionicons/icons";
import { Credential, logoutAccount } from "./authSlice";
import { useAppDispatch } from "../../store";
import { useRef } from "react";
import styled from "@emotion/styled";

const RemoveIcon = styled(IonIcon)`
  position: relative;
  font-size: 1.5rem;

  &:after {
    z-index: -1;
    content: "";
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: white;
  }
`;

interface AccountProps {
  editing: boolean;
  account: Credential;
}

export default function Account({ editing, account }: AccountProps) {
  const dispatch = useAppDispatch();
  const slidingRef = useRef<ItemSlidingCustomEvent["target"]>(null);

  return (
    <IonItemSliding ref={slidingRef}>
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
        {editing && (
          <IonButton
            color="none"
            slot="start"
            onClick={() => {
              slidingRef.current?.open("end");
            }}
          >
            <RemoveIcon icon={removeCircle} color="danger" />
          </IonButton>
        )}
        <IonRadio value={account.handle}>{account.handle}</IonRadio>
      </IonItem>
    </IonItemSliding>
  );
}
