import CommentReply, { CommentReplyItem } from "./CommentReply";
import React from "react";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";

interface CommentReplyModalProps {
  item: CommentReplyItem;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onReply: (replied: boolean) => void;
}

export default function CommentReplyModal({
  item,
  isOpen,
  setIsOpen,
  onReply,
}: CommentReplyModalProps) {
  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      {({ setCanDismiss, dismiss }) => (
        <CommentReply
          item={item}
          setCanDismiss={setCanDismiss}
          dismiss={(replied) => {
            dismiss();
            onReply(replied);
          }}
        />
      )}
    </DynamicDismissableModal>
  );
}
