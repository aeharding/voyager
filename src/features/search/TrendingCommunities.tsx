import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
} from "@ionic/react";
import { css } from "@linaria/core";
import { trendingUp } from "ionicons/icons";
import { useEffect } from "react";

import { getTrendingCommunities } from "#/features/community/communitySlice";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useAppDispatch, useAppSelector } from "#/store";

export default function TrendingCommunities() {
  const dispatch = useAppDispatch();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const trendingCommunities = useAppSelector(
    (state) => state.community.trendingCommunities,
  );

  useEffect(() => {
    if (trendingCommunities === undefined) dispatch(getTrendingCommunities());
  }, [dispatch, trendingCommunities]);

  return (
    <IonList inset color="primary">
      <IonListHeader>
        <IonLabel
          className={css`
            margin-top: 0;
          `}
        >
          Trending communities
        </IonLabel>
      </IonListHeader>
      {trendingCommunities?.map((community) => (
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${getHandle(community.community)}`,
          )}
          key={community.community.id}
        >
          <IonIcon icon={trendingUp} color="primary" slot="start" />
          <IonLabel className="ion-text-nowrap">
            {getHandle(community.community)}
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
}
