import styled from "@emotion/styled";
import { useAppSelector } from "../../../../store";
import { useRef } from "react";
import { IonButton, IonNavLink, IonSpinner } from "@ionic/react";
import PickJoinServer from "../pickJoinServer/PickJoinServer";
import LearnMore from "../LearnMore";
import PickLoginServer from "../login/PickLoginServer";
import useStartJoinFlow from "../pickJoinServer/useStartJoinFlow";
import { getDefaultServer } from "../../../../services/app";

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

  /* position: absolute;
  left: 0;
  right: 0;
  bottom: 25vh; */
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

  return (
    <>
      <TopSpacer />
      <Container ref={ref}>
        <IonButton
          expand="block"
          onClick={() => startJoinFlow(getDefaultServer())}
          disabled={loadingJoin}
        >
          {loadingJoin ? <IonSpinner /> : `Join ${getDefaultServer()}`}
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
