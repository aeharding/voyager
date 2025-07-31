// eslint-disable-next-line no-restricted-imports
import { IonPage } from "@ionic/react";
import { useMergedRef } from "@mantine/hooks";
import { createContext, RefObject, use, useRef } from "react";
import { VListHandle } from "virtua";

import useIsPageHidden from "#/routes/twoColumn/useIsPageHidden";

import { cx } from "./css";

export function AppPage({
  ref,
  ...props
}: React.ComponentProps<typeof IonPage>) {
  const virtuaRef = useRef<VListHandle>(null);
  const pageRef = useRef<HTMLElement>(null);
  const isHidden = useIsPageHidden();

  return (
    <PageRefContext value={{ pageRef, virtuaRef }}>
      <IonPage
        {...props}
        ref={useMergedRef(pageRef, ref)}
        className={cx(props.className, isHidden && "ion-hide")}
      />
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
