import styled from "@emotion/styled";
import { IonIcon, useIonAlert } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { Comment } from "lemmy-js-client";
import { useAppDispatch } from "../../store";
import { modRemoveComment } from "../comment/commentSlice";

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  font-size: 0.875rem;

  padding: 6px 0;
  margin-bottom: 10px;
  border-radius: 6px;

  text-align: center;

  background: red;
  color: white;
`;

interface RemovedByBannerProps {
  modState: ItemModState;
  item: Comment;
}

export default function RemovedByBanner({
  modState,
  item,
}: RemovedByBannerProps) {
  const [present] = useIonAlert();
  const dispatch = useAppDispatch();

  if (modState === ItemModState.None) return;

  function onClickModRemovedPopup() {
    present("Removed by mod", [
      { text: "OK" },
      {
        text: "Approve",
        handler: async () => {
          dispatch(modRemoveComment(item.id, false));
        },
      },
    ]);
  }

  return (
    <Banner
      onClick={(e) => {
        e.stopPropagation();
        onClickModRemovedPopup();
      }}
    >
      <IonIcon icon={trashOutline} /> Removed by mod
    </Banner>
  );
}

export enum ItemModState {
  RemovedByMod,
  Flagged,
  None,
}

export function getItemModState(item: Comment): ItemModState {
  if (item.removed) return ItemModState.RemovedByMod;

  return ItemModState.None;
}

export function getModStateBackgroundColor(
  modState: ItemModState,
): string | undefined {
  switch (modState) {
    case ItemModState.Flagged:
      return "rgba(255, 255, 0, 0.3)";
    case ItemModState.RemovedByMod:
      return "rgba(255, 0, 0, 0.3)";
    case ItemModState.None:
      return undefined;
  }
}
