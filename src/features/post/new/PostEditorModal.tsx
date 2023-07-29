import PostEditor from "./PostEditor";
import { useAppSelector } from "../../../store";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { PostView } from "lemmy-js-client";

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
    (state) => state.community.communityByHandle
  );

  const editOrCreateProps =
    typeof postOrCommunity === "string"
      ? {
          community: communityByHandle[postOrCommunity],
        }
      : {
          existingPost: postOrCommunity,
        };

  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
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
