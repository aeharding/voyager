import { CommunityView } from "lemmy-js-client";
import CommunitySidebar from "./CommunitySidebar";
import InstanceSidebar from "./InstanceSidebar";

interface SidebarProps {
  community?: CommunityView;
}

export default function Sidebar({ community }: SidebarProps) {
  if (community) return <CommunitySidebar community={community} />;

  return <InstanceSidebar />;
}
