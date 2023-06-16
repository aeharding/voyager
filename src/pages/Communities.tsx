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
} from "@ionic/react";
import AppContent from "../components/AppContent";
import { useParams } from "react-router";
import { useAppSelector } from "../store";
import { getHandle } from "../helpers/lemmy";
import { home, library, people } from "ionicons/icons";
import styled from "@emotion/styled";
import { sortBy } from "lodash";

const SubIcon = styled(IonIcon)<{ color: string }>`
  border-radius: 50%;
  padding: 6px;
  width: 1rem;
  height: 1rem;

  background: ${({ color }) => color};
  --ion-color-base: white;
`;

const SubImgIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
`;

const FakeIcon = styled.div<{ bg: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ bg }) => bg};
  color: white;
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

export default function Communities() {
  const { actor } = useParams<{ actor: string }>();
  const follows = useAppSelector((state) => state.auth.site?.my_user?.follows);
  const jwt = useAppSelector((state) => state.auth.jwt);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Communities</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <IonList>
          <IonItemGroup>
            {jwt && (
              <IonItem routerLink={`/${actor}/home`}>
                <Content>
                  <SubIcon icon={home} color="red" />
                  <div>
                    Home
                    <aside>Posts from subscriptions</aside>
                  </div>
                </Content>
              </IonItem>
            )}
            <IonItem routerLink={`/${actor}/all`}>
              <Content>
                <SubIcon icon={library} color="#009dff" />
                <div>
                  All<aside>Posts across all federated communities</aside>
                </div>
              </Content>
            </IonItem>
            <IonItem routerLink={`/${actor}/local`} lines="none">
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

          {sortBy(follows, "community.name")?.map((follow) => (
            <IonItem
              key={follow.community.id}
              routerLink={`/${actor}/c/${getHandle(follow.community)}`}
            >
              <Content>
                {follow.community.icon ? (
                  <SubImgIcon src={follow.community.icon} />
                ) : (
                  <FakeIcon bg={generateRandomColor(follow.community.id)}>
                    {follow.community.name.slice(0, 1).toUpperCase()}
                  </FakeIcon>
                )}
                {getHandle(follow.community)}
              </Content>
            </IonItem>
          ))}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
function generateRandomColor(seed: string | number): string {
  // Convert seed to a numeric value
  let num: number;
  if (typeof seed === "number") {
    num = seed;
  } else {
    num = 0;
    for (let i = 0; i < seed.length; i++) {
      num += seed.charCodeAt(i);
    }
  }

  // Generate random RGB values
  const random = (num: number) => {
    const x = Math.sin(num) * 10000;
    return Math.floor((x - Math.floor(x)) * 256);
  };

  const red = random(num);
  const green = random(num + 1);
  const blue = random(num + 2);

  // Format RGB values into hexadecimal color
  const rgb = (red << 16) | (green << 8) | blue;
  const hexColor = `#${(rgb | 0x1000000).toString(16).substring(1)}`;

  return hexColor;
}
