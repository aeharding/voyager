import { styled } from "@linaria/react";
import { IonChip } from "@ionic/react";
import { SERVERS_BY_CATEGORY, ServerCategory } from "../data/servers";
import { css } from "@linaria/core";

const Container = styled.div`
  display: flex;

  overflow: auto;

  padding-left: 8px;
  padding-right: 8px;

  > * {
    flex-shrink: 0;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const selectedChipStyles = css`
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
`;
const CATEGORIES = Object.keys(SERVERS_BY_CATEGORY) as ServerCategory[];

interface FiltersProps {
  hasRecommended: boolean;
  category: ServerCategory;
  setCategory: (category: ServerCategory) => void;
}

export default function Filters({
  hasRecommended,
  category,
  setCategory,
}: FiltersProps) {
  return (
    <Container
      onTouchMoveCapture={(e) => {
        // Prevent page swipes
        e.stopPropagation();
        return true;
      }}
    >
      {hasRecommended && (
        <IonChip
          className={
            category === "recommended" ? selectedChipStyles : undefined
          }
          outline={category !== "recommended"}
          onClick={() => setCategory("recommended")}
        >
          recommended
        </IonChip>
      )}
      {CATEGORIES.map((c) => (
        <IonChip
          className={category === c ? selectedChipStyles : undefined}
          key={c}
          outline={category !== c}
          onClick={() => setCategory(c)}
        >
          {c}
        </IonChip>
      ))}
    </Container>
  );
}
