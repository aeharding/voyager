import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../../store";
import {
  BiometricLock,
  BiometricLockConfiguration,
  BiometricMethod,
  BiometricMethodResult,
} from "capacitor-biometric-lock";

interface BiometricState {
  checkResult: BiometricMethodResult | undefined;
  loadingCheckResult: boolean;
  config: BiometricLockConfiguration | undefined;
  loadingConfig: boolean;
}

const initialState: BiometricState = {
  checkResult: undefined,
  loadingCheckResult: false,
  config: undefined,
  loadingConfig: false,
};

export const biometricSlice = createSlice({
  name: "appIcon",
  initialState,
  reducers: {
    checkResultLoading: (state) => {
      state.loadingCheckResult = true;
    },
    setCheckResult: (state, action: PayloadAction<BiometricMethodResult>) => {
      state.checkResult = action.payload;
      state.loadingCheckResult = false;
    },
    loadingConfig: (state) => {
      state.loadingConfig = true;
    },
    receivedConfig: (
      state,
      action: PayloadAction<BiometricLockConfiguration>,
    ) => {
      state.config = action.payload;
      state.loadingConfig = false;
    },
    setBiometricsEnabled: (state, action: PayloadAction<boolean>) => {
      if (!state.config) return;

      state.config.enabled = action.payload;

      updateCapacitorBiometricConfig(state.config);
    },
    setBiometricsTimeoutInSeconds: (state, action: PayloadAction<number>) => {
      if (!state.config) return;

      state.config.timeoutInSeconds = action.payload;

      updateCapacitorBiometricConfig(state.config);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  checkResultLoading,
  setCheckResult,
  loadingConfig,
  receivedConfig,
  setBiometricsEnabled,
  setBiometricsTimeoutInSeconds,
} = biometricSlice.actions;

export default biometricSlice.reducer;

export const biometricSupportedSelector = (state: RootState) =>
  state.biometric.checkResult?.biometricMethod !== BiometricMethod.none;

export const primaryBiometricTypeSelector = (state: RootState) =>
  state.biometric.checkResult?.biometricMethod;

export const retrieveBiometricTypeIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().biometric.checkResult) return;

    dispatch(refreshBiometricType());
  };

export const refreshBiometricType = () => async (dispatch: AppDispatch) => {
  dispatch(checkResultLoading());

  const result = await BiometricLock.getBiometricMethod();

  dispatch(setCheckResult(result));
};

export const retrieveBiometricLockConfigIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().biometric.config) return;

    dispatch(loadingConfig());

    const result = await BiometricLock.getConfiguration();

    dispatch(receivedConfig(result));
  };

export const initializeBiometricSliceDataIfNeeded =
  () => async (dispatch: AppDispatch) => {
    dispatch(retrieveBiometricTypeIfNeeded());
    dispatch(retrieveBiometricLockConfigIfNeeded());
  };

function updateCapacitorBiometricConfig(config: BiometricLockConfiguration) {
  BiometricLock.configure({
    ...config,
    appName: "Voyager",
    retryButtonColor: "#0e7afe",
  });
}
