import Dexie from "dexie";

import InAppExternalLink from "#/features/shared/InAppExternalLink";
import { isAppleDeviceInstallable } from "#/helpers/device";
import { useAppSelector } from "#/store";

export default function AppErrorModal() {
  const errors = useAppSelector((state) => state.settings.errors);

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

  // Sometimes Dexie will return a MissingAPIError,
  // sometimes it will return a DatabaseClosedError with MissingAPIError in the message
  const isMissingDBAPI =
    errors.database?.name === Dexie.errnames.MissingAPI ||
    errors.database?.message?.startsWith("MissingAPIError");

  const title = (() => {
    if (errors.unsupportedSystemWebview) return "Outdated System Webview";

    if (errors.database)
      return "There was an issue setting up Voyager&apos;s database";

    return "Unknown error";
  })();

  const body = (() => {
    if (errors.unsupportedSystemWebview) {
      return (
        <>
          <p>
            Your device is running an outdated version of System Webview{" "}
            <i>{errors.unsupportedSystemWebview}</i>.
          </p>
          <p>
            Keeping your system webview up to date is important for security,
            performance and compatibility.{" "}
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.webview"
              target="_blank"
              rel="noopener noreferrer"
            >
              Update via the Google Play Store
            </a>
            .
          </p>
        </>
      );
    }

    if (isAppleDeviceInstallable() && isMissingDBAPI) {
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

    if (
      (errors.database?.name === Dexie.errnames.DatabaseClosed ||
        errors.database?.name === Dexie.errnames.Unknown) &&
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

    return <p>Please {reportText}</p>;
  })();

  return (
    <div className="ion-padding">
      <h3>{title}</h3>

      {body}

      {errors.database && (
        <p>
          Error:{" "}
          <code>
            [{errors.database.name}] {errors.database.message}
          </code>
        </p>
      )}

      {errors.unsupportedSystemWebview && (
        <p>
          Error:{" "}
          <code>
            Unsupported system webview:{" "}
            <code>{errors.unsupportedSystemWebview}</code>
          </code>
        </p>
      )}
    </div>
  );
}
