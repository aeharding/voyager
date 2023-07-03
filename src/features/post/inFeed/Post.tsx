import { PostView } from "lemmy-js-client";
import LargePost from "./large/LargePost";
import { useAppSelector } from "../../../store";
import CompactPost from "./compact/CompactPost";
import SlidingVote from "../../shared/sliding/SlidingPostVote";
import { IonItem } from "@ionic/react";
import styled from "@emotion/styled";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { getHandle } from "../../../helpers/lemmy";

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --border-width: 0;
  --border-style: none;
  --background-hover: none;
`;

export interface PostProps {
  post: PostView;

  /**
   * Hide the community name, show author name
   */
  communityMode?: boolean;

  className?: string;
}

export default function Post(props: PostProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const postAppearanceType = useAppSelector(
    (state) => state.appearance.posts.type
  );

  const postBody = (() => {
    switch (postAppearanceType) {
      case "large":
        return <LargePost {...props} />;
      case "compact":
        return <CompactPost {...props} />;
    }
  })();

  return (
    <SlidingVote item={props.post} className={props.className}>
      {/* href=undefined: Prevent drag failure on firefox */}
      <CustomIonItem
        detail={false}
        routerLink={buildGeneralBrowseLink(
          `/c/${getHandle(props.post.community)}/comments/${props.post.post.id}`
        )}
        href={undefined}
      >
        {postBody}
      </CustomIonItem>
    </SlidingVote>
  );
}
