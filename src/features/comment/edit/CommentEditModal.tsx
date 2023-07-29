import React from "react";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import CommentEdit from "./CommentEdit";
import { Comment } from "lemmy-js-client";

interface CommentEditModalProps {
  /**
   * Comment to be edited
   */
  item: Comment;

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
