import { getPathForFeed } from "../../../TabbedRoutes";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { DefaultFeedType, ODefaultFeedType } from "../../../services/db";
import { useAppSelector } from "../../../store";
import { loggedInSelector } from "../../auth/authSelectors";
import InitialPageRedirectBootstrapper from "./InitialPageRedirectBootstrapper";

export default function CommunitiesListRedirectBootstrapper() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const loggedIn = useAppSelector(loggedInSelector);
  const baseRoute = getBaseRoute(loggedIn, defaultFeed);

  return (
    <InitialPageRedirectBootstrapper to={buildGeneralBrowseLink(baseRoute)} />
  );
}

export function getBaseRoute(
  loggedIn: boolean,
  defaultFeed: DefaultFeedType | undefined,
): string {
  return getPathForFeed(
    defaultFeed || {
      type: loggedIn ? ODefaultFeedType.Home : ODefaultFeedType.All,
    },
  );
}
