import { IonRouterOutlet } from "@ionic/react";
import { use } from "react";
import { Navigate, Route } from "react-router-dom";

import { OutletContext } from "./OutletProvider";
import Inbox from "./tabs/Inbox";
import Posts from "./tabs/Posts";
import Profile from "./tabs/Profile";
import Search from "./tabs/Search";
import Settings from "./tabs/Settings";
import SecondColumnContent from "./twoColumn/SecondColumnContent";

import styles from "./Outlet.module.css";

/**
 * Ionic will always rerender this component.
 * So make a dummy component for react-compiler to optimize
 */
export default function MyOutlet() {
  return <AppOutlet />;
}

MyOutlet.isRouterOutlet = true;

function AppOutlet() {
  return <AppRoutes />;
}

function AppRoutes() {
  const { isTwoColumnLayout: twoColumnLayoutEnabled } = use(OutletContext);

  return (
    <div className={styles.routerOutletContents}>
      {twoColumnLayoutEnabled && <SecondColumnContent />}

      {/* This is first (order = -1) in css. Why? See Outlet.module.css */}
      <IonRouterOutlet>
        {/* <Route path="/" element={<Navigate to="posts" replace />} />

        <Route path="/posts/*" element={<Posts />} />
        <Route path="/inbox/*" element={<Inbox />} />
        <Route path="/profile/*" element={<Profile />} /> */}
        <Route path="/search/*" element={<Search />} />
        <Route path="/settings/*" element={<Settings />} />
      </IonRouterOutlet>
    </div>
  );
}
