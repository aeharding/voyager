import { ellipsisHorizontal } from "ionicons/icons";
import useCommentActions, { CommentActionsProps } from "./useCommentActions";
import { ActionButton } from "../post/actions/ActionButton";
import { IonIcon, IonLoading } from "@ionic/react";
import { forwardRef, useImperativeHandle } from "react";
import { styled } from "@linaria/react";

const StyledIonIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

export type CommentEllipsisHandle = Pick<
  ReturnType<typeof useCommentActions>,
  "present"
>;

export default forwardRef<CommentEllipsisHandle, CommentActionsProps>(
  function CommentEllipsis(props, ref) {
    const { present, loading } = useCommentActions(props);

    useImperativeHandle(
      ref,
      () => ({
        present,
      }),
      [present],
    );

    return (
      <>
        <IonLoading isOpen={loading} />
        <ActionButton>
          <StyledIonIcon
            icon={ellipsisHorizontal}
            onClick={(e) => {
              present();
              e.stopPropagation();
            }}
          />
        </ActionButton>
      </>
    );
  },
);
