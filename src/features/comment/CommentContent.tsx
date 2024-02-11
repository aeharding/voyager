import { Comment, Post } from "lemmy-js-client";
import { useMemo } from "react";
import CommentMarkdown from "./CommentMarkdown";
import CommentLinks from "./links/CommentLinks";
import { useAppSelector } from "../../store";
import { IonIcon } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { styled } from "@linaria/react";

const TrashIconContainer = styled.span`
  padding-inline-start: 0.4em;
  vertical-align: middle;
`;

interface CommentContentProps {
  item: Comment | Post;
  showTouchFriendlyLinks?: boolean;
  isMod?: boolean;
}

export default function CommentContent({
  item,
  isMod,
  showTouchFriendlyLinks = true,
}: CommentContentProps) {
  const touchFriendlyLinks = useAppSelector(
    (state) => state.settings.general.comments.touchFriendlyLinks,
  );

  const content = useMemo(() => {
    if (item.deleted)
      return (
        <p>
          <i>deleted by creator</i>
          <TrashIconContainer>
            <IonIcon icon={trashOutline} />
          </TrashIconContainer>
        </p>
      );
    if (item.removed && !isMod)
      return (
        <p>
          <i>removed by moderator</i>
          <TrashIconContainer>
            <IonIcon icon={trashOutline} />
          </TrashIconContainer>
        </p>
      );

    return (
      <>
        <CommentMarkdown>
          {"content" in item ? item.content : item.body ?? item.name}
        </CommentMarkdown>
        {showTouchFriendlyLinks && touchFriendlyLinks && (
          <CommentLinks
            markdown={"content" in item ? item.content : item.body ?? item.name}
          />
        )}
      </>
    );
  }, [item, showTouchFriendlyLinks, touchFriendlyLinks, isMod]);

  return content;
}
