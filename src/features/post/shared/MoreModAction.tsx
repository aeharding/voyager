import { IonButton, IonIcon } from "@ionic/react";
import { PostView } from "lemmy-js-client";
import { ActionButton } from "../actions/ActionButton";
import useCanModerate, {
  ModeratorRole,
  getModColor,
  getModIcon,
} from "../../moderation/useCanModerate";
import usePostModActions from "../../moderation/usePostModActions";
import { useContext } from "react";
import { InFeedContext } from "../../feed/Feed";

interface MoreActionsProps {
  post: PostView;
  className?: string;
  solidIcon?: boolean;
}

export default function MoreModActions(props: MoreActionsProps) {
  const canModerate = useCanModerate(props.post.community);

  if (!canModerate) return;

  return <Actions {...props} role={canModerate} />;
}

interface ActionsProps extends MoreActionsProps {
  role: ModeratorRole;
}

function Actions({ post, solidIcon, className, role }: ActionsProps) {
  const presentPostModActions = usePostModActions(post);
  const inFeed = useContext(InFeedContext);
  const Button = inFeed ? ActionButton : IonButton;

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          presentPostModActions();
        }}
        className={className}
      >
        <IonIcon icon={getModIcon(role, solidIcon)} color={getModColor(role)} />
      </Button>
    </>
  );
}
