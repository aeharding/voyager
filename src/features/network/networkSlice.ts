import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ConnectionType, Network } from "@capacitor/network";

interface NetworkState {
  connectionType: ConnectionType;
}

const initialState: NetworkState = {
  connectionType: "unknown",
};

export const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getConnectionType.fulfilled, (state, action) => {
      state.connectionType = action.payload;
    });
  },
});

export default networkSlice.reducer;

export const getConnectionType = createAsyncThunk(
  "network/getConnectionType",
  async () => {
    const { connectionType } = await Network.getStatus();

    return connectionType;
  },
);
