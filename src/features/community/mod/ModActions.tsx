import { IonButton, IonIcon } from "@ionic/react";
import { MouseEvent } from "react";
import { ListingType } from "threadiverse";

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
    case "all":
      return "all";
    case "local":
      return "local";
    case "moderator_view":
      return "mod";
    case "subscribed":
      return "home";
  }
}
