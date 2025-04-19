// eslint-disable-next-line no-restricted-imports
import { IonPage } from "@ionic/react";
import { createContext, RefObject, use, useRef } from "react";
import { VListHandle } from "virtua";

export function AppPage(props: React.ComponentProps<typeof IonPage>) {
  const virtuaRef = useRef<VListHandle>(null);
  const pageRef = useRef<HTMLElement>(null);

  return (
    <PageRefContext value={{ pageRef, virtuaRef }}>
      <IonPage ref={pageRef} {...props} />
    </PageRefContext>
  );
}

export function useAppPageRef() {
  return use(PageRefContext)?.pageRef;
}

export function useAppPageVListHandleRef() {
  return use(PageRefContext)?.virtuaRef;
}

const PageRefContext = createContext<
  | {
      pageRef: RefObject<HTMLElement | null>;
      virtuaRef: RefObject<VListHandle | null>;
    }
  | undefined
>(undefined);
