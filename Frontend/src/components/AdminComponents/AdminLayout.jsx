import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Content,
  Grid,
  Column,
  Tile,
  Button,
  InlineNotification,
  SkeletonPlaceholder,
  SkeletonText,
} from '@carbon/react';
import {
  Category,
  Enterprise,
  Product,
  Globe,
  Currency,
  User,
  Task,
  Table as TableIcon,
  Settings,
  Dashboard,
  ChevronLeft,
  ChevronRight,
} from '@carbon/icons-react';

// Import the new admin service
import adminService from '../../services/adminService';

import './AdminLayout.scss';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [stats, setStats] = useState({
    totalBrands: 0,
    totalProducts: 0,
    totalOfferings: 0,
    totalCountries: 0,
    totalActivities: 0,
    totalPricing: 0,
    totalStaffing: 0,
    totalWBS: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isActive = (path) => location.pathname.startsWith(path);
  const isAdminHome = location.pathname === '/admin' || location.pathname === '/admin/';

  // Toggle side nav expansion
  const toggleSideNav = () => {
    setIsSideNavExpanded(!isSideNavExpanded);
  };

  // Fetch dashboard stats using the optimized endpoint
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdminHome) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Single API call instead of 8 separate calls!
        const data = await adminService.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdminHome]);

  // Skeleton Stat Card Component
  const SkeletonStatCard = ({ size = 'large' }) => (
    <Tile className={`stat-tile ${size === 'small' ? 'stat-tile--config' : ''}`}>
      <div className="stat-icon">
        <SkeletonPlaceholder className="skeleton-icon" />
      </div>
      <div className="stat-content">
        <SkeletonText heading width="60%" className="skeleton-number" />
        <SkeletonText width="40%" className="skeleton-label" />
      </div>
      <div className="skeleton-button">
        <SkeletonPlaceholder className="skeleton-button-placeholder" />
      </div>
    </Tile>
  );

  // Stat Card Component
  const StatCard = ({ icon: Icon, number, label, onClick, className, buttonText = 'Manage' }) => (
    <Tile className={`stat-tile ${className}`}>
      <div className="stat-icon">
        <Icon size={className === 'stat-tile--config' ? 24 : 32} />
      </div>
      <div className="stat-content">
        <h3 className={`stat-number ${className === 'stat-tile--config' ? 'stat-number--small' : ''}`}>
          {number}
        </h3>
        <p className="stat-label">{label}</p>
      </div>
      <Button
        kind="ghost"
        size="sm"
        onClick={onClick}
        className="stat-action"
      >
        {buttonText}
      </Button>
    </Tile>
  );

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div className="admin-dashboard-overview">
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          lowContrast
        />
      )}
      
      <Grid className="dashboard-grid" narrow>
        <Column lg={16} md={8} sm={4}>
          <h2 className="dashboard-title">Admin Dashboard</h2>
          <p className="dashboard-subtitle">
            Manage your catalog data, offerings, and configurations
          </p>
        </Column>

        {/* Primary Stats Cards - Catalog */}
        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard />
          ) : (
            <StatCard
              icon={Enterprise}
              number={stats.totalBrands}
              label="Brands"
              onClick={() => navigate('/admin/brands')}
              className="stat-tile--primary"
            />
          )}
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard />
          ) : (
            <StatCard
              icon={Product}
              number={stats.totalProducts}
              label="Products"
              onClick={() => navigate('/admin/products')}
              className="stat-tile--secondary"
            />
          )}
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard />
          ) : (
            <StatCard
              icon={Category}
              number={stats.totalOfferings}
              label="Offerings"
              onClick={() => navigate('/admin/offerings')}
              className="stat-tile--tertiary"
            />
          )}
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard />
          ) : (
            <StatCard
              icon={Globe}
              number={stats.totalCountries}
              label="Countries"
              onClick={() => navigate('/admin/countries')}
              className="stat-tile--quaternary"
            />
          )}
        </Column>

        {/* Configuration Stats Row */}
        <Column lg={16} md={8} sm={4}>
          <h3 className="section-title">Configuration Summary</h3>
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard size="small" />
          ) : (
            <StatCard
              icon={Task}
              number={stats.totalActivities}
              label="Activities"
              onClick={() => navigate('/admin/activities')}
              className="stat-tile--config"
              buttonText="View"
            />
          )}
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard size="small" />
          ) : (
            <StatCard
              icon={Currency}
              number={stats.totalPricing}
              label="Pricing Rules"
              onClick={() => navigate('/admin/pricing')}
              className="stat-tile--config"
              buttonText="View"
            />
          )}
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard size="small" />
          ) : (
            <StatCard
              icon={User}
              number={stats.totalStaffing}
              label="Staffing Configs"
              onClick={() => navigate('/admin/staffing')}
              className="stat-tile--config"
              buttonText="View"
            />
          )}
        </Column>

        <Column lg={4} md={4} sm={4}>
          {loading ? (
            <SkeletonStatCard size="small" />
          ) : (
            <StatCard
              icon={TableIcon}
              number={stats.totalWBS}
              label="WBS Items"
              onClick={() => navigate('/admin/wbs')}
              className="stat-tile--config"
              buttonText="View"
            />
          )}
        </Column>

        {/* Quick Actions Section */}
        <Column lg={16} md={8} sm={4} className="quick-actions-section">
          <h3 className="section-title">Quick Actions</h3>
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <Tile className="action-tile">
                <h4>Catalog Management</h4>
                <p>Manage core catalog entities like brands, products, and offerings</p>
                <div className="action-buttons">
                  <Button
                    kind="tertiary"
                    size="sm"
                    onClick={() => navigate('/admin/brands/create')}
                    renderIcon={Enterprise}
                  >
                    Add Brand
                  </Button>
                  <Button
                    kind="tertiary"
                    size="sm"
                    onClick={() => navigate('/admin/products/create')}
                    renderIcon={Product}
                  >
                    Add Product
                  </Button>
                  <Button
                    kind="tertiary"
                    size="sm"
                    onClick={() => navigate('/admin/offerings/create')}
                    renderIcon={Category}
                  >
                    Add Offering
                  </Button>
                </div>
              </Tile>
            </Column>

            <Column lg={8} md={4} sm={4}>
              <Tile className="action-tile">
                <h4>Configuration</h4>
                <p>Set up activities, pricing, staffing, and WBS configurations</p>
                <div className="action-buttons">
                  <Button
                    kind="tertiary"
                    size="sm"
                    onClick={() => navigate('/admin/activities/create')}
                    renderIcon={Task}
                  >
                    Add Activity
                  </Button>
                  <Button
                    kind="tertiary"
                    size="sm"
                    onClick={() => navigate('/admin/pricing/create')}
                    renderIcon={Currency}
                  >
                    Add Pricing
                  </Button>
                  <Button
                    kind="tertiary"
                    size="sm"
                    onClick={() => navigate('/admin/staffing/create')}
                    renderIcon={User}
                  >
                    Add Staffing
                  </Button>
                </div>
              </Tile>
            </Column>
          </Grid>
        </Column>
      </Grid>
    </div>
  );

  return (
    <div className="admin-layout-container">
      {/* Collapsible Side Navigation */}
      <SideNav
        isFixedNav
        expanded={isSideNavExpanded}
        isChildOfHeader={false}
        aria-label="Admin Navigation"
        className={`admin-sidenav ${isSideNavExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="sidenav-header">
          <Dashboard size={24} />
          {isSideNavExpanded && <span className="sidenav-title">Admin Panel</span>}
        </div>

        <SideNavItems>
          {/* Dashboard Home */}
          <SideNavLink
            renderIcon={Dashboard}
            onClick={() => navigate('/admin')}
            isActive={isAdminHome}
          >
            Dashboard
          </SideNavLink>

          {/* Catalog Section */}
          <SideNavMenu
            renderIcon={Category}
            title="Catalog"
            defaultExpanded={isActive('/admin/brands') || isActive('/admin/products') || isActive('/admin/offerings')}
          >
            <SideNavMenuItem
              onClick={() => navigate('/admin/brands')}
              isActive={isActive('/admin/brands')}
            >
              Brands {!loading && `(${stats.totalBrands})`}
            </SideNavMenuItem>
            <SideNavMenuItem
              onClick={() => navigate('/admin/products')}
              isActive={isActive('/admin/products')}
            >
              Products {!loading && `(${stats.totalProducts})`}
            </SideNavMenuItem>
            <SideNavMenuItem
              onClick={() => navigate('/admin/offerings')}
              isActive={isActive('/admin/offerings')}
            >
              Offerings {!loading && `(${stats.totalOfferings})`}
            </SideNavMenuItem>
          </SideNavMenu>

          {/* Configuration Section */}
          <SideNavMenu
            renderIcon={Settings}
            title="Configuration"
            defaultExpanded={isActive('/admin/activities') || isActive('/admin/pricing') || isActive('/admin/staffing') || isActive('/admin/wbs')}
          >
            <SideNavMenuItem
              onClick={() => navigate('/admin/activities')}
              isActive={isActive('/admin/activities')}
            >
              Activities {!loading && `(${stats.totalActivities})`}
            </SideNavMenuItem>
            <SideNavMenuItem
              onClick={() => navigate('/admin/pricing')}
              isActive={isActive('/admin/pricing')}
            >
              Pricing {!loading && `(${stats.totalPricing})`}
            </SideNavMenuItem>
            <SideNavMenuItem
              onClick={() => navigate('/admin/staffing')}
              isActive={isActive('/admin/staffing')}
            >
              Staffing {!loading && `(${stats.totalStaffing})`}
            </SideNavMenuItem>
            <SideNavMenuItem
              onClick={() => navigate('/admin/wbs')}
              isActive={isActive('/admin/wbs')}
            >
              WBS {!loading && `(${stats.totalWBS})`}
            </SideNavMenuItem>
          </SideNavMenu>

          {/* Location Section */}
          <SideNavLink
            renderIcon={Globe}
            onClick={() => navigate('/admin/countries')}
            isActive={isActive('/admin/countries')}
          >
            Countries {!loading && `(${stats.totalCountries})`}
          </SideNavLink>
        </SideNavItems>

        {/* Toggle Button */}
        <div className="sidenav-toggle">
          <Button
            hasIconOnly
            iconDescription={isSideNavExpanded ? 'Collapse' : 'Expand'}
            kind="ghost"
            size="sm"
            onClick={toggleSideNav}
            renderIcon={isSideNavExpanded ? ChevronLeft : ChevronRight}
          />
        </div>
      </SideNav>

      {/* Main Content Area */}
      <Content className={`admin-content ${isSideNavExpanded ? 'nav-expanded' : 'nav-collapsed'}`}>
        {isAdminHome ? <DashboardOverview /> : <Outlet />}
      </Content>
    </div>
  );
}
