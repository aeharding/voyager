import {
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import AppContent from "../features/shared/AppContent";
import { useParams } from "react-router";
import { useAppSelector } from "../store";
import { getHandle } from "../helpers/lemmy";
import { home, library, people } from "ionicons/icons";
import styled from "@emotion/styled";
import { pullAllBy, sortBy, uniqBy } from "lodash";
import { notEmpty } from "../helpers/array";
import { useContext, useMemo, useRef } from "react";
import { AppContext } from "../features/auth/AppContext";
import { useBuildGeneralBrowseLink } from "../helpers/routes";
import CommunityIcon from "../features/labels/img/CommunityIcon";

const SubIcon = styled(IonIcon)<{ color: string }>`
  border-radius: 50%;
  padding: 6px;
  width: 1rem;
  height: 1rem;

  background: ${({ color }) => color};
  --ion-color-base: white;
`;

const Content = styled.div`
  margin: 0.7rem 0;

  display: flex;
  align-items: center;
  gap: 1rem;

  aside {
    margin-top: 0.2rem;
    color: var(--ion-color-medium);
    font-size: 0.8em;
  }
`;

export default function CommunitiesPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { setActivePage } = useContext(AppContext);
  const { actor } = useParams<{ actor: string }>();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const pageRef = useRef();

  const follows = useAppSelector((state) => state.auth.site?.my_user?.follows);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  useIonViewWillEnter(() => {
    if (pageRef.current) setActivePage(pageRef.current);
  });

  const communities = useMemo(() => {
    const communities = uniqBy(
      [
        ...(follows || []).map((f) => f.community),
        ...Object.values(communityByHandle).map(
          (c) => c?.community_view.community
        ),
      ].filter(notEmpty),
      "id"
    );

    pullAllBy(
      communities,
      Object.values(communityByHandle)
        .filter(
          (response) => response?.community_view.subscribed === "NotSubscribed"
        )
        .map((c) => c?.community_view.community),
      "id"
    );

    return communities;
  }, [follows, communityByHandle]);

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Communities</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <IonList>
          <IonItemGroup>
            {jwt && (
              <IonItem routerLink={buildGeneralBrowseLink(`/home`)}>
                <Content>
                  <SubIcon icon={home} color="red" />
                  <div>
                    Home
                    <aside>Posts from subscriptions</aside>
                  </div>
                </Content>
              </IonItem>
            )}
            <IonItem routerLink={buildGeneralBrowseLink(`/all`)}>
              <Content>
                <SubIcon icon={library} color="#009dff" />
                <div>
                  All<aside>Posts across all federated communities</aside>
                </div>
              </Content>
            </IonItem>
            <IonItem routerLink={buildGeneralBrowseLink(`/local`)} lines="none">
              <Content>
                <SubIcon icon={people} color="#00f100" />
                <div>
                  Local<aside>Posts from communities on {actor}</aside>
                </div>
              </Content>
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Communities</IonLabel>
            </IonItemDivider>
          </IonItemGroup>

          {sortBy(communities, "name")?.map((community) => (
            <IonItem
              key={community.id}
              routerLink={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
            >
              <Content>
                <CommunityIcon community={community} size={28} />
                {getHandle(community)}
              </Content>
            </IonItem>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
