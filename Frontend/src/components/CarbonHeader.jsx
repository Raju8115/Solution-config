import React, { useState } from "react";
import {
  UserAvatar,
  Logout,
  User,
  Checkmark,
} from "@carbon/icons-react";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Switcher,
  SwitcherItem,
  SwitcherDivider,
  SkipToContent,
  HeaderMenuItem,
  Tag,
} from "@carbon/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { usePermissions } from "../hooks/usePermissions";
import IBMLogo from "../images/ibm-logo-black.png";

export function CarbonHeader({ onToggleSidebar }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Add this to detect current route
  
  const { user, userRoles, userProfile, logout } = useAuth();
  const permissions = usePermissions();

  // ✅ Determine active page from current location
  const isActivePage = (path) => {
    if (path === '/catalog') {
      return location.pathname === '/catalog' || location.pathname.startsWith('/offering/');
    }
    return location.pathname.startsWith(path);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get user email
  const getUserEmail = () => {
    if (user?.email) return user.email;
    if (userProfile?.email) return userProfile.email;
    return '';
  };

  return (
    <>
      <HeaderContainer
        render={() => (
          <Header aria-label="IBM Solution & Offerings Tool">
            <SkipToContent />

            {/* Sidebar Toggle for Mobile */}
            {onToggleSidebar && (
              <HeaderMenuButton
                aria-label="Open menu"
                onClick={onToggleSidebar}
                className="cds--header__menu-toggle cds--header__menu-toggle--sm"
              />
            )}

            {/* Logo and Title */}
            <HeaderName
              prefix=""
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
              onClick={() => navigate("/catalog")}
            >
              <img
                src={IBMLogo}
                alt="IBM Logo"
                style={{
                  height: "1.7rem",
                  width: "auto",
                  objectFit: "contain",
                  background: "transparent",
                }}
              />
              <span style={{ fontSize: "0.975rem", whiteSpace: "nowrap" }}>
                Solution & Offerings Tool
              </span>
            </HeaderName>

            {/* Navigation - Centered */}
            <HeaderNavigation
              aria-label="Main Navigation"
              className="custom-header-nav"
            >
              {/* Catalog - Available to all authenticated users */}
              <HeaderMenuItem
                onClick={() => navigate("/catalog")}
                isActive={isActivePage('/catalog')}
              >
                Catalog
              </HeaderMenuItem>

              {/* Solution Builder - Solution Architects & Admins */}
              {permissions.canBuildSolutions && (
                <HeaderMenuItem
                  onClick={() => navigate("/solution-builder")}
                  isActive={isActivePage('/solution-builder')}
                >
                  Solution Builder
                </HeaderMenuItem>
              )}

              {/* Admin - Administrators only */}
              {permissions.isAdmin && (
                <>
                  <HeaderMenuItem
                    onClick={() => navigate("/admin")}
                    isActive={isActivePage('/admin')}
                  >
                    Admin
                  </HeaderMenuItem>
                  {/* <HeaderMenuItem
                    onClick={() => navigate("/import-export")}
                    isActive={isActivePage('/import-export')}
                  >
                    Import/Export
                  </HeaderMenuItem> */}
                </>
              )}
            </HeaderNavigation>

            {/* Right Section */}
            <HeaderGlobalBar>
              {/* User Info & Role Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginRight: "1rem",
                  color: "white",
                }}
              >
                {/* User Name (Hidden on mobile) */}
                <span 
                  style={{ 
                    fontSize: "0.875rem",
                    display: "none",
                  }}
                  className="user-name-desktop"
                >
                  {getUserDisplayName()}
                </span>

                {/* Role Badge */}
                {userRoles.is_admin && (
                  <Tag 
                    type="red" 
                    size="sm"
                    style={{
                      cursor: 'default',
                      fontWeight: 600
                    }}
                  >
                    ADMIN
                  </Tag>
                )}
                {userRoles.is_solution_architect && !userRoles.is_admin && (
                  <Tag 
                    type="blue" 
                    size="sm"
                    style={{
                      cursor: 'default',
                      fontWeight: 600
                    }}
                  >
                    SOLUTION ARCHITECT
                  </Tag>
                )}
              </div>

              {/* User Menu */}
              <HeaderGlobalAction
                aria-label="User Menu"
                tooltipAlignment="end"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                isActive={isUserMenuOpen}
              >
                <UserAvatar size={20} />
              </HeaderGlobalAction>

              <HeaderPanel
                aria-label="User Menu"
                expanded={isUserMenuOpen}
                onHeaderPanelFocus={() => setIsUserMenuOpen(true)}
              >
                <Switcher aria-label="User Menu">
                  {/* User Info Section */}
                  <div
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#161616",
                        }}
                      >
                        {getUserDisplayName()}
                      </p>
                      {/* Role Badge in dropdown */}
                      {userRoles.is_admin && (
                        <Tag type="red" size="sm">ADMIN</Tag>
                      )}
                      {userRoles.is_solution_architect && !userRoles.is_admin && (
                        <Tag type="blue" size="sm">ARCHITECT</Tag>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#525252",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {getUserEmail()}
                    </p>

                    {/* Permissions Display */}
                    <div style={{ 
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #e0e0e0',
                      fontSize: '0.75rem',
                      color: '#525252'
                    }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Your Access:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Checkmark size={16} style={{ color: '#24a148' }} />
                          <span>View Catalog</span>
                        </div>
                        {permissions.canBuildSolutions && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkmark size={16} style={{ color: '#24a148' }} />
                            <span>Build Solutions</span>
                          </div>
                        )}
                        {permissions.isAdmin && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkmark size={16} style={{ color: '#24a148' }} />
                            <span>Full Admin Access</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <SwitcherItem
                    onClick={() => {
                      navigate("/user-profile");
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <User size={16} />
                    View Profile
                  </SwitcherItem>

                  <SwitcherDivider />

                  <SwitcherItem
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#da1e28",
                    }}
                  >
                    <Logout size={16} />
                    Sign out
                  </SwitcherItem>
                </Switcher>
              </HeaderPanel>
            </HeaderGlobalBar>
          </Header>
        )}
      />

      {/* Custom Styles */}
      {/* Custom Styles */}
<style>{`
  /* ✅ CRITICAL: Ensure header is always on top with highest z-index */
  .cds--header {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    z-index: 9999 !important;
  }

  /* Header panel (dropdown) should be just below header */
  .cds--header-panel {
    right: 0;
    z-index: 9998 !important;
    top: 48px !important;
  }

  /* Center navigation on desktop */
  @media (min-width: 1056px) {
    .custom-header-nav {
      position: absolute !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
    }
    
    .user-name-desktop {
      display: inline !important;
    }
  }

  /* Hide sidebar toggle on desktop */
  @media (min-width: 1056px) {
    .cds--header__menu-toggle--sm {
      display: none;
    }
  }

  /* Reset navigation position on mobile/tablet */
  @media (max-width: 1055px) {
    .custom-header-nav {
      position: static !important;
      transform: none !important;
    }
  }

  /* Reduce spacing in HeaderGlobalBar */
  .cds--header__global > * {
    margin-left: 0.25rem;
  }

  /* Improve role badge visibility */
  .cds--header__global .cds--tag {
    font-size: 0.6875rem;
    padding: 0.125rem 0.5rem;
    height: auto;
    min-height: 1.25rem;
  }

  /* User menu hover effects */
  .cds--switcher__item:hover {
    background-color: #e0e0e0;
  }

  /* Clickable logo cursor */
  .cds--header__name {
    cursor: pointer;
  }
`}</style>
    </>
  );
}