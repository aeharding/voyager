import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { BanUserPayload } from "../../auth/PageContext";
import BanUser from "./BanUser";
import { css } from "@linaria/core";

const modPrimaryStyle = css`
  --ion-color-primary: var(--ion-color-success);
`;

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
      className={modPrimaryStyle}
      dismissClassName="mod"
    >
      {({ setCanDismiss, dismiss }) => (
        <BanUser item={item} setCanDismiss={setCanDismiss} dismiss={dismiss} />
      )}
    </DynamicDismissableModal>
  );
}
