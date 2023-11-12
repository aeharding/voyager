import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../../store";
import {
  BiometricAuth,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth";

interface BiometricState {
  checkResult: CheckBiometryResult | undefined;
  loadingCheckResult: boolean;
}

const initialState: BiometricState = {
  checkResult: undefined,
  loadingCheckResult: false,
};

export const biometricSlice = createSlice({
  name: "appIcon",
  initialState,
  reducers: {
    checkResultLoading: (state) => {
      state.loadingCheckResult = true;
    },
    setCheckResult: (state, action: PayloadAction<CheckBiometryResult>) => {
      state.checkResult = action.payload;
      state.loadingCheckResult = false;
    },
  },
});

// Action creators are generated for each case reducer function
const { checkResultLoading, setCheckResult } = biometricSlice.actions;

export default biometricSlice.reducer;

export const biometricSupportedSelector = (state: RootState) =>
  !!state.biometric.checkResult?.isAvailable;

export const primaryBiometricTypeSelector = (state: RootState) =>
  state.biometric.checkResult?.biometryType;

export const retrieveBiometricTypeIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().biometric.checkResult) return;

    dispatch(checkResultLoading());

    const result = await BiometricAuth.checkBiometry();

    dispatch(setCheckResult(result));
  };
