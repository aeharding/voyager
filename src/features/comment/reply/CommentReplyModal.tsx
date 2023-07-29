import CommentReply, { CommentReplyItem } from "./CommentReply";
import React from "react";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { CommentView } from "lemmy-js-client";

interface CommentReplyModalProps {
  item: CommentReplyItem;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onReply: (reply: CommentView | undefined) => void;
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
