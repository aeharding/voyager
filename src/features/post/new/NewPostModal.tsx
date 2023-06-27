import { IonModal, useIonActionSheet } from "@ionic/react";
import NewPost from "./NewPost";
import { useAppSelector } from "../../../store";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createContext } from "react";
import { PageContext } from "../../auth/PageContext";

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
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
}

function NewPostModal({ community, setIsOpen, isOpen }: NewPostModalProps) {
  const pageContext = useContext(PageContext);

  const [canDismiss, setCanDismiss] = useState(true);
  const canDismissRef = useRef(canDismiss);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const [presentActionSheet] = useIonActionSheet();

  const onDismissAttemptCb = useCallback(async () => {
    await presentActionSheet([
      {
        text: "Delete",
        role: "destructive",
        handler: () => {
          setCanDismiss(true);
          setTimeout(() => setIsOpen(false), 100);
        },
      },
      {
        text: "Cancel",
        role: "cancel",
      },
    ]);

    return false;
  }, [presentActionSheet, setIsOpen]);

  useEffect(() => {
    // ಠ_ಠ
    canDismissRef.current = canDismiss;
  }, [canDismiss]);

  return (
    <IonModal
      isOpen={isOpen}
      canDismiss={canDismiss ? canDismiss : onDismissAttemptCb}
      onDidDismiss={() => setIsOpen(false)}
      presentingElement={pageContext.page}
    >
      <NewPost
        setCanDismiss={setCanDismiss}
        community={communityByHandle[community]}
        dismiss={() => {
          if (canDismissRef.current) {
            setIsOpen(false);
            return;
          }

          onDismissAttemptCb();
        }}
      />
    </IonModal>
  );
}
