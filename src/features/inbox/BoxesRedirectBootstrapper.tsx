import { useAppSelector } from "../../store";
import { loggedInSelector } from "../auth/authSelectors";
import InitialPageRedirectBootstrapper from "../community/list/InitialPageRedirectBootstrapper";

export default function BoxesRedirectBootstrapper() {
  const loggedIn = useAppSelector(loggedInSelector);

  if (!loggedIn) return;

  return <InitialPageRedirectBootstrapper to="/inbox/all" />;
}
