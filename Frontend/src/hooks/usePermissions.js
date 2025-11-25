import { useAuth } from "../contexts/AuthContexts";

export const usePermissions = () => {
  const { userRoles } = useAuth();

  return {
    // View permissions (all authenticated users)
    canViewCatalog: userRoles.has_catalog_access,
    
    // Solution Architect permissions
    canBuildSolutions: userRoles.is_solution_architect || userRoles.is_admin,
    canLinkActivities: userRoles.is_solution_architect || userRoles.is_admin,
    canUpdateSequence: userRoles.is_solution_architect || userRoles.is_admin,
    
    // Admin permissions (only)
    canEditActivities: userRoles.is_admin,
    canEditOfferings: userRoles.is_admin,
    canEditPricing: userRoles.is_admin,
    canEditStaffing: userRoles.is_admin,
    canEditWBS: userRoles.is_admin,
    canEditBrands: userRoles.is_admin,
    canEditProducts: userRoles.is_admin,
    canEditCountries: userRoles.is_admin,
    canDeleteActivities: userRoles.is_admin,
    canDeleteOfferings: userRoles.is_admin,
    
    // Role checks
    isAdmin: userRoles.is_admin,
    isSolutionArchitect: userRoles.is_solution_architect,
    hasCatalogAccess: userRoles.has_catalog_access,
  };
};