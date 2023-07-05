import { IonLabel, IonList, IonListHeader } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useAppDispatch, useAppSelector } from "../../store";
import { css } from "@emotion/react";
import { InsetIonItem, SettingLabel } from "../user/Profile";
import { getHandle } from "../../helpers/lemmy";
import { trendingUp } from "ionicons/icons";
import { useEffect } from "react";
import { getTrendingCommunities } from "../community/communitySlice";
import IonIconWrapper from "../../helpers/ionIconWrapper";

export default function TrendingCommunities() {
  const dispatch = useAppDispatch();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const trendingCommunities = useAppSelector(
    (state) => state.community.trendingCommunities
  );

  useEffect(() => {
    if (!trendingCommunities.length) dispatch(getTrendingCommunities());
  }, [dispatch, trendingCommunities]);

  return (
    <IonList inset color="primary">
      <IonListHeader>
        <IonLabel
          css={css`
            margin-top: 0;
          `}
        >
          Trending communities
        </IonLabel>
      </IonListHeader>
      {trendingCommunities.map((community) => (
        <InsetIonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${getHandle(community.community)}`
          )}
          key={community.community.id}
        >
          <IonIconWrapper icon={trendingUp} color="primary" />
          <SettingLabel>{getHandle(community.community)}</SettingLabel>
        </InsetIonItem>
      ))}
    </IonList>
  );
}
