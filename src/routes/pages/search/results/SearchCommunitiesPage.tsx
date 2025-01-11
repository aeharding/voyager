import { useParams } from "react-router";

import CommunitiesResultsPage from "../CommunitiesResultsPage";

export default function SearchCommunitiesPage() {
  const { search: _encodedSearch } = useParams<{ search: string }>();

  const search = decodeURIComponent(_encodedSearch);

  return <CommunitiesResultsPage search={search} />;
}
