import { useAppSelector } from "../../store";
import { jwtIssSelector } from "../auth/authSelectors";
import InitialPageRedirectBootstrapper from "../community/list/InitialPageRedirectBootstrapper";

export default function BoxesRedirectBootstrapper() {
  const iss = useAppSelector(jwtIssSelector);

  if (!iss) return;

  return <InitialPageRedirectBootstrapper to="/inbox/all" />;
}
