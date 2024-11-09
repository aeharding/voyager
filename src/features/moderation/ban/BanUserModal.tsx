import { css } from "@linaria/core";

import { BanUserPayload } from "#/features/auth/PageContext";
import { DynamicDismissableModal } from "#/features/shared/DynamicDismissableModal";

import BanUser from "./BanUser";

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
