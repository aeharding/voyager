import { VListHandle } from "virtua";

import { useAppPageRef, useAppPageVListHandleRef } from "./AppPage";

export type AppScrollable = VListHandle | HTMLElement | null;

export default function useGetAppScrollable() {
  const virtuaHandleRef = useAppPageVListHandleRef();
  const appPageRef = useAppPageRef();

  return function getAppScrollable(): AppScrollable {
    if (virtuaHandleRef) return virtuaHandleRef.current;
    if (appPageRef) return appPageRef.current;

    return null;
  };
}
