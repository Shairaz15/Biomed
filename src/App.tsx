import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/common";
import { Landing, Dashboard, Tests, MemoryAssessment } from "./pages";
import { ReactionTimeTest } from "./components/tests/reaction/ReactionTimeTest";
import { PatternAssessment } from "./components/tests/pattern/PatternAssessment";
import { LanguageAssessment } from "./components/tests/language/LanguageAssessment";
import { Settings } from "./pages/Settings";
import { Demo } from "./pages/Demo";
// Admin pages
import { AdminDashboard } from "./admin/pages/AdminDashboard";
import { UserManagement } from "./admin/pages/UserManagement";
import { Analytics } from "./admin/pages/Analytics";
import { ModelMonitoring } from "./admin/pages/ModelMonitoring";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<Demo />} />

          {/* Protected Routes (authenticated users) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedRoute>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/memory"
            element={
              <ProtectedRoute>
                <MemoryAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/reaction"
            element={
              <ProtectedRoute>
                <ReactionTimeTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/pattern"
            element={
              <ProtectedRoute>
                <PatternAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/language"
            element={
              <ProtectedRoute>
                <LanguageAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (admin users only) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <Analytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/models"
            element={
              <AdminRoute>
                <ModelMonitoring />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
