import { SocietyType } from "@/types/society";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialStateType = {
  society: SocietyType | null;
};

const initialState: InitialStateType = {
  society: null,
};

const societySlice = createSlice({
  name: "society-slice",
  initialState,
  reducers: {
    setSociety: (state, action: PayloadAction<{ society: SocietyType }>) => {
      state.society = action.payload.society;
      return state;
    },
    clearSociety: (state, action: PayloadAction<undefined>) => {
      state.society = null;
      return state;
    },
  },
});

export const { setSociety, clearSociety } = societySlice.actions;
export const societyReducer = societySlice.reducer;
