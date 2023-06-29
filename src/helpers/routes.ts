import { useLocation } from "react-router";
import { useAppSelector } from "../store";

export function useBuildGeneralBrowseLink() {
  const location = useLocation();
  const connectedServer = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const tab = location.pathname.split("/")[1];

  return (path: string) => `/${tab}/${connectedServer}${path}`;
}
