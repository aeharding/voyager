import { IonText } from "@ionic/react";
import React from "react";

interface AppVersionInfoProps {
  betaAs?: React.ElementType;
  betaPrefix?: string;
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

function BetaInfo({ betaPrefix }: AppVersionInfoProps) {
  if (import.meta.env.DEV) return <IonText color="danger">Development</IonText>;

  // If the app version is different from the git ref (tag), it's a pre-release
  if (import.meta.env.APP_GIT_REF !== import.meta.env.APP_VERSION)
    return (
      <IonText color="warning">
        {betaPrefix && `${betaPrefix} – `}[{import.meta.env.APP_BUILD}]{" "}
        {import.meta.env.APP_GIT_REF.slice(0, 7)}
      </IonText>
    );
}
