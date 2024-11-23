import styles from "./AppDetails.module.css";
import AppVersionInfo from "./AppVersionInfo";

export default function AppDetails() {
  return (
    <div className={styles.container}>
      <img src="/logo.png" alt="" />
      <div>
        Voyager <AppVersionInfo verbose betaAs="aside" />
        <aside>by Alexander Harding</aside>
      </div>
    </div>
  );
}
