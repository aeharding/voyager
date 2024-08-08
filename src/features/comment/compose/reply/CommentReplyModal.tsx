import CommentReply, { CommentReplyItem } from "./CommentReply";
import React from "react";
import { DynamicDismissableModal } from "../../../shared/DynamicDismissableModal";
import { CommentView, PrivateMessageView } from "lemmy-js-client";

interface CommentReplyModalProps {
  item: CommentReplyItem;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onReply: (reply: CommentView | PrivateMessageView | undefined) => void;
}

export default function CommentReplyModal({
  item,
  isOpen,
  setIsOpen,
  onReply,
}: CommentReplyModalProps) {
  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen} textRecovery>
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
