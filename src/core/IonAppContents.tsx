import TabbedRoutes from "#/routes/TabbedRoutes";

import Auth from "./Auth";
import Listeners from "./listeners";

export default function IonAppContents() {
  return (
    <Auth>
      <TabbedRoutes>
        <Listeners />
      </TabbedRoutes>
    </Auth>
  );
}
