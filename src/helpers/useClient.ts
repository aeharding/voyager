import { useAppSelector } from "../store";
import { clientSelector } from "../features/auth/authSlice";

export default function useClient() {
  const client = useAppSelector(clientSelector);

  return client;
}
