import { configureStore } from "@reduxjs/toolkit";
import { hiAnimeApi } from "./slices/hiAnimeApi";
import { yumaApi } from "./slices/yumaApi";

const store = configureStore({
  reducer: {
    [hiAnimeApi.reducerPath]: hiAnimeApi.reducer,
    [yumaApi.reducerPath]: yumaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      hiAnimeApi.middleware,
      yumaApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
