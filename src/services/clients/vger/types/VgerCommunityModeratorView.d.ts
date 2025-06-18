import { VgerCommunity } from "./VgerCommunity";
import { VgerPerson } from "./VgerPerson";

export interface VgerCommunityModeratorView {
  community: VgerCommunity;
  moderator: VgerPerson;
}
