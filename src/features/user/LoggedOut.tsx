import { IonButton, IonText } from "@ionic/react";
import { css, cx } from "@linaria/core";
import { styled } from "@linaria/react";
import { useContext } from "react";

import { accountsListEmptySelector } from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import AppContent from "#/features/shared/AppContent";
import emptyStateIconStyles from "#/routes/pages/shared/emptyStateIconStyles";
import { useAppSelector } from "#/store";

import IncognitoSvg from "./incognito.svg?react";

const StyledAppContent = styled(AppContent)`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
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
      <IncognitoSvg className={emptyStateIconStyles} />
    </StyledAppContent>
  );
}
