import React from "react";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { CommentView } from "lemmy-js-client";
import CommentEdit from "./CommentEdit";

interface CommentEditModalProps {
  /**
   * Comment to be edited
   */
  item: CommentView;

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CommentEditModal({
  item,
  isOpen,
  setIsOpen,
}: CommentEditModalProps) {
  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      {({ setCanDismiss, dismiss }) => (
        <CommentEdit
          item={item}
          setCanDismiss={setCanDismiss}
          dismiss={() => dismiss()}
        />
      )}
    </DynamicDismissableModal>
  );
}
