import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "@/types/user";

type InitialStateType = {
  user: UserType | null;
  loading: boolean;
};

const initialState: InitialStateType = {
  user: null,
  loading: false,
};

export const userSlice = createSlice({
  name: "user-slice",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserType }>) => {
      state.user = action.payload.user;
      return state;
    },
    clearUser: (state, action: PayloadAction<undefined>) => {
      state.user = null;
      return state;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      return state;
    },
  },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;
export const userReducer = userSlice.reducer;
