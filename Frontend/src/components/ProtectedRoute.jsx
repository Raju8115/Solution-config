import { React } from 'react';
import { useAuth } from '../contexts/AuthContexts';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireSolutionArchitect = false  
}) => {
  const { isAuthenticated, userRoles, loading } = useAuth();

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
  
  // Check admin requirement
  if (requireAdmin && !userRoles.is_admin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You need <strong>Administrator</strong> access to view this page.</p>
        <p>Please contact your administrator to request access to the Admin BlueGroup.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  // Check solution architect requirement (admins also have this access)
  if (requireSolutionArchitect && !userRoles.is_solution_architect && !userRoles.is_admin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You need <strong>Solution Architect</strong> access to view this page.</p>
        <p>Please contact your administrator to request access to the Solution Architect BlueGroup.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
