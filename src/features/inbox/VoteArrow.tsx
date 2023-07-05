import styled from "@emotion/styled";
import { arrowDown, arrowUp } from "ionicons/icons";
import { IonIcon } from "@ionic/react";

const Container = styled.div`
  font-size: 1.4em;

  width: 100%;
  height: 1rem;

  position: relative;
`;

const VoteIcon = styled(IonIcon)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

interface VoteArrowProps {
  vote: 1 | 0 | -1 | undefined;
}

export default function VoteArrow({ vote }: VoteArrowProps) {
  if (!vote) return null;

  if (vote === 1)
    return (
      <Container>
        <VoteIcon icon={arrowUp} color="primary" />
      </Container>
    );
  if (vote === -1)
    return (
      <Container>
        <VoteIcon icon={arrowDown} color="danger" />
      </Container>
    );
}
