import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { getPathForFeed } from "#/routes/TabbedRoutes";
import { useAppSelector } from "#/store";

import InitialPageRedirectBootstrapper from "./InitialPageRedirectBootstrapper";

export default function CommunitiesListRedirectBootstrapper() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );

  const baseRoute = defaultFeed ? getPathForFeed(defaultFeed) : undefined;

  return (
    <InitialPageRedirectBootstrapper
      to={baseRoute != null ? buildGeneralBrowseLink(baseRoute) : undefined}
    />
  );
}
