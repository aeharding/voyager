import { styled } from "@linaria/react";

export const BottomContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  --topPadding: 4rem;
`;

export const BottomContainerActions = styled.div<{ withBg: boolean }>`
  width: 100%;

  padding: 1rem;
  padding-top: var(--topPadding);
  padding-bottom: calc(
    1rem + var(--ion-safe-area-bottom, env(safe-area-inset-bottom, 0))
  );

  color: white;
  background: ${({ withBg }) =>
    withBg ? "linear-gradient(0deg, rgba(0, 0, 0, 1), transparent)" : "none"};

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;
