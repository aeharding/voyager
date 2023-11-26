import { useEffect } from "react";
import usePageVisibility from "../../helpers/usePageVisibility";
import { syncReports } from "./modSlice";
import { useInterval } from "usehooks-ts";
import { useAppDispatch } from "../../store";

export const REPORT_SYNC_INTERVAL_IN_SECONDS = 600;

export default function BackgroundReportSync() {
  const pageVisibility = usePageVisibility();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!pageVisibility) return;

    dispatch(syncReports());
  }, [pageVisibility, dispatch]);

  useInterval(() => {
    if (!pageVisibility) return;

    dispatch(syncReports());
  }, 1_000 * REPORT_SYNC_INTERVAL_IN_SECONDS);

  return null;
}
