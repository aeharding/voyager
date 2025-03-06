import { IonIcon, IonLoading } from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import { useContext, useImperativeHandle } from "react";

import { ShareImageContext } from "#/features/share/asImage/ShareAsImage";

import useCommentActions, { CommentActionsProps } from "./useCommentActions";

import styles from "./CommentEllipsis.module.css";

export type CommentEllipsisHandle = Pick<
  ReturnType<typeof useCommentActions>,
  "present"
>;

interface CommentEllipsisProps extends CommentActionsProps {
  ref: React.RefObject<CommentEllipsisHandle | undefined>;
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
      <IonIcon
        className={styles.icon}
        icon={ellipsisHorizontal}
        onClick={(e) => {
          present();
          e.stopPropagation();
        }}
      />
    </>
  );
}
