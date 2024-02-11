import { ModlogItemType } from "../../../routes/pages/shared/ModlogPage";
import addCommunity from "./types/addCommunity";
import addInstance from "./types/addInstance";
import banFromCommunity from "./types/banFromCommunity";
import banFromInstance from "./types/banFromInstance";
import featurePost from "./types/featurePost";
import hideCommunity from "./types/hideCommunity";
import lockPost from "./types/lockPost";
import purgeComment from "./types/purgeComment";
import purgeCommunity from "./types/purgeCommunity";
import purgePerson from "./types/purgePerson";
import purgePost from "./types/purgePost";
import removeComment from "./types/removeComment";
import removeCommunity from "./types/removeCommunity";
import removePost from "./types/removePost";
import transferCommunity from "./types/transferCommunity";
import { IonItem } from "@ionic/react";
import { maxWidthCss } from "../../shared/AppContent";
import Ago from "../../labels/Ago";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { styled } from "@linaria/react";

const Contents = styled.div`
  font-size: 0.875em;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
`;

const TitleLine = styled.div`
  display: flex;
  justify-content: space-between;

  aside {
    color: var(--ion-color-medium);
  }
`;

const Title = styled.div``;
const Message = styled.div`
  color: var(--ion-color-medium);
`;

interface ModLogItemProps {
  item: ModlogItemType;
}

export interface LogEntryData {
  title: string;
  when: string;
  message?: string;
  by?: string;
  link?: string;
}

function renderModlogData(item: ModlogItemType): LogEntryData {
  switch (true) {
    case "mod_remove_comment" in item:
      return removeComment(item);
    case "mod_remove_post" in item:
      return removePost(item);
    case "mod_lock_post" in item:
      return lockPost(item);
    case "mod_feature_post" in item:
      return featurePost(item);
    case "mod_remove_community" in item:
      return removeCommunity(item);
    case "mod_ban_from_community" in item:
      return banFromCommunity(item);
    case "mod_ban" in item:
      return banFromInstance(item);
    case "mod_add_community" in item:
      return addCommunity(item);
    case "mod_transfer_community" in item:
      return transferCommunity(item);
    case "mod_add" in item:
      return addInstance(item);
    case "admin_purge_person" in item:
      return purgePerson(item);
    case "admin_purge_community" in item:
      return purgeCommunity(item);
    case "admin_purge_post" in item:
      return purgePost(item);
    case "admin_purge_comment" in item:
      return purgeComment(item);
    case "mod_hide_community" in item:
      return hideCommunity(item);
    default:
      // should never happen (type = never)
      //
      // If item is not type = never, then some mod log action was added
      // and needs to be handled.
      return item;
  }
}

export function ModlogItem({ item }: ModLogItemProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { title, by, when, message, link } = renderModlogData(item);

  return (
    <IonItem
      className={maxWidthCss}
      routerLink={link ? buildGeneralBrowseLink(link) : undefined}
      detail={false}
    >
      <Contents>
        <TitleLine>
          <Title>{title}</Title>
          <aside>
            {by && <span>{by} · </span>}
            <Ago date={when} />
          </aside>
        </TitleLine>
        <Message>{message}</Message>
      </Contents>
    </IonItem>
  );
}
