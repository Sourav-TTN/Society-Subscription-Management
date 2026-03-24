import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialStateType = {
  gotNew: boolean;
};

const initialState: InitialStateType = {
  gotNew: false,
};

const notificationSlice = createSlice({
  name: "notification-slice",
  initialState,
  reducers: {
    updateNotification: (state, action: PayloadAction<boolean>) => {
      state.gotNew = action.payload;
    },
  },
});

export const { updateNotification } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
