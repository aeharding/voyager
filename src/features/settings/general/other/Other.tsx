import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import Haptics from "./Haptics";
import ProfileTabLabel from "./ProfileTabLabel";
import LinkHandler from "./LinkHandler";
import DefaultFeed from "./DefaultFeed";
import NoSubscribedInFeed from "./NoSubscribedInFeed";
import OpenNativeApps from "./OpenNativeApps";
import ClearCache from "./ClearCache";
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
        <ClearCache />
        <BackupSettings />
      </IonList>
    </>
  );
}
