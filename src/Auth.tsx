import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { getSelf, updateConnectedInstance } from "./features/auth/authSlice";
import { useLocation } from "react-router";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/instance")) return;

    const potentialConnectedInstance = location.pathname.split("/")[2];

    if (connectedInstance === potentialConnectedInstance) return;

    dispatch(updateConnectedInstance(potentialConnectedInstance));
  }, [location.pathname]);

  useEffect(() => {
    dispatch(getSelf());
  }, [jwt]);

  return <>{children}</>;
}
