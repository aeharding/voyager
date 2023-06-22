import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonContent } from "@ionic/react";
import React from "react";

export const maxWidthCss = css`
  width: 100%;
  max-width: 700px;
  margin-right: auto;
  margin-left: auto;
`;

export const MaxWidthContainer = styled.div`
  ${maxWidthCss}
`;

export default function AppContent({
  children,
  scrollY,
}: {
  children: React.ReactNode;
  scrollY?: boolean;
}) {
  return (
    <IonContent style={{ width: "100%" }} scrollY={scrollY ?? false}>
      <MaxWidthContainer>{children}</MaxWidthContainer>
    </IonContent>
  );
}
