import styled from "@emotion/styled";
import { IonIcon, IonText } from "@ionic/react";
import { handLeftSharp } from "ionicons/icons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 3rem 3rem 4rem;
  align-items: center;
  justify-content: center;
`;

const Icon = styled(IonIcon)`
  opacity: 0.5;
  font-size: 2rem;
`;

interface EndPostProps {
  empty?: boolean;
  communityName?: string;
}

export default function EndPost({ empty, communityName }: EndPostProps) {
  const feedName = communityName ? `c/${communityName}` : "this feed";

  return (
    <Container>
      <Icon icon={handLeftSharp} color="medium" />
      <IonText color="medium">
        {empty ? (
          <>Nothing to see here — {feedName} is completely empty.</>
        ) : (
          <>There are no more posts in {feedName}.</>
        )}
      </IonText>
      <IonText color="primary">Would you like to write a post?</IonText>
    </Container>
  );
}
