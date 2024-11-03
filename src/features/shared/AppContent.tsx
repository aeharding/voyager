import { IonContent } from "@ionic/react";
import { styled } from "@linaria/react";

export const maxWidthCss = `
  width: 100%;
  max-width: 700px;
  margin-right: auto;
  margin-left: auto;
`;

export const MaxWidthContainer = styled.div`
  ${maxWidthCss}
`;

export default function AppContent({
  children,
  scrollY,
  className,
  fullscreen = false,
}: {
  children: React.ReactNode;
  scrollY?: boolean;
  className?: string;
  fullscreen?: boolean;
}) {
  return (
    <IonContent
      style={{ width: "100%" }}
      scrollY={scrollY ?? false}
      fullscreen={fullscreen}
    >
      <MaxWidthContainer className={className}>{children}</MaxWidthContainer>
    </IonContent>
  );
}
