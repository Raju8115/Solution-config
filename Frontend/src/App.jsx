import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContexts';
import ProtectedRoute from './components/ProtectedRoute';
import { OfferingsCatalog } from './components/OfferingsCatalog';
import { OfferingDetail } from './components/OfferingDetail';
import { SolutionBuilder } from './components/SolutionBuilder';
import { UserProfile } from './components/UserProfile';
import { CarbonHeader } from './components/CarbonHeader';

const AuthenticatedLayout = ({ children }) => {
  const { logout, userRole, changeRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/'); // fallback safeguard
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <CarbonHeader
        onLogout={logout}
        userRole={userRole}
        onRoleChange={changeRole}
      />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <OfferingsCatalog />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/offering/:offeringId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <OfferingDetail />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/solution-builder"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <SolutionBuilder />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <UserProfile />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
