import React from "react";
import LoginNav from "./LoginNav";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LoginModal({ isOpen, setIsOpen }: LoginModalProps) {
  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <LoginNav />
    </DynamicDismissableModal>
  );
}
