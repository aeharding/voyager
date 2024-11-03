import { loggedInSelector } from "#/features/auth/authSelectors";
import InitialPageRedirectBootstrapper from "#/features/community/list/InitialPageRedirectBootstrapper";
import { useAppSelector } from "#/store";

export default function BoxesRedirectBootstrapper() {
  const loggedIn = useAppSelector(loggedInSelector);

  if (!loggedIn) return;

  return <InitialPageRedirectBootstrapper to="/inbox/all" />;
}
