import PostEditor from "./PostEditor";
import { useAppSelector } from "../../../store";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";
import { Community, PostView } from "lemmy-js-client";

interface PostEditorModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post?: PostView;
  community?: Community | string;
}

export default function PostEditorModal({
  isOpen,
  setIsOpen,
  post,
  community,
}: PostEditorModalProps) {
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      {({ setCanDismiss, dismiss }) => (
        <PostEditor
          setCanDismiss={setCanDismiss}
          dismiss={dismiss}
          community={
            typeof community === "string"
              ? communityByHandle[community]?.community
              : community
          }
          existingPost={post}
        />
      )}
    </DynamicDismissableModal>
  );
}
