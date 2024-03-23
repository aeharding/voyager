import { styled } from "@linaria/react";

export default styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ color }) => color};
`;
