import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonContent } from "@ionic/react";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <IonContent style={{ width: "100%" }}>
      <MaxWidthContainer>{children}</MaxWidthContainer>
    </IonContent>
  );
}
