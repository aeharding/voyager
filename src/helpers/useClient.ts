import { useAppSelector } from "../store";
import { clientSelector } from "../features/auth/authSelectors";

export default function useClient() {
  const client = useAppSelector(clientSelector);

  return client;
}
