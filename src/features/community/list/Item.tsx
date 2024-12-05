import { IonItemDivider } from "@ionic/react";

import { useAppSelector } from "#/store";

import CommunityListItem from "./items/CommunityListItem";
import SpecialItem from "./items/SpecialItem";
import { ItemType } from "./ResolvedCommunitiesList";

import sharedStyles from "#/features/shared/shared.module.css";

interface ItemProps {
  item: ItemType;
  actor: string;
  line: boolean | undefined;
}

export default function Item({ item, actor, line }: ItemProps) {
  const favorites = useAppSelector((state) => state.community.favorites);

  switch (item.type) {
    case "separator":
      return (
        <IonItemDivider className={sharedStyles.maxWidth}>
          {item.value}
        </IonItemDivider>
      );
    case "all":
    case "home":
    case "local":
    case "mod":
      return (
        <SpecialItem
          type={item.type}
          actor={actor}
          line={line}
          className={sharedStyles.maxWidth}
        />
      );
    case "community":
    case "favorite":
      return (
        <CommunityListItem
          community={item.value}
          favorites={favorites}
          removeAction="follow"
          line={line}
          className={sharedStyles.maxWidth}
        />
      );
  }
}
