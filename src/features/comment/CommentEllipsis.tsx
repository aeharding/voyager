import { ellipsisHorizontal } from "ionicons/icons";
import useCommentActions, { CommentActionsProps } from "./useCommentActions";
import { IonIcon, IonLoading } from "@ionic/react";
import { useContext, useImperativeHandle } from "react";
import { styled } from "@linaria/react";
import { ShareImageContext } from "../share/asImage/ShareAsImage";

const StyledIonIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

export type CommentEllipsisHandle = Pick<
  ReturnType<typeof useCommentActions>,
  "present"
>;

interface CommentEllipsisProps extends CommentActionsProps {
  ref: React.RefObject<CommentEllipsisHandle>;
}

export default function CommentEllipsis({
  ref,
  ...props
}: CommentEllipsisProps) {
  const { present, loading } = useCommentActions(props);
  const { capturing } = useContext(ShareImageContext);

  useImperativeHandle(
    ref,
    () => ({
      present,
    }),
    [present],
  );

  if (capturing) return; // Hide ellipsis during image capture

  return (
    <>
      <IonLoading isOpen={loading} />
      <StyledIonIcon
        icon={ellipsisHorizontal}
        onClick={(e) => {
          present();
          e.stopPropagation();
        }}
      />
    </>
  );
}
