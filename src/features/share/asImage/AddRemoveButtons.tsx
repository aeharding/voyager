import styled from "@emotion/styled";
import { IonButton, IonIcon } from "@ionic/react";
import { addOutline, removeOutline } from "ionicons/icons";

const Button = styled(IonButton)`
  --padding-start: 5px;
  --padding-end: 5px;
  --height: 20px;

  color: inherit;
`;

const Container = styled.div`
  display: inline-flex;

  background: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.088);
  border-radius: 6px;
`;

interface AddRemoveButtonsProps {
  onAdd: () => void;
  onRemove: () => void;
  addDisabled?: boolean;
  removeDisabled?: boolean;
}

export default function AddRemoveButtons({
  onAdd,
  onRemove,
  addDisabled,
  removeDisabled,
}: AddRemoveButtonsProps) {
  return (
    <Container>
      <Button onClick={onRemove} disabled={removeDisabled} color=" ">
        <IonIcon icon={removeOutline} />
      </Button>
      <Button onClick={onAdd} disabled={addDisabled} color=" ">
        <IonIcon icon={addOutline} />
      </Button>
    </Container>
  );
}
