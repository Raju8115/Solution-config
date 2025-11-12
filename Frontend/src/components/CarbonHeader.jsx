import React, { useState } from "react";
import {
  UserAvatar,
  Logout,
  User,
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
} from "@carbon/react";
import { useNavigate } from "react-router-dom";
import IBMLogo from "../images/ibm-logo-black.png";

const roles = [
  { id: "seller", label: "Seller" },
  { id: "solution-architect", label: "Solution Architect" },
  { id: "brand-sales-and-renewal-rep", label: "Brand Sales and Renewal Rep" },
  { id: "deal-maker", label: "Deal Maker" },
];

export function CarbonHeader({
  onLogout,
  userRole,
  onRoleChange,
  currentPage,
  onToggleSidebar,
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate(); // ✅ React Router navigation hook

  // Get user display info based on role
  const getUserInfo = () => {
    switch (userRole) {
      case "admin":
        return { name: "Admin User", email: "admin@ibm.com" };
      case "solution-architect":
        return { name: "Solution Architect", email: "architect@ibm.com" };
      case "brand-sales-and-renewal-rep":
        return { name: "Brand Sales Rep", email: "brand-sales@ibm.com" };
      case "deal-maker":
        return { name: "Deal Maker", email: "deal-maker@ibm.com" };
      default:
        return { name: "Sales User", email: "seller@ibm.com" };
    }
  };

  const userInfo = getUserInfo();

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
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              onClick={() => navigate("/catalog")} // clickable logo
            >
              <img
                src={IBMLogo}
                alt="IBM Logo"
                style={{
                  height: "1.7rem",
                  width: "auto",
                  objectFit: "contain",
                  background: "transparent",
                  cursor: "pointer",
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
              <HeaderMenuItem
                onClick={() => navigate("/catalog")}
                isActive={currentPage === "catalog"}
              >
                Catalog
              </HeaderMenuItem>

              {(userRole === "solution-architect" || userRole === "admin") && (
                <HeaderMenuItem
                  onClick={() => navigate("/solution-builder")}
                  isActive={currentPage === "solution-builder"}
                >
                  Solution Builder
                </HeaderMenuItem>
              )}

              {userRole === "admin" && (
                <>
                  <HeaderMenuItem
                    onClick={() => navigate("/admin")}
                    isActive={currentPage === "admin"}
                  >
                    Admin
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    onClick={() => navigate("/import-export")}
                    isActive={currentPage === "import-export"}
                  >
                    Import/Export
                  </HeaderMenuItem>
                </>
              )}
            </HeaderNavigation>

            {/* Right Section */}
            <HeaderGlobalBar>
              {/* Role Selector Placeholder (commented out) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "0.5rem",
                  minWidth: "220px",
                }}
              ></div>

              {/* User Menu */}
              <HeaderGlobalAction
                aria-label="User"
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
                  {/* User Info */}
                  <div
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                        color: "#161616",
                      }}
                    >
                      {userInfo.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#525252",
                      }}
                    >
                      {userInfo.email}
                    </p>
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
                    Profile
                  </SwitcherItem>

                  <SwitcherDivider />

                  <SwitcherItem
                    onClick={() => {
                      onLogout();
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
      <style>{`
        /* Center navigation on desktop */
        @media (min-width: 1056px) {
          .custom-header-nav {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
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

        /* Adjust user menu panel positioning */
        .cds--header-panel {
          right: 0;
        }

        /* Reduce spacing in HeaderGlobalBar */
        .cds--header__global > * {
          margin-left: 0;
        }
      `}</style>
    </>
  );
}
