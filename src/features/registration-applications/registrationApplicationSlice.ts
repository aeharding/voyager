import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RegistrationApplicationView } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, jwtSelector } from "../auth/authSlice";

interface CommentState {
  applications: Array<RegistrationApplicationView>;
}

const initialState: CommentState = {
  applications: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    receivedApplications: (
      state,
      action: PayloadAction<RegistrationApplicationView[]>
    ) => {
      const newApplications = action.payload;
      const newUniqueApplications = newApplications.filter(
        (newApplication) =>
          !state.applications.some(
            (application) =>
              application.registration_application.id ===
              newApplication.registration_application.id
          )
      );

      state.applications = [...state.applications, ...newUniqueApplications];
    },

    acceptedApplication: (
      state,
      action: PayloadAction<RegistrationApplicationView>
    ) => {
      const newApplication = action.payload;
      const oldApplicationIndex = state.applications.findIndex(
        (application) =>
          application.registration_application.id ===
          newApplication.registration_application.id
      );

      if (oldApplicationIndex !== -1) {
        state.applications = [
          ...state.applications.slice(0, oldApplicationIndex),
          newApplication,
          ...state.applications.slice(oldApplicationIndex + 1),
        ];
      } else {
        state.applications = [...state.applications, newApplication];
      }
    },

    resetApplications: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { receivedApplications, acceptedApplication, resetApplications } =
  userSlice.actions;

export default userSlice.reducer;

export const getApplications =
  (unreadOnly = true) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    if (!jwt) {
      dispatch(resetApplications());
      return;
    }

    const applicationsResponse = await clientSelector(
      getState()
    ).listRegistrationApplications({
      auth: jwt,
      unread_only: unreadOnly,
    });

    dispatch(
      receivedApplications(applicationsResponse.registration_applications)
    );

    return applicationsResponse;
  };
