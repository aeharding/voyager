import { getPathForFeed } from "../../../TabbedRoutes";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useAppSelector } from "../../../store";
import InitialPageRedirectBootstrapper from "./InitialPageRedirectBootstrapper";

export default function CommunitiesListRedirectBootstrapper() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );

  const baseRoute = defaultFeed ? getPathForFeed(defaultFeed) : undefined;

  return (
    <InitialPageRedirectBootstrapper
      to={baseRoute ? buildGeneralBrowseLink(baseRoute) : undefined}
    />
  );
}
