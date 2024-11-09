import {
  IonItem,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from "@ionic/react";
import { IonItemOption } from "@ionic/react";
import { styled } from "@linaria/react";
import { noop } from "es-toolkit";

import SourceUrlButton from "#/features/tags/SourceUrlButton";
import UserScore from "#/features/tags/UserScore";
import UserTag from "#/features/tags/UserTag";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { UserTag as UserTagType } from "#/services/db";

const StyledSourceUrlButton = styled(SourceUrlButton)`
  ion-icon {
    font-size: min(1.6em, 30px);
  }
`;

interface BrowseTagProps {
  tag: UserTagType;
  remove: (tag: UserTagType) => void;
}

export default function BrowseTag({ tag, remove }: BrowseTagProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const [username, instance] = tag.handle.split("@");

  return (
    <IonItemSliding>
      <IonItemOptions side="end" onIonSwipe={() => remove(tag)}>
        <IonItemOption color="danger" expandable onClick={() => remove(tag)}>
          Remove
        </IonItemOption>
      </IonItemOptions>
      <IonItem
        routerLink={buildGeneralBrowseLink(`/u/${tag.handle}`)}
        draggable={false}
        href={undefined}
        detail={false}
      >
        <IonLabel>
          {username}
          <wbr />@{instance} <UserScore tag={tag} /> <UserTag tag={tag} />{" "}
        </IonLabel>
        <StyledSourceUrlButton
          sourceUrl={tag.sourceUrl}
          dismiss={noop}
          slot="end"
          fill="clear"
        />
      </IonItem>
    </IonItemSliding>
  );
}
