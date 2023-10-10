import { Person } from "lemmy-js-client";
import { getHandle } from "../../../helpers/lemmy";
import ItemIcon from "../../labels/img/ItemIcon";
import { IonItem, IonList } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import styled from "@emotion/styled";

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

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
            <Content>
              <ItemIcon item={person} />
              {getHandle(person)}
            </Content>
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
