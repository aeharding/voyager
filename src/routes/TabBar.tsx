import { IonTabBar } from "@ionic/react";
import { ComponentProps, useRef } from "react";

import InboxTabButton from "./tabs/buttons/InboxTabButton";
import PostsTabButton from "./tabs/buttons/PostsTabButton";
import ProfileTabButton from "./tabs/buttons/ProfileTabButton";
import SearchTabButton from "./tabs/buttons/SearchTabButton";
import SettingsTabButton from "./tabs/buttons/SettingsTabButton";

import styles from "./TabBar.module.css";

/**
 * Ionic checks `isTabBar` for custom IonTabBar components.
 */
TabBar.isTabBar = true;

export default function TabBar(
  props: Omit<
    ComponentProps<typeof IonTabBar>,
    "className" | "onClick" | "onTouchEnd"
  >,
) {
  const longPressedRef = useRef(false);

  const resetLongPress = () => {
    longPressedRef.current = false;
  };

  const sharedTabProps = {
    longPressedRef,
  };

  return (
    <IonTabBar
      {...props}
      className={styles.tabBar}
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
    </IonTabBar>
  );
}
