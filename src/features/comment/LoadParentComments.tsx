import { CustomIonItem } from "./Comment";
import CommentHr from "./CommentHr";
import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { chevronUp } from "ionicons/icons";
import React from "react";
import { PositionedContainer } from "./elements/PositionedContainer";
import { Container } from "./elements/Container";

const MoreRepliesBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  color: var(--ion-color-primary);
`;

const ChevronIcon = styled(IonIcon)`
  font-size: 1rem;
`;

interface LoadParentCommentsProps {
  setMaxContext: React.Dispatch<React.SetStateAction<number>>;
}

export default function LoadParentComments({
  setMaxContext,
}: LoadParentCommentsProps) {
  return (
    <>
      <CustomIonItem
        onClick={() => {
          setMaxContext((maxContext) => maxContext - 5);
        }}
      >
        <PositionedContainer depth={0}>
          <Container depth={0}>
            <MoreRepliesBlock>
              <ChevronIcon icon={chevronUp} />
              Load parent comments...
            </MoreRepliesBlock>
          </Container>
        </PositionedContainer>
      </CustomIonItem>
      <CommentHr depth={1} />
    </>
  );
}
