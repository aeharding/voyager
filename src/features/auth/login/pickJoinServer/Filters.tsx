import styled from "@emotion/styled";
import { IonChip } from "@ionic/react";
import { SERVERS_BY_CATEGORY, ServerCategory } from "./whitelist";
import { css } from "@emotion/react";

const Container = styled.div`
  display: flex;

  overflow: auto;

  padding-left: 8px;
  padding-right: 8px;

  > * {
    flex-shrink: 0;
  }
`;

const Chip = styled(IonChip)<{ selected?: boolean }>`
  ${({ selected }) =>
    selected &&
    css`
      --background: var(--ion-color-primary);
      --color: var(--ion-color-primary-contrast);
    `}
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
    <Container>
      {hasRecommended && (
        <Chip
          outline={category !== "recommended"}
          selected={category === "recommended"}
          onClick={() => setCategory("recommended")}
        >
          recommended
        </Chip>
      )}
      {CATEGORIES.map((c) => (
        <Chip
          key={c}
          outline={category !== c}
          selected={category === c}
          onClick={() => setCategory(c)}
        >
          {c}
        </Chip>
      ))}
    </Container>
  );
}
