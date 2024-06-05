import { useAppSelector } from "../../../store";
import GenericSidebar from "./GenericSidebar";
import { IonBadge } from "@ionic/react";
import { lemmyVersionSelector } from "../../auth/siteSlice";
import { CenteredSpinner } from "../../../routes/pages/posts/PostPage";

export default function InstanceSidebar() {
  const siteView = useAppSelector((state) => state.site.response?.site_view);
  const admins = useAppSelector((state) => state.site.response?.admins);
  const lemmyVersion = useAppSelector(lemmyVersionSelector);

  if (!siteView || !admins) return <CenteredSpinner />;

  const { site, counts } = siteView;

  return (
    <GenericSidebar
      type="instance"
      sidebar={site.sidebar ?? site.description ?? ""}
      people={admins.map((a) => a.person)}
      counts={counts}
      extraBadges={<IonBadge color="dark">v{lemmyVersion}</IonBadge>}
      banner={site.banner}
      name={site.actor_id}
      id={site.actor_id}
    />
  );
}
