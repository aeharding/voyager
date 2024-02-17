import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { lockClosed } from "ionicons/icons";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  margin-top: 8px;
  padding-top: 8px;
  margin-bottom: -8px;

  border-top: 1px solid
    var(
      --ion-item-border-color,
      var(--ion-border-color, var(--ion-color-step-250, #c8c7cc))
    );
`;

const LockIcon = styled(IonIcon)`
  font-size: 32px;
  margin-left: 8px;
`;

const Description = styled.div`
  font-size: 0.8725rem;
  font-weight: 500;
  color: var(--ion-color-medium);

  aside {
    font-size: 0.8125rem;
    font-weight: normal;
    opacity: 0.8;
  }
`;

export default function Locked() {
  return (
    <Container>
      <LockIcon icon={lockClosed} color="success" />
      <Description>
        <div>Post Locked</div>
        <aside>Moderators have turned off new comments.</aside>
      </Description>
    </Container>
  );
}
