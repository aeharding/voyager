import { IonButton, IonText } from "@ionic/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import IncognitoSvg from "./incognito.svg?react";
import { useAppSelector } from "../../store";
import { PageContext } from "../auth/PageContext";
import { useContext } from "react";
import { profilesEmptySelector } from "../auth/authSelectors";

const Incognito = styled(IncognitoSvg)`
  opacity: 0.1;
  width: 300px;
  height: 300px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

export default function LoggedOut() {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const profilesEmpty = useAppSelector(profilesEmptySelector);

  const { presentLoginIfNeeded, presentAccountSwitcher } =
    useContext(PageContext);

  return (
    <>
      <IonText color="medium">
        <p
          className="ion-padding"
          css={css`
            font-size: 0.875em;
          `}
        >
          You are browsing <strong>{connectedInstance}</strong> as a guest. Log
          in to vote, comment and post!
        </p>
      </IonText>
      <IonButton
        className="ion-padding-start ion-padding-end"
        expand="block"
        onClick={() => {
          presentLoginIfNeeded();
        }}
      >
        {profilesEmpty ? "Get Started" : "Log In"}
      </IonButton>
      {!profilesEmpty && (
        <IonButton
          className="ion-padding-start ion-padding-end"
          expand="block"
          fill="clear"
          onClick={() => {
            presentAccountSwitcher();
          }}
        >
          Switch Accounts
        </IonButton>
      )}
      <Incognito />
    </>
  );
}
