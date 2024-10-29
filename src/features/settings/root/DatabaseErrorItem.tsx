import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  useIonModal,
} from "@ionic/react";
import { IconBg } from "../../../routes/pages/settings/SettingsPage";
import { alert } from "ionicons/icons";
import { css } from "@linaria/core";
import { useAppSelector } from "../../../store";
import { isAppleDeviceInstallable } from "../../../helpers/device";
import InAppExternalLink from "../../shared/InAppExternalLink";
import Dexie from "dexie";

export default function DatabaseErrorItem() {
  const [presentPreview] = useIonModal(WarningModal);

  function present() {
    presentPreview({
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: css`
        --height: auto;
      `,
    });
  }

  return (
    <IonList inset>
      <IonItem onClick={present}>
        <IconBg color="color(display-p3 1 0.7 0)" size="1.2" slot="start">
          <IonIcon icon={alert} />
        </IconBg>
        <IonLabel>Error — App limited</IonLabel>
        <IonBadge color="danger">!</IonBadge>
      </IonItem>
    </IonList>
  );
}

function WarningModal() {
  const databaseError = useAppSelector((state) => state.settings.databaseError);

  const reportText = (
    <>
      report the issue on{" "}
      <InAppExternalLink
        href="https://github.com/aeharding/voyager/issues"
        target="_blank"
        rel="noopener noreferrer"
      >
        Voyager&apos;s bug tracker
      </InAppExternalLink>
      .
    </>
  );

  const body = (() => {
    if (
      databaseError?.name === Dexie.errnames.DatabaseClosed &&
      isAppleDeviceInstallable()
    ) {
      return (
        <>
          <p>
            This error occurs due to an <strong>Apple bug regression</strong>{" "}
            that has not been fixed yet. For more information, please
            <InAppExternalLink
              href="https://bugs.webkit.org/show_bug.cgi?id=277615"
              target="_blank"
              rel="noopener noreferrer"
            >
              visit this ticket on Apple&apos;s Safari bug tracker.
            </InAppExternalLink>
          </p>
          <p>
            To fix this issue,{" "}
            <strong>
              please force close the app and reopen, or restart your device.
            </strong>
          </p>
          <p>
            If you are still seeing this error message after force closing the
            app, please {reportText}
          </p>
        </>
      );
    }

    if (isAppleDeviceInstallable()) {
      return (
        <>
          <p>
            This error occurs in <strong>Lockdown Mode</strong> because certain
            functionality is disabled that Voyager depends on.{" "}
            <strong>Please make sure Lockdown Mode is turned off</strong> so
            Voyager can function properly. For more information on Lockdown
            Mode,{" "}
            <InAppExternalLink
              href="https://support.apple.com/en-us/105120"
              target="_blank"
              rel="noopener noreferrer"
            >
              please visit apple.com.
            </InAppExternalLink>
          </p>
          <p>
            If you are still seeing this error message after verifying Lockdown
            Mode is turned off, please {reportText}
          </p>
        </>
      );
    }

    return <p>Please {reportText}</p>;
  })();

  return (
    <div className="ion-padding">
      <h3>There was an issue setting up Voyager&apos;s database.</h3>

      <p>Non-critical settings will be forgotten when the app relaunches.</p>

      {body}

      {databaseError && (
        <p>
          Error: <code>{databaseError.message}</code>
        </p>
      )}
    </div>
  );
}
