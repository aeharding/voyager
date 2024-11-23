import { DynamicDismissableModal } from "#/features/shared/DynamicDismissableModal";

import styles from "./LoginModal.module.css";
import LoginNav from "./LoginNav";

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
