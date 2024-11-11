import { Comment, CommentView, PrivateMessageView } from "lemmy-js-client";

import { DynamicDismissableModal } from "../../../DynamicDismissableModal";
import CommentEditPage from "./contents/CommentEditPage";
import CommentReplyPage, {
  CommentReplyItem,
} from "./contents/CommentReplyPage";
import PrivateMessagePage, {
  NewPrivateMessage,
} from "./contents/PrivateMessagePage";

interface Data<Type, Item, Result = Item> {
  type: Type;
  item: Item;
  onSubmit: (result: Result | undefined) => void;
}

export type MarkdownEditorData =
  | Data<"COMMENT_REPLY", CommentReplyItem>
  | Data<"COMMENT_EDIT", Comment, CommentView>
  | Data<"PRIVATE_MESSAGE", NewPrivateMessage, PrivateMessageView>;

type GenericMarkdownEditorModalProps = MarkdownEditorData & {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function GenericMarkdownEditorModal({
  type,
  item,
  isOpen,
  setIsOpen,
  onSubmit,
}: GenericMarkdownEditorModalProps) {
  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen} textRecovery>
      {({ setCanDismiss, dismiss }) => {
        switch (type) {
          case "COMMENT_REPLY": {
            return (
              <CommentReplyPage
                item={item}
                setCanDismiss={setCanDismiss}
                dismiss={(replied) => {
                  dismiss();
                  onSubmit(replied);
                }}
              />
            );
          }
          case "COMMENT_EDIT": {
            return (
              <CommentEditPage
                item={item}
                setCanDismiss={setCanDismiss}
                dismiss={(replied) => {
                  dismiss();
                  onSubmit(replied);
                }}
              />
            );
          }
          case "PRIVATE_MESSAGE": {
            return (
              <PrivateMessagePage
                item={item}
                setCanDismiss={setCanDismiss}
                dismiss={(replied) => {
                  dismiss();
                  onSubmit(replied);
                }}
              />
            );
          }
        }
      }}
    </DynamicDismissableModal>
  );
}
