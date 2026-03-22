import { ComponentProps } from "react";

import { DynamicDismissableModal } from "#/features/shared/DynamicDismissableModal";

import LoginNav from "./LoginNav";

import styles from "./LoginModal.module.css";

interface LoginModalProps extends Pick<
  ComponentProps<typeof LoginNav>,
  "initialAccountHandle"
> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LoginModal({
  isOpen,
  setIsOpen,
  initialAccountHandle,
}: Readonly<LoginModalProps>) {
  return (
    <DynamicDismissableModal
      className={styles.modal}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <LoginNav initialAccountHandle={initialAccountHandle} />
    </DynamicDismissableModal>
  );
}
