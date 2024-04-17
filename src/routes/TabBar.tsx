import { IonTabBar } from "@ionic/react";
import { forwardRef, useRef } from "react";
import PostsTabButton from "./tabs/buttons/PostsTabButton";
import InboxTabButton from "./tabs/buttons/InboxTabButton";
import ProfileTabButton from "./tabs/buttons/ProfileTabButton";
import SearchTabButton from "./tabs/buttons/SearchTabButton";
import SettingsTabButton from "./tabs/buttons/SettingsTabButton";
import { styled } from "@linaria/react";

export const compactTabBarMediaSelector =
  "(orientation: landscape) and (max-height: 450px)";

const StyledIonTabBar = styled(IonTabBar)`
  @media ${compactTabBarMediaSelector} {
    height: 36px;

    ion-badge {
      inset-inline-start: calc(70% + 6px);
    }
  }
`;

type CustomTabBarType = typeof IonTabBar & {
  /**
   * Signal to Ionic that this is a tab bar component
   */
  isTabBar?: boolean;
};

const TabBar: CustomTabBarType = forwardRef(function TabBar(props, ref) {
  const longPressedRef = useRef(false);

  const resetLongPress = () => {
    longPressedRef.current = false;
  };

  const sharedTabProps = {
    longPressedRef,
  };

  return (
    <StyledIonTabBar
      {...props}
      ref={ref}
      onClick={resetLongPress}
      onTouchEnd={(e) => {
        // stop keyboard closing when search input has text on search tab press up
        if (longPressedRef.current) e.preventDefault();
      }}
    >
      <PostsTabButton tab="posts" href="/posts" {...sharedTabProps} />
      <InboxTabButton tab="inbox" href="/inbox" {...sharedTabProps} />
      <ProfileTabButton tab="profile" href="/profile" {...sharedTabProps} />
      <SearchTabButton tab="search" href="/search" {...sharedTabProps} />
      <SettingsTabButton tab="settings" href="/settings" {...sharedTabProps} />
    </StyledIonTabBar>
  );
});

TabBar.isTabBar = true;

export default TabBar;
