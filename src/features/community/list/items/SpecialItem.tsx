import { IonIcon, IonItem } from "@ionic/react";
import { earth, home, people, shieldCheckmark } from "ionicons/icons";

import { attributedPreventOnClickNavigationBug } from "#/helpers/ionic";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import listStyles from "../ResolvedCommunitiesList.module.css";

interface SpecialItemProps {
  type: "home" | "all" | "local" | "mod";
  actor: string;
  line: boolean | undefined;
  className?: string;
}

export default function SpecialItem({
  type,
  actor,
  line,
  className,
}: SpecialItemProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  return (
    <IonItem
      routerLink={buildGeneralBrowseLink(`/${type}`)}
      detail={false}
      {...attributedPreventOnClickNavigationBug}
      lines={line ? "inset" : "none"}
      className={className}
    >
      <div className={listStyles.content}>
        <IonIcon
          className={listStyles.subIcon}
          icon={getIcon(type)}
          style={{ background: getIconBg(type) }}
        />
        <div>
          {getTitle(type)}
          <aside>{getDescription(type, actor)}</aside>
        </div>
      </div>
    </IonItem>
  );
}

function getTitle(type: SpecialItemProps["type"]) {
  switch (type) {
    case "home":
      return "Home";
    case "all":
      return "All";
    case "local":
      return "Local";
    case "mod":
      return "Moderator";
  }
}

function getIcon(type: SpecialItemProps["type"]) {
  switch (type) {
    case "home":
      return home;
    case "all":
      return earth;
    case "local":
      return people;
    case "mod":
      return shieldCheckmark;
  }
}

function getIconBg(type: SpecialItemProps["type"]) {
  switch (type) {
    case "home":
      return "red";
    case "all":
      return "#009dff";
    case "local":
      return "#00f100";
    case "mod":
      return "#464646";
  }
}

function getDescription(type: SpecialItemProps["type"], actor: string) {
  switch (type) {
    case "home":
      return "Posts from subscriptions";
    case "all":
      return "Posts across all federated communities";
    case "local":
      return `Posts from communities on ${actor}`;
    case "mod":
      return "Posts from moderated communities";
  }
}
