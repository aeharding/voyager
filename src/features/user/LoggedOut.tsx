import { IonButton, IonText } from "@ionic/react";
import IncognitoSvg from "./incognito.svg?react";
import { useAppSelector } from "../../store";
import { PageContext } from "../auth/PageContext";
import { useContext } from "react";
import { accountsListEmptySelector } from "../auth/authSelectors";
import AppContent from "../shared/AppContent";
import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";

const StyledAppContent = styled(AppContent)`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Incognito = styled(IncognitoSvg)`
  opacity: 0.1;
  width: 300px;
  height: 300px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  flex-shrink: 0;
`;

export default function LoggedOut() {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const accountsListEmpty = useAppSelector(accountsListEmptySelector);

  const { presentLoginIfNeeded, presentAccountSwitcher } =
    useContext(PageContext);

  return (
    <StyledAppContent>
      <div>
        <IonText color="medium">
          <p
            className={cx(
              "ion-padding",
              css`
                font-size: 0.875em;
              `,
            )}
          >
            You are browsing <strong>{connectedInstance}</strong> as a guest.
            Log in to vote, comment and post!
          </p>
        </IonText>
        <IonButton
          className="ion-padding-start ion-padding-end"
          expand="block"
          onClick={() => {
            presentLoginIfNeeded();
          }}
        >
          {accountsListEmpty ? "Get Started" : "Log In"}
        </IonButton>
        {!accountsListEmpty && (
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
      </div>
      <Incognito />
    </StyledAppContent>
  );
}
