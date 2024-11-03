import { IonItem, IonLabel, IonList } from "@ionic/react";
import { Person } from "lemmy-js-client";

import ItemIcon from "#/features/labels/img/ItemIcon";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

interface InstanceAdminsProps {
  people: Person[];
  type: "admins" | "mods";
}

export default function SidebarOwners({ people, type }: InstanceAdminsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <>
      <h3 className="ion-padding-start ion-padding-end">
        {getTypeLabel(type)}
      </h3>
      <IonList>
        {people.map((person) => (
          <IonItem
            key={person.id}
            routerLink={buildGeneralBrowseLink(`/u/${getHandle(person)}`)}
          >
            <ItemIcon item={person} slot="start" />
            <IonLabel className="ion-text-nowrap">{getHandle(person)}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    </>
  );
}

function getTypeLabel(type: "admins" | "mods"): string {
  switch (type) {
    case "admins":
      return "Admins";
    case "mods":
      return "Moderators";
  }
}
