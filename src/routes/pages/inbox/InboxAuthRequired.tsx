import { Navigate } from "react-router";

import { jwtSelector } from "#/features/auth/authSelectors";
import useIonViewIsVisible from "#/helpers/useIonViewIsVisible";
import { useAppSelector } from "#/store";

export default function InboxAuthRequired({
  children,
}: React.PropsWithChildren) {
  const jwt = useAppSelector(jwtSelector);

  const ionViewIsVisible = useIonViewIsVisible();

  if (!jwt && ionViewIsVisible) return <Navigate to="/inbox" replace />;

  return children;
}
