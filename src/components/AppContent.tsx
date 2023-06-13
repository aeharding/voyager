import styled from "@emotion/styled";
import { IonContent } from "@ionic/react";

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IonContent style={{ width: "100%" }}>
      <Container>{children}</Container>
    </IonContent>
  );
}
