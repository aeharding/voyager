import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import {
  getSelf,
  jwtIssSelector,
  updateConnectedInstance,
} from "./features/auth/authSlice";
import { useLocation } from "react-router";
import { DEFAULT_ACTOR } from "./Tabs";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const iss = useAppSelector(jwtIssSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/posts")) {
      if (connectedInstance) return;

      dispatch(updateConnectedInstance(iss ?? DEFAULT_ACTOR));
    }

    const potentialConnectedInstance = location.pathname.split("/")[2];

    if (connectedInstance === potentialConnectedInstance) return;

    if (potentialConnectedInstance)
      dispatch(updateConnectedInstance(potentialConnectedInstance));
  }, [location.pathname]);

  useEffect(() => {
    dispatch(getSelf());
  }, [jwt]);

  if (!connectedInstance) return;

  return <>{children}</>;
}
