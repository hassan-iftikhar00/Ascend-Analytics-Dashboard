import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import { DashboardPage } from "./pages/Dashboard";
import { OperationsPage } from "./pages/Operations";
import { SettingsPage } from "./pages/Settings";
import { ROUTES } from "./config/routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.OPERATIONS} element={<OperationsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route
            path="/"
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
          <Route
            path="*"
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
