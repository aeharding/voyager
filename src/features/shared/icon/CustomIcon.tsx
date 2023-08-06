import styled from "@emotion/styled";
import bold from "./icons/bold.svg";

const Container = styled.div`
  width: 1rem;
`;

interface CustomIconProps {
  icon: "italic" | "bold";
}

export default function CustomIcon({ icon: iconName }: CustomIconProps) {
  return <Container>{bold}</Container>;
}
