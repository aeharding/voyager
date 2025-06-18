import { VgerCommunityFollowerView } from "./VgerCommunityFollowerView";
import { VgerCommunityModeratorView } from "./VgerCommunityModeratorView";

export interface VgerSiteResponse {
  site_view: {
    site: {
      name: string;
      description?: string;
      icon?: string;
      banner?: string;
      actor_id: string;
      version?: string;
    };
  };
  my_user?: {
    // local_user_view: LocalUserView;
    follows: Array<VgerCommunityFollowerView>;
    moderates: Array<VgerCommunityModeratorView>;
    // community_blocks: Array<VgerCommunity>;
    // instance_blocks: Array<VgerInstance>;
    // person_blocks: Array<VgerPerson>;
  };
}
