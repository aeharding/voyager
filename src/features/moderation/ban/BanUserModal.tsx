import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { BanUserPayload } from "../../auth/PageContext";
import BanUser from "./BanUser";

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
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      {({ setCanDismiss, dismiss }) => (
        <BanUser item={item} setCanDismiss={setCanDismiss} dismiss={dismiss} />
      )}
    </DynamicDismissableModal>
  );
}
