import { Outlet, useLocation, useNavigation } from "react-router-dom";
import Box from "@mui/material/Box";

import DetailModal from "src/components/DetailModal";
import VideoPortalContainer from "src/components/VideoPortalContainer";
import DetailModalProvider from "src/providers/DetailModalProvider";
import PortalProvider from "src/providers/PortalProvider";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import ErrorBoundary from "src/components/ErrorBoundary";
import ApiErrorBoundary from "src/components/ApiErrorBoundary";
import PerformanceMonitor from "src/components/PerformanceMonitor";

export default function MainLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  // console.log("Nav Stat: ", navigation.state);
  return (
    <ErrorBoundary>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <MainHeader />
        {navigation.state !== "idle" && <MainLoadingScreen />}
        <DetailModalProvider>
          <ApiErrorBoundary message="Failed to load content details">
            <DetailModal />
          </ApiErrorBoundary>
          <PortalProvider>
            <ApiErrorBoundary message="Failed to load page content">
              <Outlet />
            </ApiErrorBoundary>
            <VideoPortalContainer />
          </PortalProvider>
        </DetailModalProvider>
        {location.pathname !== `/${MAIN_PATH.watch}` && <Footer />}
        
        {/* Performance Monitor - only in development */}
        <PerformanceMonitor />
      </Box>
    </ErrorBoundary>
  );
}
