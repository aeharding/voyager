import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BiometricLock,
  BiometricLockConfiguration,
  BiometricMethodResult,
} from "capacitor-biometric-lock";

import { isAppleDeviceInstalledToHomescreen, isNative } from "#/helpers/device";
import { AppDispatch, RootState } from "#/store";

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
    checkResultFailed: (state) => {
      state.loadingCheckResult = false;
    },
    setCheckResult: (state, action: PayloadAction<BiometricMethodResult>) => {
      state.checkResult = action.payload;
      state.loadingCheckResult = false;
    },
    loadingConfig: (state) => {
      state.loadingConfig = true;
    },
    loadingConfigFailed: (state) => {
      state.loadingConfig = false;
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
  checkResultFailed,
  setCheckResult,
  loadingConfig,
  loadingConfigFailed,
  receivedConfig,
  setBiometricsEnabled,
  setBiometricsTimeoutInSeconds,
} = biometricSlice.actions;

export default biometricSlice.reducer;

export const biometricSupportedSelector = (state: RootState) =>
  !!state.biometric.checkResult?.biometricMethod;

export const primaryBiometricTypeSelector = (state: RootState) =>
  state.biometric.checkResult?.biometricMethod;

export const retrieveBiometricTypeIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().biometric.checkResult) return;

    dispatch(refreshBiometricType());
  };

export const refreshBiometricType = () => async (dispatch: AppDispatch) => {
  dispatch(checkResultLoading());

  let result;

  try {
    result = await BiometricLock.getBiometricMethod();
  } catch (error) {
    dispatch(checkResultFailed());
    throw error;
  }

  dispatch(setCheckResult(result));
};

export const retrieveBiometricLockConfigIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    if (state.biometric.config || state.biometric.loadingConfig) return;

    dispatch(loadingConfig());

    let result;

    try {
      result = await BiometricLock.getConfiguration();
    } catch (error) {
      dispatch(loadingConfigFailed());
      throw error;
    }

    dispatch(receivedConfig(result));
  };

export const initializeBiometricSliceDataIfNeeded =
  () => async (dispatch: AppDispatch) => {
    // Only supported on native iOS
    if (!isNative() || !isAppleDeviceInstalledToHomescreen()) return;

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
