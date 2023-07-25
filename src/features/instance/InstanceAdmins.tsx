import { PersonView } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import ItemIcon from "../labels/img/ItemIcon";
import { IonItem, IonList } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import styled from "@emotion/styled";

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

interface InstanceAdminsProps {
  admins: PersonView[];
}

export default function InstanceAdmins({ admins }: InstanceAdminsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <>
      <h3 className="ion-padding-start ion-padding-end">Admins</h3>
      <IonList>
        {admins.map((admin) => (
          <IonItem
            key={admin.person.id}
            routerLink={buildGeneralBrowseLink(`/u/${getHandle(admin.person)}`)}
          >
            <Content>
              <ItemIcon item={admin.person} />
              {getHandle(admin.person)}
            </Content>
          </IonItem>
        ))}
      </IonList>
    </>
  );
}
