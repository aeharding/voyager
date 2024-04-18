import { timeOutline } from "ionicons/icons";
import Stat from "./Stat";
import { css } from "@linaria/core";

export default function TimeStat(
  props: Omit<React.ComponentProps<typeof Stat>, "icon" | "iconClassName">,
) {
  return (
    <Stat
      {...props}
      icon={timeOutline}
      iconClassName={css`
        margin: -1px; // slightly more padding than happyOutline looks off in comparison
      `}
    />
  );
}
