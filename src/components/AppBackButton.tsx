import { IonBackButton } from "@ionic/react";
import { useState } from "react";

interface AppBackButtonProps {
  defaultText?: string;
  defaultHref?: string;
}

export default function AppBackButton({
  defaultText,
  defaultHref,
}: AppBackButtonProps) {
  // Totally a hack, but I haven't found a better solution
  // const [lastPageTitle] = useState(
  //   (() => {
  //     const hiddenPages = document.querySelectorAll(".ion-page");
  //     if (!hiddenPages.length) return;

  //     return hiddenPages[hiddenPages.length - 1]
  //       .querySelector(".title-default")
  //       ?.textContent?.trim();
  //   })()
  // );

  return (
    <IonBackButton
      // text={lastPageTitle ?? defaultText}
      text="Back"
      defaultHref={defaultHref}
    />
  );
}
