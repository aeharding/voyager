import { DynamicDismissableModal } from "#/features/shared/DynamicDismissableModal";

import LoginNav from "./LoginNav";

import styles from "./LoginModal.module.css";

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LoginModal({
  isOpen,
  setIsOpen,
}: Readonly<LoginModalProps>) {
  return (
    <DynamicDismissableModal
      className={styles.modal}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <LoginNav />
    </DynamicDismissableModal>
  );
}
