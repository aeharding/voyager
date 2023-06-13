import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { getSelf } from "./features/auth/authSlice";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((state) => state.auth.jwt);

  useEffect(() => {
    dispatch(getSelf());
  }, [jwt]);

  return <>{children}</>;
}
