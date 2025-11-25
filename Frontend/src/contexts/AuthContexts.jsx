import { createContext, useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState({
    is_admin: false,
    is_solution_architect: false,
    has_catalog_access: true
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const loginAttempted = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      checkAuthAndLoadRole();
    }, 200); // 200ms delay to allow cookie to settle
  }, []);


    const fetchUserProfile = async (w3id) => {
    try {
      const res = await axios.get(
        `https://w3-unified-profile-api.ibm.com/v3/profiles/${w3id}/profile`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const profileData = {
        w3id: w3id,
        name: res.data?.content?.nameDisplay || "",
        email: res.data?.key || w3id,
        location: res.data?.content?.address?.business?.location || "",
        phoneNumber: res.data?.content?.telephone?.mobile || "",
        joiningDate: res.data?.content?.startDate || "",
      };

      return profileData;
    } catch (err) {
      console.error("Failed to fetch IBM W3 profile:", err);
      return null;
    }
  };

const checkAuthAndLoadRole = async () => {
  try {
    // ✅ Add small delay to ensure cookie is set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const authStatus = await authService.checkAuth();
    console.log("Auth status:", authStatus);

    if (authStatus?.authenticated) {
      const { user: userData, roles } = await authService.getUserWithRoles();
      
      setUser(userData);
      setUserRoles(roles);

      const profile = await fetchUserProfile(userData.email);
      if (profile) setUserProfile(profile);

      return;
    }

    // Not authenticated
    setUser(null);
    setUserProfile(null);

    // ✅ Check if we're returning from OAuth callback
    const isCallback = window.location.pathname.includes('/catalog') && 
                      !loginAttempted.current;

    if (isCallback) {
      console.log("⚠️ Just returned from callback but not authenticated - retrying...");
      // Wait a bit longer for session to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const retryAuth = await authService.checkAuth();
      if (retryAuth?.authenticated) {
        const { user: userData, roles } = await authService.getUserWithRoles();
        setUser(userData);
        setUserRoles(roles);
        return;
      }
    }

    // Trigger login only once
    if (!loginAttempted.current) {
      loginAttempted.current = true;
      console.log("Triggering login...");
      setTimeout(() => authService.login(), 400);
    }
  } catch (error) {
    console.error("Auth check failed:", error);
  } finally {
    setLoading(false);
  }
};


  const login = async () => {
    await authService.login();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserRoles({
      is_admin: false,
      is_solution_architect: false,
      has_catalog_access: true
    });
    setUserProfile(null);
    localStorage.removeItem("userRoles");
  };

  const value = {
    user,
    userRoles, // ✅ BlueGroup-based roles from backend
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAdmin: userRoles.is_admin,
    isSolutionArchitect: userRoles.is_solution_architect,
    hasCatalogAccess: userRoles.has_catalog_access,
    login,
    logout,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};