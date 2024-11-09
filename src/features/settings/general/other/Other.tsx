import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import ClearCache from "./ClearCache";
import DefaultFeed from "./DefaultFeed";
import Haptics from "./Haptics";
import LinkHandler from "./LinkHandler";
import NoSubscribedInFeed from "./NoSubscribedInFeed";
import OpenNativeApps from "./OpenNativeApps";
import ProfileTabLabel from "./ProfileTabLabel";
import Thumbnailinator from "./Thumbnailinator";
import BackupSettings from "./backup/BackupSettings";

export default function Other() {
  return (
    <>
      <ListHeader>
        <IonLabel>Other</IonLabel>
      </ListHeader>
      <IonList inset>
        <DefaultFeed />
        <LinkHandler />
        <OpenNativeApps />
        <ProfileTabLabel />
        <Haptics />
        <NoSubscribedInFeed />
        <Thumbnailinator />
        <ClearCache />
        <BackupSettings />
      </IonList>
    </>
  );
}
