import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CustomClassNameSetup";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import store from "./store";
import palette from "./theme/palette";
import router from "./routes";
import MainLoadingScreen from "./components/MainLoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Global error logging
      console.error('Global Error:', error, errorInfo);
      
      // In production, you could send this to an error reporting service
      if (import.meta.env.PROD) {
        // Example: Sentry.captureException(error, { extra: errorInfo });
      }
    }}
  >
    <Provider store={store}>
      <React.StrictMode>
        <ThemeProvider theme={createTheme({ palette })}>
          <RouterProvider
            router={router}
            fallbackElement={<MainLoadingScreen />}
          />
        </ThemeProvider>
      </React.StrictMode>
    </Provider>
  </ErrorBoundary>
);
