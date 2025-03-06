import { useIonRouter, UseIonRouterResult } from "@ionic/react";
import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

type OptimizedRouterRef =
  | MutableRefObject<UseIonRouterResult | undefined>
  | undefined;

interface IOptimizedRouterContext {
  // used for determining whether page needs to be scrolled up first
  routerRef: OptimizedRouterRef;
}

const OptimizedRouterContext = createContext<IOptimizedRouterContext>({
  routerRef: undefined,
});

export function useOptimizedIonRouter() {
  const context = useContext(OptimizedRouterContext);

  return useMemo(
    () => ({
      push: (...args: Parameters<UseIonRouterResult["push"]>) =>
        context.routerRef?.current?.push(...args),
      goBack: (...args: Parameters<UseIonRouterResult["goBack"]>) =>
        context.routerRef?.current?.goBack(...args),
      canGoBack: (...args: Parameters<UseIonRouterResult["canGoBack"]>) =>
        context.routerRef?.current?.canGoBack(...args),
      getRouteInfo: () => context.routerRef?.current?.routeInfo,
    }),
    [context.routerRef],
  );
}

export function OptimizedRouterProvider({ children }: React.PropsWithChildren) {
  const router = useIonRouter();
  const routerRef = useRef<UseIonRouterResult>(undefined);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const value = useMemo(() => ({ routerRef }), []);

  return (
    <OptimizedRouterContext value={value}>{children}</OptimizedRouterContext>
  );
}
