import styled from "@emotion/styled";
import { Community, Person } from "lemmy-js-client";
import FakeIcon from "../../shared/FakeIcon";

const SubImgIcon = styled.img<{ size: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  border-radius: 50%;
`;

interface ItemIconProps {
  item: Community | Person;
  size?: number;
  className?: string;
}

export default function ItemIcon({ item, size, className }: ItemIconProps) {
  size = size ?? 28;

  const icon = "posting_restricted_to_mods" in item ? item.icon : item.avatar;

  if (icon) return <SubImgIcon src={icon} size={size} className={className} />;

  return (
    <FakeIcon
      seed={item.id}
      name={item.name}
      className={className}
      size={size}
    />
  );
}
