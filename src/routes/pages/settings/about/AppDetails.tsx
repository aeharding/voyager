import { styled } from "@linaria/react";

import AppVersionInfo from "./AppVersionInfo";

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

export default function AppDetails() {
  return (
    <AppContainer>
      <img src="/logo.png" alt="" />
      <div>
        Voyager <AppVersionInfo verbose betaAs="aside" />
        <aside>by Alexander Harding</aside>
      </div>
    </AppContainer>
  );
}
