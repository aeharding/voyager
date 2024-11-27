import { timeOutline } from "ionicons/icons";

import Stat from "./Stat";

import styles from "./TimeStat.module.css";

export default function TimeStat(
  props: Omit<React.ComponentProps<typeof Stat>, "icon" | "iconClassName">,
) {
  return <Stat {...props} icon={timeOutline} iconClassName={styles.icon} />;
}
