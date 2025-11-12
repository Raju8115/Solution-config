import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("seller");
  const [userProfile, setUserProfile] = useState(null); // ✅ Added state for user profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadRole();
  }, []);

  // ✅ Combined function: authenticate and fetch IBM W3 role
  const checkAuthAndLoadRole = async () => {
    try {
      const authStatus = await authService.checkAuth();
      if (authStatus.authenticated) {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Get W3ID (use email from backend user info)
        const w3id = userData.email;
        if (w3id) {
          // ✅ Fetch user profile
          const profile = await fetchUserProfile(w3id);
          // console.log(profile)
          if (profile) {
            setUserProfile(profile);
          }

          // ✅ Fetch user role
          let role = await fetchUserRoleFromW3(w3id);
          if (role) {
            // ***************************CHANGE ON PRODUCTION***********************************
            role = "solution-architect";
            // normalize role format
            const normalizedRole = normalizeRole(role);
            setUserRole(normalizedRole);
            localStorage.setItem("userRole", normalizedRole);
          }
        }
      } else {
        // Not authenticated
        setUser(null);
        setUserRole("seller");
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Auth or role fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: async typo and return value
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
      
      // console.log("✅ User Profile Data:", res.data);
      
      // ✅ Extract and return relevant user details
      const profileData = {
        w3id: w3id,
        name: res.data?.content?.nameDisplay || "",
        email: res.data?.key || w3id,
        // jobTitle: res.data?.content?.jobTitle || "",
        // businessTitle: res.data?.content?.businessTitle || "",
        // department: res.data?.content?.department || "",
        location: res.data?.content?.address?.business?.location || "",
        phoneNumber: res.data?.content?.telephone?.mobile || "",
        joiningDate: res.data?.content?.startDate || "",
        // manager: res.data?.content?.managerName || "",
        // division: res.data?.content?.division || "",
        // country: res.data?.content?.country || "",
        // Add any other fields you need
      };

      return profileData;
    } catch (err) {
      console.error("Failed to fetch IBM W3 profile:", err);
      return null; // ✅ Fixed: null instead of None
    }
  };

  // ✅ Fetch role from IBM Unified Profile API
  const fetchUserRoleFromW3 = async (w3id) => {
    try {
      const res = await axios.get(
        `https://w3-unified-profile-api.ibm.com/v3/profiles/${w3id}/profile_extended`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Example: extract job info from API response
      const jobData = res.data?.content?.jobRoles?.[0] || {};
      const role =
        jobData.employeeType ||
        jobData.jobRole ||
        jobData.businessTitle ||
        "seller"; // fallback
      console.log("✅ Raw IBM W3 Role:", role);
      return role;
    } catch (err) {
      console.error("Failed to fetch IBM W3 role:", err);
      return "seller"; // fallback
    }
  };

  // ✅ Normalize role string (convert to lowercase, replace spaces with "-")
  const normalizeRole = (role) => {
    if (!role) return "seller";
    return role.trim().toLowerCase().replace(/\s+/g, "-");
  };

  // ✅ Login / Logout
  const login = async () => {
    await authService.login();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserRole("seller");
    setUserProfile(null); // ✅ Clear user profile on logout
    localStorage.removeItem("userRole");
  };

  const changeRole = (newRole) => {
    const normalizedRole = normalizeRole(newRole);
    setUserRole(normalizedRole);
    localStorage.setItem("userRole", normalizedRole);
  };

  const value = {
    user,
    userRole,
    userProfile, // ✅ Expose user profile
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    changeRole,
    fetchUserProfile, // ✅ Expose function if needed elsewhere
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