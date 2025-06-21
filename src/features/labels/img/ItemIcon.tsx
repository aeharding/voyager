import { useState } from "react";
import { Community, Person } from "threadiverse";

import CachedImg from "#/features/media/CachedImg";
import FakeIcon from "#/features/shared/FakeIcon";
import { cx } from "#/helpers/css";

import styles from "./ItemIcon.module.css";

interface ItemIconProps {
  item: Community | Person | string;
  size?: number;
  className?: string;
  slot?: string;
}

export default function ItemIcon({
  item,
  size,
  className,
  slot,
}: ItemIconProps) {
  const [failed, setFailed] = useState(false);

  size = size ?? 28;

  if (typeof item === "string")
    return (
      <FakeIcon
        seed={item}
        name={item}
        className={className}
        size={size}
        slot={slot}
      />
    );

  const icon = "posting_restricted_to_mods" in item ? item.icon : item.avatar;

  if (icon && !failed)
    return (
      <CachedImg
        style={{ width: `${size}px`, height: `${size}px` }}
        src={icon}
        pictrsOptions={{
          size,
        }}
        onError={() => {
          setFailed(true);
        }}
        className={cx(styles.subImgIcon, className)}
        slot={slot}
      />
    );

  return (
    <FakeIcon
      seed={item.id}
      name={item.name}
      className={className}
      size={size}
      slot={slot}
    />
  );
}
