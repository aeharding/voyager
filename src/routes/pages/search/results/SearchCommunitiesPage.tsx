import useRequiredParams from "#/helpers/useRequiredParams";

import CommunitiesResultsPage from "../CommunitiesResultsPage";

export default function SearchCommunitiesPage() {
  const { search: _encodedSearch } = useRequiredParams<{ search: string }>();

  const search = decodeURIComponent(_encodedSearch);

  return <CommunitiesResultsPage search={search} />;
}
