import { IonBadge, IonRefresher, IonRefresherContent } from "@ionic/react";

import { getSite, lemmyVersionSelector } from "#/features/auth/siteSlice";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { useAppDispatch, useAppSelector } from "#/store";

import GenericSidebar from "./GenericSidebar";

export default function InstanceSidebar() {
  const dispatch = useAppDispatch();
  const siteView = useAppSelector((state) => state.site.response?.site_view);
  const admins = useAppSelector((state) => state.site.response?.admins);
  const lemmyVersion = useAppSelector(lemmyVersionSelector);

  if (!siteView || !admins) return <CenteredSpinner />;

  const { site, counts } = siteView;

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={async (e) => {
          try {
            await dispatch(getSite());
          } finally {
            e.detail.complete();
          }
        }}
      >
        <IonRefresherContent />
      </IonRefresher>

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
    </>
  );
}
