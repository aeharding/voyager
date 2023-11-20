import { IonIcon, IonList, IonPicker, IonText } from "@ionic/react";
import { css } from "@emotion/react";
import { InsetIonItem, SettingLabel } from "./Profile";
import styled from "@emotion/styled";
import IncognitoSvg from "./incognito.svg?react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useState } from "react";
import { updateConnectedInstance } from "../auth/authSlice";
import { swapHorizontalOutline } from "ionicons/icons";
import { getCustomServers } from "../../services/app";
import { without } from "lodash";

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
  const { connectedInstance } = useAppSelector((state) => state.auth);
  const [pickerOpen, setPickerOpen] = useState(false);

  // push the currently connected instance to
  // the top of the list in the picker
  const customServers = [
    connectedInstance,
    ...without(getCustomServers(), connectedInstance),
  ];

  return (
    <>
      <IonText color="medium">
        <p
          css={css`
            font-size: 0.875em;
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
            options: customServers.map((server) => ({
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
