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
import { IonIcon, IonItem } from "@ionic/react";
import { maxWidthCss } from "../../shared/AppContent";
import Ago from "../../labels/Ago";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import ModlogItemMoreActions from "./ModlogItemMoreActions";
import {
  ModeratorRole,
  getModColor,
  getModIcon,
  getModName,
} from "../useCanModerate";
import useIsAdmin from "../useIsAdmin";
import { timerOutline } from "ionicons/icons";
import { styled } from "@linaria/react";

const Container = styled.div`
  display: flex;
  gap: 1rem;

  ${maxWidthCss}

  padding: 0.5rem 0;

  font-size: 0.875em;

  strong {
    font-weight: 500;
  }
`;

const StartContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Content = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;

  aside {
    color: var(--ion-color-medium);
    margin-left: auto;

    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Body = styled.div`
  color: var(--ion-color-medium);
  padding: 0.5rem 0;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  aside {
    color: var(--ion-color-medium);
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const Title = styled.div``;
const Reason = styled.div``;
const By = styled.div<{ color: string }>`
  display: flex;
  justify-content: right;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0;
  color: ${({ color }) => `var(--ion-color-${color}-shade)`};
`;

interface ModLogItemProps {
  item: ModlogItemType;
}

export interface LogEntryData {
  icon: string;
  title: string;
  when: string;
  message?: string;
  reason?: string;
  expires?: string;
  by?: string;
  role?: ModeratorRole;
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
  const {
    icon,
    title,
    when,
    by,
    role: role_,
    message,
    reason,
    expires,
    link,
  } = renderModlogData(item);

  const isAdmin = useIsAdmin(
    (() => {
      if ("admin" in item) return item.admin;
      if ("moderator" in item) return item.moderator;
    })(),
  );

  const role = (() => {
    if (by && isAdmin) return "admin-local";
    if ("admin" in item) return "admin-remote";

    return role_ ?? "mod";
  })();

  return (
    <IonItem
      className={maxWidthCss}
      href={undefined}
      routerLink={link ? buildGeneralBrowseLink(link) : undefined}
      detail={false}
    >
      <Container>
        <StartContent>
          <IonIcon icon={icon} color="medium" />
        </StartContent>
        <Content>
          <Header>
            <Title>{title}</Title>
            <aside>
              <ModlogItemMoreActions item={item} role={role} />
              <Ago date={when} />
            </aside>
          </Header>
          <Body>{message}</Body>
          {reason && <Reason>Reason: {reason}</Reason>}
          <Footer>
            <By color={getModColor(role)}>
              <IonIcon icon={getModIcon(role)} />
              {by ? by : getModName(role)}
            </By>
            {expires && (
              <aside>
                <IonIcon icon={timerOutline} /> <Ago date={expires} />
              </aside>
            )}
          </Footer>
        </Content>
      </Container>
    </IonItem>
  );
}
