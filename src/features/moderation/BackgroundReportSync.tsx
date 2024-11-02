import { useEffect } from "react";
import { syncReports } from "./modSlice";
import { useAppDispatch } from "../../store";
import { useDocumentVisibility, useInterval } from "@mantine/hooks";

export const REPORT_SYNC_INTERVAL_IN_SECONDS = 600;

export default function BackgroundReportSync() {
  const documentState = useDocumentVisibility();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (documentState === "hidden") return;

    dispatch(syncReports());
  }, [documentState, dispatch]);

  useInterval(
    () => {
      if (documentState === "hidden") return;

      dispatch(syncReports());
    },
    1_000 * REPORT_SYNC_INTERVAL_IN_SECONDS,
    { autoInvoke: true },
  );

  return null;
}
