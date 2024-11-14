import { IonText } from "@ionic/react";
import { styled } from "@linaria/react";

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 1.2rem;
  margin: 32px 32px 48px;

  img {
    width: 70px;
    height: 70px;
    border-radius: 16px;
  }

  aside {
    font-size: 0.9rem;
    margin-top: 4px;
    color: var(--ion-color-medium);
  }
`;

const buildInfo = (() => {
  if (import.meta.env.DEV) return <IonText color="danger">Development</IonText>;

  // If the app version is different from the git ref (tag), it's a pre-release
  if (APP_GIT_REF !== APP_VERSION)
    return (
      <IonText color="warning">
        Beta Track — [{APP_BUILD}] {APP_GIT_REF.slice(0, 7)}
      </IonText>
    );
})();

export default function AppDetails() {
  return (
    <AppContainer>
      <img src="/logo.png" alt="" />
      <div>
        Voyager {APP_VERSION}
        {buildInfo && <aside>{buildInfo}</aside>}
        <aside>by Alexander Harding</aside>
      </div>
    </AppContainer>
  );
}
