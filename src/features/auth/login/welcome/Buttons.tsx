import { IonButton, IonNavLink, IonSpinner } from "@ionic/react";
import { styled } from "@linaria/react";
import { useRef } from "react";

import PickLoginServer from "#/features/auth/login/login/PickLoginServer";
import PickJoinServer from "#/features/auth/login/pickJoinServer/PickJoinServer";
import useStartJoinFlow from "#/features/auth/login/pickJoinServer/useStartJoinFlow";
import { useAppSelector } from "#/store";

import LearnMore from "../LearnMore";

const TopSpacer = styled.div`
  flex: 10;
`;

const BottomSpacer = styled.div`
  flex: 7;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.5rem;
  margin: 2rem;

  margin-top: auto;
`;

const Or = styled.div`
  font-size: 0.8em;
  position: relative;

  display: flex;
  gap: 6px;

  margin: 6px 0 -6px;

  hr {
    flex: 1;
    background: var(--ion-color-medium);
    opacity: 0.6;
  }
`;

const ButtonLine = styled.div`
  display: flex;

  > * {
    flex: 1;
  }
`;

export default function Buttons() {
  const loadingJoin = useAppSelector((state) => state.join.loading);
  const ref = useRef<HTMLDivElement>(null);
  const startJoinFlow = useStartJoinFlow(ref);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  return (
    <>
      <TopSpacer />
      <Container ref={ref}>
        <IonButton
          expand="block"
          onClick={() => startJoinFlow(connectedInstance)}
          disabled={loadingJoin}
        >
          {loadingJoin ? <IonSpinner /> : `Join ${connectedInstance}`}
        </IonButton>
        <IonNavLink component={() => <PickJoinServer />}>
          <IonButton fill="outline" color="dark" expand="block">
            Pick another server
          </IonButton>
        </IonNavLink>
        <Or>
          <hr />
          OR
          <hr />
        </Or>

        <ButtonLine>
          <IonNavLink component={() => <LearnMore />}>
            <IonButton fill="clear" color="dark" expand="block">
              Learn More
            </IonButton>
          </IonNavLink>
          <IonNavLink component={() => <PickLoginServer />}>
            <IonButton fill="clear" color="dark" expand="block">
              Log In
            </IonButton>
          </IonNavLink>
        </ButtonLine>
      </Container>
      <BottomSpacer />
    </>
  );
}
