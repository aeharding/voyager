import styled from "@emotion/styled";
import { IonText } from "@ionic/react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 3rem 3rem 4rem;
  font-size: 0.875em;
  align-items: center;
  justify-content: center;
`;

interface EndPostProps {
  empty?: boolean;
  communityName?: string;
}

export default function EndPost({ empty, communityName }: EndPostProps) {
  const feedName = communityName ? `c/${communityName}` : "this feed";

  return (
    <Container>
      <IonText color="medium">
        {empty ? (
          <>Nothing to see here — {feedName} is completely empty.</>
        ) : (
          <>You&apos;ve reached the end!</>
        )}
      </IonText>
    </Container>
  );
}
