import { useParams } from "react-router";

import CommunitiesResultsPage from "../CommunitiesResultsPage";

export default function SearchCommunitiesPage() {
  const { search } = useParams<{ search: string }>();

  return <CommunitiesResultsPage search={search} />;
}
