import { IonTabButton } from "@ionic/react";
import { useCallback, useContext, useMemo } from "react";
import { LongPressReactEvents, useLongPress } from "use-long-press";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import { scrollUpIfNeeded } from "../../../helpers/scrollUpIfNeeded";
import { AppContext } from "../../../features/auth/AppContext";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import { styled } from "@linaria/react";
import { compactTabBarMediaSelector } from "../../TabBar";

// reverts https://github.com/ionic-team/ionic-framework/pull/28754
const StyledIonTabButton = styled(IonTabButton)`
  &.ios.tab-has-label {
    ion-icon {
      font-size: 30px;
    }
  }

  @media ${compactTabBarMediaSelector} {
    flex-direction: row;

    ion-icon {
      font-size: 22px !important;
      margin-right: 5px;
    }
  }
`;

export interface TabButtonProps {
  /**
   * Used internally by Ionic. Pass down.
   */
  tab: string;

  /**
   * Ionic will change. Pass down. Do not access/use directly.
   */
  href: string;

  /**
   * When rendered inside TabBar with isTabButton, Ionic will setup this onClick function
   */
  onClick?: (e: CustomEvent) => void;

  children?: React.ReactNode;

  longPressedRef: React.MutableRefObject<boolean>;

  onLongPressOverride?: () => void;
  onLongPressExtraAction?: () => void;
  customBackAction?: () => void;
  onBeforeBackAction?: () => void;
}

export default function SharedTabButton({
  longPressedRef,
  onClick,
  children,
  onLongPressExtraAction,
  onLongPressOverride,
  customBackAction,
  onBeforeBackAction,
  ...rest
}: TabButtonProps) {
  const vibrate = useHapticFeedback();
  const router = useOptimizedIonRouter();
  const { activePageRef } = useContext(AppContext);

  const defaultHref = `/${rest.tab}`;

  const onDefaultClick = useCallback(
    (e: CustomEvent) => {
      if (longPressedRef.current) {
        return;
      }

      if (!router.getRouteInfo()?.pathname.startsWith(defaultHref)) {
        onClick?.(e);
        return;
      }

      if (scrollUpIfNeeded(activePageRef?.current)) return;

      if (customBackAction) {
        customBackAction();
        return;
      }

      onBeforeBackAction?.();

      router.push(defaultHref, "back");
    },
    [
      activePageRef,
      router,
      longPressedRef,
      onClick,
      defaultHref,
      customBackAction,
      onBeforeBackAction,
    ],
  );

  const onLongPress = useCallback(
    (e: LongPressReactEvents) => {
      vibrate({ style: ImpactStyle.Light });

      if (onLongPressOverride) {
        onLongPressOverride();
        return;
      }

      if (!router.getRouteInfo()?.pathname.startsWith(defaultHref)) {
        if (e.target instanceof HTMLElement) e.target.click();
      }

      // order matters- set after target.click()
      longPressedRef.current = true;

      onLongPressExtraAction?.();
    },
    [
      router,
      vibrate,
      longPressedRef,
      onLongPressExtraAction,
      defaultHref,
      onLongPressOverride,
    ],
  );

  const tabLongPressSettings = useMemo(
    () => ({
      onFinish: () => {
        setTimeout(() => {
          longPressedRef.current = false;
        }, 200);
      },
    }),
    [longPressedRef],
  );

  const longPressBind = useLongPress(onLongPress, tabLongPressSettings);

  return (
    <StyledIonTabButton onClick={onDefaultClick} {...longPressBind()} {...rest}>
      {children}
    </StyledIonTabButton>
  );
}
