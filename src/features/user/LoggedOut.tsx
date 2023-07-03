import { IonIcon, IonList, IonPicker, IonText } from "@ionic/react";
import { css } from "@emotion/react";
import { InsetIonItem, SettingLabel } from "./Profile";
import styled from "@emotion/styled";
import { ReactComponent as IncognitoSvg } from "./incognito.svg";
import { useAppDispatch, useAppSelector } from "../../store";
import { useState } from "react";
import { updateConnectedInstance } from "../auth/authSlice";
import { swapHorizontalOutline } from "ionicons/icons";
import { LEMMY_SERVERS } from "../../helpers/lemmy";

const Incognito = styled(IncognitoSvg)`
  opacity: 0.1;
  width: 300px;
  height: 300px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

export default function LoggedOut() {
  const dispatch = useAppDispatch();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <IonText color="medium">
        <p
          css={css`
            font-size: 0.9em;
            padding: 1rem;
          `}
        >
          Change the instance you&apos;re currently connected to below.
          Alternatively, click <strong>login</strong> to join your instance with
          your account.
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
    </>
  );
}
