import React from "react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import BaseSvg from "./assets/base.svg?react";
import Stars from "./Stars";
import Buttons from "./Buttons";

// slot attribute not allowed for some reason??
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = any;

const StyledBaseSvg = styled(BaseSvg)`
  opacity: 0.4;
  margin: 0 -2rem;
  position: absolute;
  bottom: 0;

  pointer-events: none;
` as AnyComponent;

const StyledStars = styled(Stars)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  z-index: -1;

  opacity: 0.4;
`;

export default function Welcome() {
  return (
    <>
      <StyledStars slot="fixed" />

      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        css={css`
          --background: linear-gradient(0deg, #001233ff, #000a1c 33%, #0000);
        `}
      >
        <IonHeader collapse="condense">
          <IonToolbar color=" ">
            <IonTitle size="large">Welcome.</IonTitle>
          </IonToolbar>
        </IonHeader>

        <StyledBaseSvg slot="fixed" />

        <Buttons />
      </IonContent>
    </>
  );
}
