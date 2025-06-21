import useIsLinkSelected from "./useIsLinkSelected";

export default function useActivatedClass(routerLink: string) {
  const isActivated = useIsLinkSelected(routerLink);

  if (isActivated) return "app-activated";
}
