import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { useCallback, useContext } from "react";
import { AppContext } from "../auth/AppContext";
import { findCurrentPage } from "../../helpers/ionic";
import { useLongPress } from "use-long-press";
import useHapticFeedback from "../../helpers/useHapticFeedback";
import { ImpactStyle } from "@capacitor/haptics";
import { isNative } from "../../helpers/device";
import { useAppSelector } from "../../store";

export default function JumpFab() {
  const { activePageRef } = useContext(AppContext);
  const vibrate = useHapticFeedback();
  const jumpButtonPosition = useAppSelector(
    (state) => state.settings.general.comments.jumpButtonPosition,
  );

  const horizontal: "center" | "start" | "end" = (() => {
    switch (jumpButtonPosition) {
      case "center":
        return "center";
      case "left-bottom":
      case "left-middle":
      case "left-top":
        return "start";
      case "right-bottom":
      case "right-middle":
      case "right-top":
        return "end";
    }
  })();

  const vertical: "center" | "top" | "bottom" = (() => {
    switch (jumpButtonPosition) {
      case "center":
      case "left-bottom":
      case "right-bottom":
        return "bottom";
      case "left-middle":
      case "right-middle":
        return "center";
      case "left-top":
      case "right-top":
        return "top";
    }
  })();

  const onJump = useCallback(
    (skip = 1) => {
      const virtuaRef = activePageRef?.current?.current;
      if (!virtuaRef) return;
      if (!("scrollToIndex" in virtuaRef)) return;

      const page = findCurrentPage();
      if (!page) return;

      const header = page.closest(".ion-page")?.querySelector("ion-header");
      if (!header) return;

      const items = [...page.querySelectorAll("[data-index]")];

      const currentItem = items.find((item) => {
        return (
          item.getBoundingClientRect().top - 8 <
            header.getBoundingClientRect().height &&
          item.getBoundingClientRect().top +
            item.getBoundingClientRect().height -
            8 >
            header.getBoundingClientRect().height
        );
      });

      let potentialIndex: string | null | undefined | number =
        currentItem?.getAttribute("data-index");

      if (potentialIndex != null) {
        potentialIndex = +potentialIndex + skip;

        // If scrolling up and partway through current item, return to top of current item
        // (don't return to the top of the next item)
        if (
          currentItem &&
          skip === -1 &&
          header.getBoundingClientRect().height -
            currentItem.getBoundingClientRect().top >
            8
        ) {
          potentialIndex++;
        }
      }

      if (potentialIndex == null) {
        potentialIndex = Math.max(
          0,
          +(items.pop()?.getAttribute("data-index") ?? 0) + skip,
        );
      }
      if (potentialIndex == null) return;

      const index = +potentialIndex;
      if (isNaN(index)) return;

      if (isNative()) vibrate({ style: ImpactStyle.Light });

      virtuaRef.scrollToIndex(index, { smooth: true });
    },
    [activePageRef, vibrate],
  );

  const onJumpLongPress = useCallback(() => onJump(-1), [onJump]);
  const onLongPressCancel = useCallback(() => onJump(), [onJump]);

  const bind = useLongPress(
    onJumpLongPress,
    // () => onJump(),
    { cancelOnMovement: true, onCancel: onLongPressCancel },
  );

  return (
    <IonFab slot="fixed" vertical={vertical} horizontal={horizontal}>
      <IonFabButton {...bind()}>
        <IonIcon icon={chevronDownOutline} />
      </IonFabButton>
    </IonFab>
  );
}
