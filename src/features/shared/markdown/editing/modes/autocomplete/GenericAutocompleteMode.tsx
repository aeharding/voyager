import { styled } from "@linaria/react";
import { useDebouncedCallback } from "@mantine/hooks";
import { Community } from "lemmy-js-client";
import { useEffect, useState } from "react";

import { getHandle } from "#/helpers/lemmy";

import { SharedModeProps as GenericModeProps } from "../DefaultMode";

const Container = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 16px;
  overflow: auto;
  height: 100%;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;
`;

const EmptyItem = styled(Item)`
  color: var(--ion-color-medium);
`;

export interface AutocompleteModeProps extends GenericModeProps {
  match: string;
  index: number;
}

interface GenericAutocompleteModeProps<I> extends AutocompleteModeProps {
  /**
   * Return a search with candidates for a given query
   *
   * @param q Search query
   * @returns Matches for the search
   */
  fetchFn: (q: string) => Promise<I[]>;

  /**
   * Builds the markdown to replace incomplete user input with
   *
   * e.g. a markdown link to user/community etc
   */
  buildMd: (item: I) => string;
}

export default function GenericAutocompleteMode<
  I extends Pick<Community, "id" | "actor_id" | "local" | "name">,
>({
  fetchFn,
  buildMd,
  match,
  index,
  textareaRef,
}: GenericAutocompleteModeProps<I>) {
  const [items, setItems] = useState<I[]>([]);

  const debouncedFetchItems = useDebouncedCallback(async () => {
    if (!match) {
      setItems([]);
      return;
    }

    const items = await fetchFn(match);

    setItems(items);
  }, 500);

  useEffect(() => {
    debouncedFetchItems();
  }, [debouncedFetchItems, fetchFn, match]);

  function select(item: I) {
    const md = `${buildMd(item)} `;

    textareaRef.current?.focus();

    textareaRef.current?.setSelectionRange(index, index + match.length + 1);
    document.execCommand("insertText", false, md);
  }

  return (
    <Container>
      {items.length ? (
        items.map((item) => (
          <Item key={item.id} onClick={() => select(item)}>
            {getHandle(item)}
          </Item>
        ))
      ) : (
        <EmptyItem>{match ? "No results" : "Type for suggestions"}</EmptyItem>
      )}
    </Container>
  );
}
