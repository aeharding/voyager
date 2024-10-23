import { IonTabBar } from "@ionic/react";
import { ComponentProps, useRef } from "react";
import PostsTabButton from "./tabs/buttons/PostsTabButton";
import InboxTabButton from "./tabs/buttons/InboxTabButton";
import ProfileTabButton from "./tabs/buttons/ProfileTabButton";
import SearchTabButton from "./tabs/buttons/SearchTabButton";
import SettingsTabButton from "./tabs/buttons/SettingsTabButton";
import { styled } from "@linaria/react";

const StyledIonTabBar = styled(IonTabBar)`
  @media (orientation: landscape) and (max-height: 450px) {
    height: 36px;

    ion-badge {
      inset-inline-start: calc(70% + 6px);

      &.md {
        inset-inline-start: calc(75% + 6px);
      }
    }

    ion-tab-button {
      flex-direction: row;

      > ion-label {
        margin-bottom: 0;
      }

      > ion-icon {
        font-size: 22px !important;
        margin-right: 5px;
      }
    }
  }
`;

const TabBar = function TabBar(props: ComponentProps<typeof IonTabBar>) {
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
};

TabBar.isTabBar = true;

export default TabBar;
