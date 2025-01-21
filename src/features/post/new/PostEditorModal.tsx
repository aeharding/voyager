import { PostView } from "lemmy-js-client";

import { DynamicDismissableModal } from "#/features/shared/DynamicDismissableModal";
import { useAppSelector } from "#/store";

import PostEditor from "./PostEditor";

interface PostEditorModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  postOrCommunity: PostView | string;
}

export default function PostEditorModal({
  isOpen,
  setIsOpen,
  postOrCommunity,
}: PostEditorModalProps) {
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  const editOrCreateProps =
    typeof postOrCommunity === "string"
      ? {
          community: communityByHandle[postOrCommunity.toLowerCase()],
        }
      : {
          existingPost: postOrCommunity,
        };

  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen} textRecovery>
      {({ setCanDismiss, dismiss }) => (
        <PostEditor
          setCanDismiss={setCanDismiss}
          dismiss={dismiss}
          {...editOrCreateProps}
        />
      )}
    </DynamicDismissableModal>
  );
}
