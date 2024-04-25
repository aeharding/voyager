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
  IonText,
  ItemSlidingCustomEvent,
} from "@ionic/react";
import { removeCircle } from "ionicons/icons";
import { Credential, logoutAccount } from "./authSlice";
import { useAppDispatch } from "../../store";
import { useRef } from "react";
import { styled } from "@linaria/react";

const RemoveIcon = styled(IonIcon)`
  position: relative;
  font-size: 1.6rem;

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
  allowEdit: boolean;
}

export default function Account({ editing, account, allowEdit }: AccountProps) {
  const dispatch = useAppDispatch();
  const slidingRef = useRef<ItemSlidingCustomEvent["target"]>(null);

  function logout() {
    dispatch(logoutAccount(account.handle));
  }

  const isGuest = !account.jwt;

  const label = (
    <>
      {account.handle} {isGuest && <IonText color="medium">(guest)</IonText>}
    </>
  );

  return (
    <IonItemSliding ref={slidingRef}>
      {allowEdit && (
        <IonItemOptions side="end" onIonSwipe={logout}>
          <IonItemOption color="danger" expandable onClick={logout}>
            {isGuest ? "Remove" : "Log out"}
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
          <>
            <IonLabel className="ion-text-nowrap">{label}</IonLabel>
            <IonReorder slot="end" />
          </>
        ) : (
          <IonRadio value={account.handle}>{label}</IonRadio>
        )}
      </IonItem>
    </IonItemSliding>
  );
}
