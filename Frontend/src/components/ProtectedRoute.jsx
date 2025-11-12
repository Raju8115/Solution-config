import { React } from 'react';
import { useAuth } from '../contexts/AuthContexts';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // 🔹 Redirect directly to backend IBM W3ID login endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/login`
    return null;
  }

  return children;
};

export default ProtectedRoute;
