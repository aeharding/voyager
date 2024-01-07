import { Person } from "lemmy-js-client";
import { getHandle } from "../../../helpers/lemmy";
import ItemIcon from "../../labels/img/ItemIcon";
import { IonItem, IonLabel, IonList } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";

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
            className="item-legacy"
          >
            <ItemIcon item={person} slot="start" />
            <IonLabel>{getHandle(person)}</IonLabel>
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
