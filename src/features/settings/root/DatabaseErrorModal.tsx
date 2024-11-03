import Dexie from "dexie";

import InAppExternalLink from "#/features/shared/InAppExternalLink";
import { isAppleDeviceInstallable } from "#/helpers/device";
import { useAppSelector } from "#/store";

export default function DatabaseErrorModal() {
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
      (databaseError?.name === Dexie.errnames.DatabaseClosed ||
        databaseError?.name === Dexie.errnames.Unknown) &&
      isAppleDeviceInstallable()
    ) {
      return (
        <>
          <p>
            To fix this issue,{" "}
            <strong>
              please force close the app and reopen, or restart your device.
            </strong>{" "}
            Until then, app settings and features may not work properly.
          </p>
          <p>
            This error occurs due to a{" "}
            <strong>regression (bug) in Apple&apos;s software</strong> that they
            have not fixed yet. For the latest information, please{" "}
            <InAppExternalLink
              href="https://bugs.webkit.org/show_bug.cgi?id=277615"
              target="_blank"
              rel="noopener noreferrer"
            >
              visit this issue in the Apple Safari bug tracker.
            </InAppExternalLink>
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
            Non-critical settings will be forgotten when the app relaunches.
          </p>

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

      {body}

      {databaseError && (
        <p>
          Error: <code>{databaseError.message}</code>
        </p>
      )}
    </div>
  );
}
