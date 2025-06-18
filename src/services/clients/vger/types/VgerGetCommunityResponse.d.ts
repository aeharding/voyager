import { VgerCommunityModeratorView } from "./VgerCommunityModeratorView";
import { VgerCommunityView } from "./VgerCommunityView";

export interface VgerGetCommunityResponse {
  community_view: VgerCommunityView;
  moderators: Array<VgerCommunityModeratorView>;
}
