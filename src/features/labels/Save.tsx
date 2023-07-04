import { useAppSelector } from "../../store";
import styled from "@emotion/styled";

const Marker = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;

  --size: 18px;

  width: 0;
  height: 0;
  border-left: var(--size) solid transparent;
  border-right: 0 solid transparent;

  border-bottom: var(--size) solid var(--ion-color-success);
`;

interface SaveProps {
  type: "comment" | "post";
  id: number;
  savedFromServer: boolean;
}

export default function Save({ type, id, savedFromServer }: SaveProps) {
  const savedById = useAppSelector((state) =>
    type === "comment"
      ? state.comment.commentSavedById
      : state.post.postSavedById
  );

  const mySaved = savedById[id] ?? savedFromServer;

  return mySaved ? <Marker /> : null;
}
