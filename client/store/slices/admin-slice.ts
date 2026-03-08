import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AdminType } from "@/types/admin";

type InitialStateType = {
  admin: AdminType | null;
  loading: boolean;
};

const initialState: InitialStateType = {
  admin: null,
  loading: false,
};

export const adminSlice = createSlice({
  name: "admin-slice",
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<{ admin: AdminType }>) => {
      state.admin = action.payload.admin;
      return state;
    },
    clearAdmin: (state, action: PayloadAction<undefined>) => {
      state.admin = null;
      return state;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      return state;
    },
  },
});

export const { setAdmin, clearAdmin, setLoading } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
