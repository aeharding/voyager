import { IonContent } from "@ionic/react";

import { cx } from "#/helpers/css";

import sharedStyles from "./shared.module.css";

export function MaxWidthContainer(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cx(sharedStyles.maxWidth, props.className)} />
  );
}

export default function AppContent({
  children,
  scrollY,
  className,
  fullscreen = false,
  ...rest
}: React.ComponentProps<typeof IonContent>) {
  return (
    <IonContent
      style={{ width: "100%" }}
      scrollY={scrollY ?? false}
      fullscreen={fullscreen}
      {...rest}
    >
      <MaxWidthContainer className={className}>{children}</MaxWidthContainer>
    </IonContent>
  );
}
