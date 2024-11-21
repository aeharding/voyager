import { IonText } from "@ionic/react";
import React from "react";

interface AppVersionInfoProps {
  betaAs?: React.ElementType;
  verbose?: boolean;
}

export default function AppVersionInfo({
  betaAs: BetaEl = React.Fragment,
  ...props
}: AppVersionInfoProps) {
  return (
    <>
      {import.meta.env.APP_VERSION}{" "}
      <BetaEl>
        <BetaInfo {...props} />
      </BetaEl>
    </>
  );
}

function BetaInfo({ verbose }: AppVersionInfoProps) {
  if (import.meta.env.DEV) return <IonText color="danger">Development</IonText>;

  if (!import.meta.env.APP_GIT_REF) return;

  // e.g. pull request build
  if (!import.meta.env.APP_BUILD) {
    return (
      <IonText color="danger">
        {import.meta.env.APP_GIT_REF.slice(0, 7)}
      </IonText>
    );
  }

  // e.g. beta release
  // if the app version is different from the git ref (tag)
  if (import.meta.env.APP_GIT_REF !== import.meta.env.APP_VERSION)
    return (
      <IonText color="warning">
        {verbose && `Beta Track – `}[{import.meta.env.APP_BUILD}]{" "}
        {import.meta.env.APP_GIT_REF.slice(0, 7)}
      </IonText>
    );
}
