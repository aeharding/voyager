import { useAppSelector } from "../../store";
import { jwtIssSelector } from "../auth/authSlice";
import InitialPageRedirectBootstrapper from "../community/list/InitialPageRedirectBootstrapper";

export default function BoxesRedirectBootstrapper() {
  const iss = useAppSelector(jwtIssSelector);

  return <InitialPageRedirectBootstrapper to={iss ? "/inbox/all" : ""} />;
}
