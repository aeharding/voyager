import { ConnectionType, Network } from "@capacitor/network";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NetworkState {
  connectionType: ConnectionType;
}

const initialState: NetworkState = {
  connectionType: "unknown",
};

export const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    updateConnectionType(state, action: PayloadAction<ConnectionType>) {
      state.connectionType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConnectionType.fulfilled, (state, action) => {
      state.connectionType = action.payload;
    });
  },
});

export const { updateConnectionType } = networkSlice.actions;

export default networkSlice.reducer;

export const getConnectionType = createAsyncThunk(
  "network/getConnectionType",
  async () => {
    const { connectionType } = await Network.getStatus();

    return connectionType;
  },
);
