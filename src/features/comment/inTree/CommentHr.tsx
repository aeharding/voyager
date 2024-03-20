import { styled } from "@linaria/react";
import { maxWidthCss } from "../../shared/AppContent";

const HrContainer = styled.div<{ depth: number }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  ${maxWidthCss}
  z-index: 100;

  padding-left: calc(0.5rem + calc(calc(${({ depth }) => depth} - 1) * 10px));
`;

const Hr = styled.hr`
  flex: 1;
  height: 1px;
  background-color: var(
    --ion-item-border-color,
    var(--ion-border-color, var(--ion-background-color-step-250, #c8c7cc))
  );
  width: 100%;
  margin: 0;
`;

interface CommentHrProps {
  depth: number;
}

export default function CommentHr({ depth }: CommentHrProps) {
  return (
    <HrContainer depth={depth}>
      <Hr />
    </HrContainer>
  );
}
