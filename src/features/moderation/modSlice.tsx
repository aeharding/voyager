import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isBefore, subSeconds } from "date-fns";
import { groupBy } from "es-toolkit";
import { CommentReport, PostReport } from "lemmy-js-client";

import { clientSelector, jwtSelector } from "#/features/auth/authSelectors";
import { AppDispatch, RootState } from "#/store";

import { REPORT_SYNC_INTERVAL_IN_SECONDS } from "./BackgroundReportSync";

interface PostState {
  commentReports: CommentReport[];
  postReports: PostReport[];
  reportSyncState: "init" | "syncing" | "synced";
  reportSyncTimestamp: number;
}

const initialState: PostState = {
  commentReports: [],
  postReports: [],
  reportSyncState: "init",
  reportSyncTimestamp: 0,
};

export const modSlice = createSlice({
  name: "mod",
  initialState,
  reducers: {
    sync: (state) => {
      state.reportSyncState = "syncing";
    },
    syncComplete: (state) => {
      state.reportSyncState = "synced";
      state.reportSyncTimestamp = Date.now();
    },
    syncFail: (state) => {
      if (state.reportSyncState === "syncing") state.reportSyncState = "init";
    },
    receivedCommentReports: (state, action: PayloadAction<CommentReport[]>) => {
      state.commentReports = action.payload;
    },
    receivedPostReports: (state, action: PayloadAction<PostReport[]>) => {
      state.postReports = action.payload;
    },
    resolvedCommentReport: (state, action: PayloadAction<CommentReport>) => {
      state.commentReports = state.commentReports.filter(
        (r) => r.id !== action.payload.id,
      );
    },
    resolvedPostReport: (state, action: PayloadAction<PostReport>) => {
      state.postReports = state.postReports.filter(
        (r) => r.id !== action.payload.id,
      );
    },
    resetMod: () => initialState,
  },
});

export default modSlice.reducer;

const {
  sync,
  syncComplete,
  syncFail,
  receivedPostReports,
  receivedCommentReports,
  resolvedCommentReport,
  resolvedPostReport,
} = modSlice.actions;
export const { resetMod } = modSlice.actions;

export const reportsByCommentIdSelector = createSelector(
  [(state: RootState) => state.mod.commentReports],
  (reports) => {
    return groupBy(reports, (r) => r.comment_id);
  },
);

export const reportsByPostIdSelector = createSelector(
  [(state: RootState) => state.mod.postReports],
  (reports) => {
    return groupBy(reports, (r) => r.post_id);
  },
);

const REPORT_LIMIT = 50;

// All this logic can be removed when the following resolved:
// 1. https://github.com/LemmyNet/lemmy/issues/4163
// 2. https://github.com/LemmyNet/lemmy/issues/4190

export const syncReports =
  (force = false) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    // If not forced refresh, only refresh every 10 minutes
    const syncThreshold = subSeconds(
      new Date(),
      REPORT_SYNC_INTERVAL_IN_SECONDS,
    );

    if (!force && !isBefore(getState().mod.reportSyncTimestamp, syncThreshold))
      return;

    const jwt = jwtSelector(getState());

    if (!jwt) return;

    const syncState = getState().mod.reportSyncState;

    switch (syncState) {
      case "syncing":
        break;
      case "init":
      case "synced": {
        dispatch(sync());

        await syncCommentReports();
        await syncPostReports();

        dispatch(syncComplete());
      }
    }

    async function syncCommentReports() {
      let page = 1;
      const cumulatedReports: CommentReport[] = [];

      while (true) {
        let reports;

        try {
          const results = await clientSelector(getState()).listCommentReports({
            limit: REPORT_LIMIT,
            page,
            unresolved_only: true,
          });

          reports = results.comment_reports;
        } catch (e) {
          dispatch(syncFail());
          throw e;
        }

        cumulatedReports.push(...reports.map((r) => r.comment_report));

        if (reports.length !== REPORT_LIMIT || page > 10) {
          dispatch(receivedCommentReports(cumulatedReports));
          break;
        }

        page++;
      }
    }

    async function syncPostReports() {
      let page = 1;
      const cumulatedReports: PostReport[] = [];

      while (true) {
        let reports;

        try {
          const results = await clientSelector(getState()).listPostReports({
            limit: REPORT_LIMIT,
            page,
            unresolved_only: true,
          });

          reports = results.post_reports;
        } catch (e) {
          dispatch(syncFail());
          throw e;
        }

        cumulatedReports.push(...reports.map((r) => r.post_report));

        if (reports.length !== REPORT_LIMIT || page > 10) {
          dispatch(receivedPostReports(cumulatedReports));
          break;
        }

        page++;
      }
    }
  };

export const resolveCommentReport =
  (commentId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const reports = reportsByCommentIdSelector(getState())[commentId];
    const client = clientSelector(getState());

    if (!reports) return;

    for (const report of reports) {
      await client.resolveCommentReport({
        report_id: report.id,
        resolved: true,
      });
      dispatch(resolvedCommentReport(report));
    }
  };

export const resolvePostReport =
  (postId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const reports = reportsByPostIdSelector(getState())[postId];
    const client = clientSelector(getState());

    if (!reports) return;

    for (const report of reports) {
      await client.resolvePostReport({
        report_id: report.id,
        resolved: true,
      });
      dispatch(resolvedPostReport(report));
    }
  };
