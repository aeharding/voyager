import { IonButton, IonIcon } from "@ionic/react";
import { ListingType } from "lemmy-js-client";
import { MouseEvent } from "react";

import { getModColor, getModIcon } from "#/features/moderation/useCanModerate";
import useModZoneActions, {
  UseModZoneActionsProps,
} from "#/features/moderation/useModZoneActions";

export default function ModActions(props: UseModZoneActionsProps) {
  const { present: presentModZoneActions, role } = useModZoneActions(props);

  function onClick(e: MouseEvent) {
    e.stopPropagation();
    presentModZoneActions();
  }

  if (!role) return;

  return (
    <IonButton onClick={onClick}>
      <IonIcon icon={getModIcon(role)} color={getModColor(role)} />
    </IonButton>
  );
}

export function getFeedUrlName(type: ListingType): string {
  switch (type) {
    case "All":
      return "all";
    case "Local":
      return "local";
    case "ModeratorView":
      return "mod";
    case "Subscribed":
      return "home";
  }
}
