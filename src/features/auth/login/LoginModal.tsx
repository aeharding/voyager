import React from "react";
import LoginNav from "./LoginNav";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { styled } from "@linaria/react";

const StyledDynamicDismissableModal = styled(DynamicDismissableModal)`
  --max-width: 500px;

  @media (min-width: 600px) {
    --max-height: 750px;
  }
`;

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LoginModal({
  isOpen,
  setIsOpen,
}: Readonly<LoginModalProps>) {
  return (
    <StyledDynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <LoginNav />
    </StyledDynamicDismissableModal>
  );
}
