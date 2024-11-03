import { clientSelector } from "#/features/auth/authSelectors";
import { useAppSelector } from "#/store";

export default function useClient() {
  const client = useAppSelector(clientSelector);

  return client;
}
