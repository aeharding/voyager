import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { CommentReport, PostReport } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, jwtSelector } from "../auth/authSlice";
import { groupBy, pullAllBy } from "lodash";

interface PostState {
  commentReports: CommentReport[];
  postReports: PostReport[];
  reportSyncState: "init" | "syncing" | "synced";
}

const initialState: PostState = {
  commentReports: [],
  postReports: [],
  reportSyncState: "init",
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
      pullAllBy(state.commentReports, [action.payload], (r) => r.id);
    },
    resolvedPostReport: (state, action: PayloadAction<PostReport>) => {
      pullAllBy(state.postReports, [action.payload], (r) => r.id);
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

export const syncReports =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    if (!jwt) {
      dispatch(resetMod());
      return;
    }

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

      // eslint-disable-next-line no-constant-condition
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

      // eslint-disable-next-line no-constant-condition
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

    for (const report of reports) {
      await client.resolvePostReport({
        report_id: report.id,
        resolved: true,
      });
      dispatch(resolvedPostReport(report));
    }
  };
