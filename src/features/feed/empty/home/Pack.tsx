import { IonLabel, IonText } from "@ionic/react";
import { IonCheckbox } from "@ionic/react";
import { IonIcon } from "@ionic/react";
import { IonItem } from "@ionic/react";
import { useState } from "react";

import { cx } from "#/helpers/css";
import { getApId, getCommunityHandleFromActorId } from "#/helpers/lemmy";
import { useAppSelector } from "#/store";

import { PackType } from "./StarterPacksModal";

import styles from "./Pack.module.css";

interface PackProps {
  pack: PackType;
  onSelect: (selected: boolean, pack: PackType) => void;
}

export default function Pack({ pack, onSelect }: PackProps) {
  const follows = useAppSelector(
    (state) => state.site.response?.my_user?.follows,
  );
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const subscribedLength = pack.communities.filter((ap_id) => {
    const community =
      communityByHandle[
        getCommunityHandleFromActorId(ap_id, connectedInstance)!
      ];

    if (community) {
      return community.subscribed !== "NotSubscribed";
    }
    if (follows?.find((f) => getApId(f.community) === ap_id)) return true;
    return false;
  }).length;

  const [checked, setChecked] = useState(false);

  const completelySubscribed = subscribedLength === pack.communities.length;

  return (
    <IonItem
      key={pack.title}
      className={cx(completelySubscribed && styles.disabled)}
    >
      <IonIcon
        icon={pack.icon}
        slot="start"
        color="medium"
        className={styles.disabled}
      />
      <IonCheckbox
        justify="space-between"
        color={completelySubscribed ? "medium" : "primary"}
        checked={checked || completelySubscribed}
        onIonChange={(e) => {
          setChecked(e.detail.checked);
          onSelect(e.detail.checked, pack);
        }}
      >
        <IonLabel>
          {pack.title}
          <p className="ion-text-wrap">
            {pack.description}{" "}
            <IonText color="primary">
              {subscribedLength}/{pack.communities.length}&nbsp;subscribed
            </IonText>
          </p>
        </IonLabel>
      </IonCheckbox>
    </IonItem>
  );
}
