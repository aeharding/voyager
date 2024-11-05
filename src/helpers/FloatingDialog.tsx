import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { close } from "ionicons/icons";

const Container = styled.div`
  margin: 36px auto;
  background: var(--ion-background-color, #fff);
  border-radius: 16px;
  max-width: 320px;

  position: relative;
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;

  padding: 16px;
`;

const CloseButton = styled.button`
  border-radius: 50%;
  background: rgba(180, 180, 180, 0.2);

  appearance: none;
  padding: 5px;
  color: var(--ion-color-medium);

  display: flex;

  position: absolute;
  right: 8px;
  top: 8px;

  font-size: 1.3em;
`;

interface FloatingDialogProps extends React.PropsWithChildren {
  onDismiss: () => void;
}

export default function FloatingDialog({
  onDismiss,
  children,
}: FloatingDialogProps) {
  return (
    <Container>
      <CloseButton color="medium" onClick={() => onDismiss()}>
        <IonIcon icon={close} />
      </CloseButton>
      {children}
    </Container>
  );
}
