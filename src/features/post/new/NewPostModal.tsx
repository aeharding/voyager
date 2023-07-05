import NewPost from "./NewPost";
import { useAppSelector } from "../../../store";
import React, { useCallback, useState } from "react";
import { createContext } from "react";
import { DynamicDismissableModal } from "../../shared/DynamicDismissableModal";

interface INewPostContext {
  presentNewPost: () => void;
}

export const NewPostContext = createContext<INewPostContext>({
  presentNewPost: () => {},
});

interface NewPostContextProviderProps {
  children: React.ReactNode;
  community: string;
}

export function NewPostContextProvider({
  children,
  community,
}: NewPostContextProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const presentNewPost = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <NewPostContext.Provider value={{ presentNewPost }}>
      <NewPostModal
        community={community}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      {children}
    </NewPostContext.Provider>
  );
}

interface NewPostModalProps {
  community: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function NewPostModal({ community, isOpen, setIsOpen }: NewPostModalProps) {
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  return (
    <DynamicDismissableModal isOpen={isOpen} setIsOpen={setIsOpen}>
      {({ setCanDismiss, dismiss }) => (
        <NewPost
          community={communityByHandle[community]}
          setCanDismiss={setCanDismiss}
          dismiss={dismiss}
        />
      )}
    </DynamicDismissableModal>
  );
}
