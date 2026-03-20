import { userReducer } from "./slices/user-slice";
import { configureStore } from "@reduxjs/toolkit";
import { adminReducer } from "./slices/admin-slice";
import { societyReducer } from "./slices/society-slice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    adminReducer,
    societyReducer,
    userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
