import styled from "@emotion/styled";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 3rem 3rem 4rem;
  font-size: 0.875em;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
`;

interface EndPostProps {
  empty?: boolean;
  communityName?: string;
}

export default function EndPost({ empty, communityName }: EndPostProps) {
  const feedName = communityName ? `c/${communityName}` : "this feed";

  function renderError() {
    if (empty)
      return <>Nothing to see here — {feedName} is completely empty.</>;

    return <>You&apos;ve reached the end!</>;
  }

  return <Container>{renderError()}</Container>;
}
