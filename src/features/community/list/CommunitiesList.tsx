import { loggedInSelector } from "#/features/auth/authSelectors";
import { useAppSelector } from "#/store";

import GuestCommunitiesList from "./GuestCommunitiesList";
import LoggedInCommunitiesList from "./LoggedInCommunitiesList";

export interface CommunitiesListProps {
  actor: string;
}

export default function CommunitiesList(props: CommunitiesListProps) {
  const loggedIn = useAppSelector(loggedInSelector);

  const List = loggedIn ? LoggedInCommunitiesList : GuestCommunitiesList;

  return <List {...props} />;
}
