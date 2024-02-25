import React from "react";
import { IonContent, IonTitle, IonToolbar } from "@ionic/react";
import BaseSvg from "./assets/base.svg?react";
import Buttons from "./Buttons";
import AndroidClose from "./AndroidClose";
import { styled } from "@linaria/react";
import AppHeader from "../../../shared/AppHeader";

// slot attribute not allowed for some reason??
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = any;

const StyledIonContent = styled(IonContent)`
  &::part(scroll) {
    z-index: 1;

    display: flex;
    flex-direction: column;
  }

  --background: linear-gradient(0deg, #bfd5ff, #e3edff 33%, #ffff);

  .theme-dark & {
    --background: linear-gradient(0deg, #001233ff, #000a1c 33%, #0000);
  }
`;

const StyledBaseSvg = styled(BaseSvg)`
  opacity: 0.4;
  margin: 0 -2rem;
  position: absolute;
  bottom: 0;

  pointer-events: none;

  filter: brightness(2.7);

  .theme-dark & {
    filter: none;
  }
` as AnyComponent;

export default function Welcome() {
  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonTitle>Welcome</IonTitle>

          <AndroidClose />
        </IonToolbar>
      </AppHeader>
      <StyledIonContent fullscreen>
        <AppHeader collapse="condense">
          <IonToolbar color=" ">
            <IonTitle size="large">Welcome.</IonTitle>
          </IonToolbar>
        </AppHeader>

        <StyledBaseSvg slot="fixed" />

        <Buttons />
      </StyledIonContent>
    </>
  );
}
