import { BanUserPayload } from "#/features/auth/PageContext";
import { DynamicDismissableModal } from "#/features/shared/DynamicDismissableModal";

import BanUser from "./BanUser";

import styles from "./BanUserModal.module.css";

interface BanUserModalProps {
  item: BanUserPayload;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function BanUserModal({
  item,
  isOpen,
  setIsOpen,
}: BanUserModalProps) {
  return (
    <DynamicDismissableModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className={styles.modPrimaryColor}
      dismissClassName="mod"
    >
      {({ setCanDismiss, dismiss }) => (
        <BanUser item={item} setCanDismiss={setCanDismiss} dismiss={dismiss} />
      )}
    </DynamicDismissableModal>
  );
}
