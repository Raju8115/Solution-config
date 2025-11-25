// OfferingDetail.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { usePermissions } from '../hooks/usePermissions';
import {
  Button,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tag,
  Modal,
  Checkbox,
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Tile,
  InlineNotification,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import {
  ArrowLeft,
  Currency,
  Time,
  User,
  Package,
  Document,
  DocumentView,
  Link,
  CheckmarkOutline,
  UserRole,
  Warning,
  Edit,
  TrashCan,
  Add,
  Settings,
} from '@carbon/icons-react';
import { useOfferingDetail } from '../hooks/useOfferingDetail';
import offeringService from '../services/offeringService';
import './OfferingDetail.scss';

// Skeleton Component for Header Section
function OfferingHeaderSkeleton() {
  return (
    <div className="offering-detail__header">
      <div className="offering-detail__header-content">
        <div className="offering-detail__title-section">
          <SkeletonText heading width="60%" className="mb-3" />
          <div className="offering-detail__tags flex gap-2">
            <SkeletonPlaceholder style={{ width: '80px', height: '24px' }} />
            <SkeletonPlaceholder style={{ width: '100px', height: '24px' }} />
            <SkeletonPlaceholder style={{ width: '90px', height: '24px' }} />
          </div>
        </div>

        <div className="offering-detail__price-cards">
          <Tile className="offering-detail__price-tile">
            <div className="offering-detail__price-content">
              <SkeletonPlaceholder style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <SkeletonText width="60%" className="mb-2" />
                <SkeletonText heading width="80%" />
              </div>
            </div>
          </Tile>

          <Tile className="offering-detail__price-tile">
            <div className="offering-detail__price-content">
              <SkeletonPlaceholder style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <SkeletonText width="60%" className="mb-2" />
                <SkeletonText heading width="80%" />
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </div>
  );
}

// Skeleton Component for Data Table
function TableSkeleton({ rows = 5, columns = 8 }) {
  return (
    <div className="offering-detail__table-skeleton">
      <Tile>
        {/* Table Header */}
        <div className="flex gap-4 mb-4 pb-3" style={{ borderBottom: '1px solid #e0e0e0' }}>
          {[...Array(columns)].map((_, i) => (
            <SkeletonText key={i} width={`${100 / columns}%`} />
          ))}
        </div>
        
        {/* Table Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 mb-3">
            {[...Array(columns)].map((_, colIndex) => (
              <div key={colIndex} style={{ width: `${100 / columns}%` }}>
                {colIndex === 2 ? (
                  <SkeletonPlaceholder style={{ width: '80px', height: '24px' }} />
                ) : (
                  <SkeletonText width="90%" />
                )}
              </div>
            ))}
          </div>
        ))}
      </Tile>
    </div>
  );
}

// Skeleton Component for Dashboard Cards
function DashboardSkeleton() {
  return (
    <div className="offering-detail__tab-content">
      {/* Stats Grid */}
      <div className="offering-detail__dashboard-grid offering-detail__dashboard-grid--four mb-6">
        {[...Array(4)].map((_, index) => (
          <Tile key={index} className="offering-detail__stat-tile bg-white">
            <SkeletonText width="60%" className="mb-2" />
            <SkeletonText heading width="50%" />
          </Tile>
        ))}
      </div>

      {/* Section Title */}
      <div className="mb-4">
        <SkeletonText heading width="30%" />
      </div>

      {/* Staffing Grid */}
      <div className="offering-detail__staffing-grid mb-6">
        {[...Array(3)].map((_, index) => (
          <Tile key={index} className="offering-detail__staff-tile bg-white">
            <div className="offering-detail__staff-header mb-4">
              <div style={{ flex: 1 }}>
                <SkeletonText width="70%" className="mb-2" />
                <SkeletonText width="50%" />
              </div>
              <SkeletonPlaceholder style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            </div>
            <div className="offering-detail__staff-stats">
              <div>
                <SkeletonText width="60%" className="mb-1" />
                <SkeletonText heading width="40%" />
              </div>
              <div>
                <SkeletonText width="60%" className="mb-1" />
                <SkeletonText heading width="50%" />
              </div>
            </div>
          </Tile>
        ))}
      </div>

      {/* Another Section Title */}
      <div className="mb-4">
        <SkeletonText heading width="35%" />
      </div>

      {/* Pricing Grid */}
      <div className="offering-detail__dashboard-grid">
        {[...Array(3)].map((_, index) => (
          <Tile key={index} className="offering-detail__phase-tile bg-white">
            <SkeletonPlaceholder style={{ width: '100px', height: '24px', marginBottom: '12px' }} />
            <SkeletonText heading width="60%" className="mb-2" />
            <SkeletonText width="50%" className="mb-3" />
            <div className="offering-detail__phase-stats">
              <div>
                <SkeletonText width="70%" className="mb-1" />
                <SkeletonText heading width="40%" />
              </div>
              <div>
                <SkeletonText width="70%" className="mb-1" />
                <SkeletonText heading width="40%" />
              </div>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
}

// Skeleton Component for Fine Print Tab
function FinePrintSkeleton() {
  return (
    <div className="offering-detail__tab-content bg-white">
      <div className="mb-4">
        <SkeletonText heading width="40%" />
      </div>

      {[...Array(4)].map((_, index) => (
        <Tile key={index} className="offering-detail__fine-print-section mb-4">
          <div className="offering-detail__fine-print-header mb-3">
            <SkeletonPlaceholder style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            <SkeletonText heading width="30%" />
          </div>
          <SkeletonText paragraph lineCount={3} width="100%" />
        </Tile>
      ))}

      <div className="offering-detail__fine-print-footer">
        <Tile className="offering-detail__info-tile">
          <div className="offering-detail__info-item mb-3">
            <SkeletonText width="20%" className="mb-2" />
            <SkeletonPlaceholder style={{ width: '120px', height: '24px' }} />
          </div>
          <div className="offering-detail__info-item">
            <SkeletonText width="25%" className="mb-2" />
            <SkeletonPlaceholder style={{ width: '150px', height: '32px' }} />
          </div>
        </Tile>
      </div>
    </div>
  );
}

// Complete Skeleton for Offering Detail Page
function OfferingDetailSkeleton() {
  return (
    <div className="offering-detail pt-5">
      <div className="offering-detail__container">
        {/* Back Button Skeleton */}
        <div className="mb-4">
          <SkeletonPlaceholder style={{ width: '140px', height: '48px' }} />
        </div>

        {/* Header Skeleton */}
        <OfferingHeaderSkeleton />

        {/* Tabs Skeleton */}
        <div className="mt-6">
          {/* Tab List Skeleton */}
          <div className="flex gap-2 mb-4" style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
            <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
            <SkeletonPlaceholder style={{ width: '120px', height: '40px' }} />
            <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
          </div>

          {/* Tab Content Skeleton */}
          <div className="offering-detail__tab-content">
            <div className="mb-4">
              <SkeletonText heading width="40%" />
            </div>
            <TableSkeleton rows={8} columns={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for Related Offerings Table (ELA Dealmaker)
function RelatedOfferingsSkeleton() {
  return (
    <div className="offering-detail__tab-content">
      <div className="offering-detail__section-header mb-4">
        <SkeletonText heading width="30%" />
      </div>
      <TableSkeleton rows={6} columns={7} />
    </div>
  );
}

// Detailed Information Modal Component
function OfferingDetailModal({ offering, open, onClose }) {
  if (!offering) return null;

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading={offering.offering_name}
      modalLabel={offering.saas_type || 'Offering Details'}
      passiveModal
      size="lg"
    >
      <div className="space-y-6">
        {/* Offering Summary */}
        {offering.offering_summary && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Document size={20} />
              <h4 className="text-heading-03 font-semibold">Summary</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.offering_summary}</p>
          </div>
        )}

        {/* Scope */}
        {offering.scope_summary && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package size={20} />
              <h4 className="text-heading-03 font-semibold">Scope</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.scope_summary}</p>
          </div>
        )}

        {/* Outcomes */}
        {offering.offering_outcomes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckmarkOutline size={20} />
              <h4 className="text-heading-03 font-semibold">Expected Outcomes</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.offering_outcomes}</p>
          </div>
        )}

        {/* Key Deliverables */}
        {offering.key_deliverables && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Document size={20} />
              <h4 className="text-heading-03 font-semibold">Key Deliverables</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.key_deliverables}</p>
          </div>
        )}

        {/* Prerequisites */}
        {offering.prerequisites && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Warning size={20} className="text-yellow-30" />
              <h4 className="text-heading-03 font-semibold">Prerequisites</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.prerequisites}</p>
          </div>
        )}

        {/* Part Number */}
        {offering.part_numbers && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package size={20} />
              <h4 className="text-heading-03 font-semibold">Part Number</h4>
            </div>
            <code className="ml-7 text-body-01 font-mono">{offering.part_numbers}</code>
          </div>
        )}

        {/* Seismic Link */}
        {offering.seismic_link && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link size={20} />
              <h4 className="text-heading-03 font-semibold">Content Resources</h4>
            </div>
            <a
              href={offering.seismic_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-7 text-link-01 flex items-center gap-1 hover:underline"
            >
              View in Seismic <Link size={16} />
            </a>
          </div>
        )}

        {/* Summary */}
        <div className="bg-layer-01 p-4 mt-4">
          <div className="flex justify-between text-body-01 mb-2">
            <span>Duration:</span>
            <span className="font-semibold">{offering.duration || 'N/A'}</span>
          </div>
          {offering.industry && (
            <div className="flex justify-between text-body-01 mb-2">
              <span>Industry:</span>
              <span className="font-semibold">{offering.industry}</span>
            </div>
          )}
          {offering.client_type && (
            <div className="flex justify-between text-body-01">
              <span>Client Type:</span>
              <span className="font-semibold">{offering.client_type}</span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(offering.offering_sales_contact || offering.offering_product_manager) && (
          <div className="bg-layer-01 p-4">
            <h4 className="text-heading-03 font-semibold mb-3">Contact Information</h4>
            {offering.offering_sales_contact && (
              <div className="flex justify-between text-body-01 mb-2">
                <span>Sales Contact:</span>
                <a href={`mailto:${offering.offering_sales_contact}`} className="text-link-01">
                  {offering.offering_sales_contact}
                </a>
              </div>
            )}
            {offering.offering_product_manager && (
              <div className="flex justify-between text-body-01">
                <span>Product Manager:</span>
                <a href={`mailto:${offering.offering_product_manager}`} className="text-link-01">
                  {offering.offering_product_manager}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function OfferingDetail() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { userRoles, userProfile } = useAuth();
  const permissions = usePermissions();

  // Fetch offering details using custom hook
  const { offering, activities, staffing, pricing, loading, error, refetch } = useOfferingDetail(offeringId);

  // State for ELA Dealmaker selections
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedOfferings, setSelectedOfferings] = useState([]);
  
  // Additional data for Deal Maker view
  const [relatedOfferings, setRelatedOfferings] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Business role checks (from user profile, not BlueGroups)
  const isBrandSalesRep = false;
  const isELADealmaker = false;

  // Fetch related offerings for Deal Maker view
  useEffect(() => {
    if (isELADealmaker && offering?.product_id) {
      fetchRelatedOfferings(offering.product_id);
    }
  }, [isELADealmaker, offering?.product_id]);

  const fetchRelatedOfferings = async (productId) => {
    try {
      setLoadingRelated(true);
      const offerings = await offeringService.getOfferings(productId);
      setRelatedOfferings(offerings);
    } catch (err) {
      console.error('Error fetching related offerings:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Handle checkbox toggle for ELA Dealmaker
  const handleOfferingToggle = (offeringId) => {
    setSelectedOfferings(prev => {
      if (prev.includes(offeringId)) {
        return prev.filter(id => id !== offeringId);
      } else {
        return [...prev, offeringId];
      }
    });
  };

  // Admin actions
  const handleEditOffering = () => {
    navigate(`/admin/offerings/edit/${offeringId}`);
  };

  const handleDeleteOffering = async () => {
    if (window.confirm('Are you sure you want to delete this offering? This action cannot be undone.')) {
      try {
        await offeringService.deleteOffering(offeringId);
        navigate('/catalog');
      } catch (err) {
        alert('Failed to delete offering: ' + err.message);
      }
    }
  };

  const handleManageActivities = () => {
    navigate(`/offerings/edit/${offeringId}`);
  };

  // Calculate total for selected offerings
  const calculateSelectedTotal = () => {
    return selectedOfferings.length * 50000;
  };

  // Get block tag type for activities
  const getBlockTagType = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('plan') || categoryLower.includes('assessment')) return 'blue';
    if (categoryLower.includes('implement') || categoryLower.includes('execution')) return 'purple';
    if (categoryLower.includes('deploy') || categoryLower.includes('closeout')) return 'green';
    return 'gray';
  };

  // Format activities for display
  const formattedActivities = activities.map((activity, index) => ({
    activityNumber: index + 1,
    activityId: activity.activity_id,
    activityBlock: activity.category || 'GENERAL',
    activityName: activity.activity_name,
    outcome: activity.outcome || 'Activity outcome',
    effort: activity.effort_hours || activity.duration_hours || 40,
    staffing: `Consultant-B${activity.sequence || 8}`,
    parts: activity.part_numbers || 'N/A',
    price: calculateActivityPrice(activity),
    scope: activity.description || 'Activity scope',
    responsibilities: `${activity.ibm_responsibilities || 'IBM responsibilities'}. ${activity.client_responsibilities || 'Client responsibilities'}`,
    assumptions: activity.assumptions || 'Activity assumptions',
    seismicLink: offering?.seismic_link || '#'
  }));

  // Calculate activity price
  function calculateActivityPrice(activity) {
    const hours = activity.effort_hours || activity.duration_hours || 40;
    const rate = activity.fixed_price || (hours * 430);
    return Math.round(rate);
  }

  // Calculate totals
  const totalEffort = formattedActivities.reduce((sum, activity) => sum + activity.effort, 0);
  const totalPrice = formattedActivities.reduce((sum, activity) => sum + activity.price, 0);

  // Group activities by block
  const groupedByBlock = formattedActivities.reduce((acc, activity) => {
    if (!acc[activity.activityBlock]) {
      acc[activity.activityBlock] = [];
    }
    acc[activity.activityBlock].push(activity);
    return acc;
  }, {});

  // Group by staffing
  const groupedByStaffing = formattedActivities.reduce((acc, activity) => {
    if (!acc[activity.staffing]) {
      acc[activity.staffing] = [];
    }
    acc[activity.staffing].push(activity);
    return acc;
  }, {});

  // Simplified offerings for Deal Maker
  const simplifiedOfferings = relatedOfferings.map((off, index) => ({
    id: off.offering_id,
    productName: off.supported_product || off.brand || 'Product',
    offeringName: off.offering_name,
    outcome: off.offering_outcomes?.substring(0, 100) || '',
    description: off.tag_line || off.offering_summary?.substring(0, 100) || '',
    price: 50000 + (index * 10000),
    parts: off.part_numbers || ''
  }));

  const totalSimplifiedPrice = simplifiedOfferings.reduce((sum, item) => sum + item.price, 0);
  const selectedTotal = calculateSelectedTotal();

  // Fine Print Tab Component
  const FinePrintTab = () => (
    <div className="offering-detail__tab-content bg-white">
      <div className="offering-detail__section-title">
        <DocumentView size={24} className="offering-detail__icon--blue" />
        <h2>Terms & Conditions</h2>
      </div>

      <div className="offering-detail__fine-print-content">
        {/* Scope Section */}
        <Tile className="offering-detail__fine-print-section">
          <div className="offering-detail__fine-print-header">
            <Package size={20} className="offering-detail__icon--blue" />
            <h3>Scope of Work</h3>
          </div>
          <p className="offering-detail__fine-print-text">
            {offering?.scope_summary || offering?.offering_summary || 'Scope details not available'}
          </p>
        </Tile>

        {/* Outcome Section */}
        <Tile className="offering-detail__fine-print-section">
          <div className="offering-detail__fine-print-header">
            <CheckmarkOutline size={20} className="offering-detail__icon--green" />
            <h3>Expected Outcome</h3>
          </div>
          <p className="offering-detail__fine-print-text">
            {offering?.offering_outcomes || 'Expected outcomes not specified'}
          </p>
        </Tile>

        {/* Key Deliverables */}
        {offering?.key_deliverables && (
          <Tile className="offering-detail__fine-print-section">
            <div className="offering-detail__fine-print-header">
              <Document size={20} className="offering-detail__icon--purple" />
              <h3>Key Deliverables</h3>
            </div>
            <p className="offering-detail__fine-print-text">
              {offering.key_deliverables}
            </p>
          </Tile>
        )}

        {/* Prerequisites */}
        {offering?.prerequisites && (
          <Tile className="offering-detail__fine-print-section">
            <div className="offering-detail__fine-print-header">
              <Warning size={20} className="offering-detail__icon--orange" />
              <h3>Prerequisites & Dependencies</h3>
            </div>
            <p className="offering-detail__fine-print-text">
              {offering.prerequisites}
            </p>
          </Tile>
        )}

        {/* Transaction Method & Links */}
        <div className="offering-detail__fine-print-footer">
          <Tile className="offering-detail__info-tile">
            <div className="offering-detail__info-item">
              <span className="offering-detail__info-label">Duration:</span>
              <Tag type="blue">{offering?.duration || 'Not specified'}</Tag>
            </div>
            {offering?.seismic_link && (
              <div className="offering-detail__info-item">
                <span className="offering-detail__info-label">Seismic Resource:</span>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Link}
                  href={offering.seismic_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Documentation
                </Button>
              </div>
            )}
          </Tile>
        </div>
      </div>
    </div>
  );

  // Loading state - Show skeleton
  if (loading) {
    return <OfferingDetailSkeleton />;
  }

  // Error state
  if (error || !offering) {
    return (
      <div className="offering-detail">
        <div className="offering-detail__container">
          <Button
            kind="ghost"
            renderIcon={ArrowLeft}
            onClick={() => navigate('/catalog')}
            className="offering-detail__back-button"
          >
            Back to Catalog
          </Button>
          <div className="mt-4">
            <InlineNotification
              kind="error"
              title="Error Loading Offering"
              subtitle={error || 'Offering not found'}
              lowContrast
            />
            <Button onClick={refetch} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ELA Dealmaker View
  if (isELADealmaker) {
    const simplifiedHeaders = [
      { key: 'select', header: 'Select' },
      { key: 'productName', header: 'Product Name' },
      { key: 'offeringName', header: 'Offering Name' },
      { key: 'outcome', header: 'Outcome' },
      { key: 'description', header: 'Description' },
      { key: 'price', header: 'Price' },
      { key: 'parts', header: 'Parts' },
    ];

    const simplifiedRows = simplifiedOfferings.map(item => ({
      id: String(item.id),
      select: item.id,
      productName: item.productName,
      offeringName: item.offeringName,
      outcome: item.outcome || '-',
      description: item.description || '-',
      price: `$${item.price.toLocaleString()}`,
      parts: item.parts || '-',
    }));

    return (
      <div className="offering-detail">
        <div className="offering-detail__container">
          <div className="flex items-center justify-between mb-4">
            <Button
              kind="ghost"
              renderIcon={ArrowLeft}
              onClick={() => navigate('/catalog')}
              className="offering-detail__back-button"
            >
              Back to Catalog
            </Button>

            {permissions.canEditOfferings && (
              <div className="flex gap-2">
                <Button
                  kind="tertiary"
                  renderIcon={Edit}
                  onClick={handleEditOffering}
                >
                  Edit Offering
                </Button>
                <Button
                  kind="danger--tertiary"
                  renderIcon={TrashCan}
                  onClick={handleDeleteOffering}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="offering-detail__header">
            <div className="offering-detail__header-content">
              <div className="offering-detail__title-section">
                <h1 className="offering-detail__title">
                  {offering.offering_name}
                  {permissions.isAdmin && (
                    <Tag type="red" size="sm" className="ml-2">ADMIN VIEW</Tag>
                  )}
                </h1>
                <div className="offering-detail__tags">
                  {offering.saas_type && <Tag type="blue">{offering.saas_type}</Tag>}
                  {offering.brand && <Tag type="gray">{offering.brand}</Tag>}
                  {offering.industry && <Tag type="gray">{offering.industry}</Tag>}
                </div>
              </div>

              <div className="offering-detail__price-cards">
                <Tile className="offering-detail__price-tile">
                  <div className="offering-detail__price-content">
                    <Currency size={32} className="offering-detail__icon--blue" />
                    <div>
                      <div className="offering-detail__price-label">Total Available</div>
                      <div className="offering-detail__price-value">
                        ${totalSimplifiedPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Tile>

                {selectedOfferings.length > 0 && (
                  <Tile className="offering-detail__price-tile offering-detail__price-tile--selected">
                    <div className="offering-detail__price-content">
                      <Currency size={32} className="offering-detail__icon--green" />
                      <div>
                        <div className="offering-detail__price-label">Selected Total</div>
                        <div className="offering-detail__price-value">
                          ${selectedTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Tile>
                )}
              </div>
            </div>
          </div>

          <Tabs>
            <TabList aria-label="Offering tabs" contained>
              <Tab>Summary</Tab>
              <Tab>Dashboard</Tab>
              <Tab>Fine Print</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="offering-detail__tab-content">
                  <div className="offering-detail__section-header">
                    <div className="offering-detail__section-title">
                      <Package size={24} className="offering-detail__icon--blue" />
                      <h2>Related Offerings</h2>
                    </div>
                    {selectedOfferings.length > 0 && (
                      <Tag type="blue">
                        {selectedOfferings.length} selected
                      </Tag>
                    )}
                  </div>

                  {loadingRelated ? (
                    <RelatedOfferingsSkeleton />
                  ) : simplifiedOfferings.length > 0 ? (
                    <DataTable rows={simplifiedRows} headers={simplifiedHeaders}>
                      {({ rows, headers, getHeaderProps, getTableProps }) => (
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              {headers.map((header) => (
                                <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => {
                              const isSelected = selectedOfferings.includes(row.id);
                              return (
                                <TableRow 
                                  key={row.id}
                                  className={isSelected ? 'selected-row' : ''}
                                >
                                  <TableCell>
                                    <Checkbox
                                      id={`checkbox-${row.id}`}
                                      checked={isSelected}
                                      onChange={() => handleOfferingToggle(row.id)}
                                      labelText=""
                                    />
                                  </TableCell>
                                  {row.cells.slice(1).map((cell) => (
                                    <TableCell 
                                      key={cell.id}
                                      className={cell.info.header === 'price' ? 'price-cell' : ''}
                                    >
                                      {cell.value}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                            <TableRow className="total-row">
                              <TableCell></TableCell>
                              <TableCell colSpan={4}><strong>Total (All Offerings)</strong></TableCell>
                              <TableCell><strong>${totalSimplifiedPrice.toLocaleString()}</strong></TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                            {selectedOfferings.length > 0 && (
                              <TableRow className="selected-total-row">
                                <TableCell></TableCell>
                                <TableCell colSpan={4}>
                                  <strong>
                                    Selected Total ({selectedOfferings.length}{' '}
                                    {selectedOfferings.length === 1 ? 'item' : 'items'})
                                  </strong>
                                </TableCell>
                                <TableCell><strong>${selectedTotal.toLocaleString()}</strong></TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </DataTable>
                  ) : (
                    <Tile>
                      <p>No related offerings found.</p>
                    </Tile>
                  )}
                </div>
              </TabPanel>

              <TabPanel>
                <DashboardSkeleton />
              </TabPanel>

              <TabPanel>
                <FinePrintTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    );
  }

  // Standard detailed view for all users
  const detailedHeaders = [
    { key: 'activityNumber', header: '#' },
    { key: 'activityId', header: 'Activity ID' },
    { key: 'activityBlock', header: 'Block' },
    { key: 'activityName', header: 'Activity Name' },
    { key: 'effort', header: 'Effort (hrs)' },
    { key: 'staffing', header: 'Staffing' },
    { key: 'parts', header: 'Parts' },
    { key: 'price', header: 'Price' },
  ];

  const detailedRows = formattedActivities.map(activity => ({
    id: String(activity.activityNumber),
    activityNumber: activity.activityNumber,
    activityId: activity.activityId,
    activityBlock: activity.activityBlock,
    activityName: activity.activityName,
    effort: activity.effort,
    staffing: activity.staffing,
    parts: activity.parts,
    price: `$${activity.price.toLocaleString()}`,
    action: activity,
  }));

  return (
    <div className="offering-detail pt-5">
      <div className="offering-detail__container">
        <div className="flex items-center justify-between mb-4">
          <Button
            kind="ghost"
            renderIcon={ArrowLeft}
            onClick={() => navigate('/catalog')}
            className="offering-detail__back-button"
          >
            Back to Catalog
          </Button>

          <div className="flex gap-2">
            {permissions.canEditOfferings && (
              <>
                <Button
                  kind="tertiary"
                  renderIcon={Edit}
                  onClick={handleEditOffering}
                >
                  Edit Offering
                </Button>
                <Button
                  kind="danger--tertiary"
                  renderIcon={TrashCan}
                  onClick={handleDeleteOffering}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="offering-detail__header">
          <div className="offering-detail__header-content">
            <div className="offering-detail__title-section">
              <h1 className="offering-detail__title">
                {offering.offering_name}
              </h1>
              <div className="offering-detail__tags">
                {offering.saas_type && <Tag type="blue">{offering.saas_type}</Tag>}
                {offering.brand && <Tag type="gray">{offering.brand}</Tag>}
              </div>
            </div>

            <div className="offering-detail__price-cards">
              <Tile className="offering-detail__price-tile">
                <div className="offering-detail__price-content">
                  <Time size={32} className="offering-detail__icon--blue" />
                  <div>
                    <div className="offering-detail__price-label">Total Effort</div>
                    <div className="offering-detail__price-value">
                      {totalEffort || pricing?.total_hours} hours
                    </div>
                  </div>
                </div>
              </Tile>

              <Tile className="offering-detail__price-tile offering-detail__price-tile--green-border">
                <div className="offering-detail__price-content">
                  <Currency size={32} className="offering-detail__icon--green" />
                  <div>
                    <div className="offering-detail__price-label">Total Price</div>
                    <div className="offering-detail__price-value">
                      ${totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Tile>
            </div>
          </div>
        </div>

        <Tabs>
          <TabList aria-label="Offering tabs" contained>
            <Tab>Summary</Tab>
            <Tab>Dashboard</Tab>
            <Tab>Fine Print</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="offering-detail__tab-content">
                <div className="offering-detail__section-title">
                  <Document size={24} className="offering-detail__icon--blue" />
                  <h2>Complete Activity Summary</h2>
                </div>

                {formattedActivities.length > 0 ? (
                  <DataTable rows={detailedRows} headers={detailedHeaders}>
                    {({ rows, headers, getHeaderProps, getTableProps }) => (
                      <Table {...getTableProps()}>
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.cells.map((cell) => {
                                if (cell.info.header === 'activityBlock') {
                                  return (
                                    <TableCell key={cell.id}>
                                      <Tag type={getBlockTagType(cell.value)}>
                                        {cell.value}
                                      </Tag>
                                    </TableCell>
                                  );
                                }
                                return (
                                  <TableCell 
                                    key={cell.id}
                                    className={cell.info.header === 'price' ? 'price-cell' : ''}
                                  >
                                    {cell.value}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                          <TableRow className="total-row">
                            <TableCell colSpan={4}><strong>Total</strong></TableCell>
                            <TableCell><strong>{totalEffort}</strong></TableCell>
                            <TableCell colSpan={2}></TableCell>
                            <TableCell><strong>${totalPrice.toLocaleString()}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </DataTable>
                ) : (
                  <Tile>
                    <p>No activities found for this offering.</p>
                  </Tile>
                )}

                <Modal
                  open={!!selectedActivity}
                  onRequestClose={() => setSelectedActivity(null)}
                  modalHeading={selectedActivity?.activityName}
                  primaryButtonText="Close"
                  onRequestSubmit={() => setSelectedActivity(null)}
                  size="lg"
                >
                  <div className="offering-detail__modal-content">
                    <div className="offering-detail__modal-section">
                      <h4>Scope</h4>
                      <p>{selectedActivity?.scope}</p>
                    </div>
                    <div className="offering-detail__modal-section">
                      <h4>Outcome</h4>
                      <p>{selectedActivity?.outcome}</p>
                    </div>
                    <div className="offering-detail__modal-section">
                      <h4>Responsibilities</h4>
                      <p>{selectedActivity?.responsibilities}</p>
                    </div>
                    <div className="offering-detail__modal-section">
                      <h4>Assumptions</h4>
                      <p>{selectedActivity?.assumptions}</p>
                    </div>
                    {selectedActivity?.seismicLink && (
                      <div className="offering-detail__modal-section">
                        <h4>Link to Seismic</h4>
                        <a
                          href={selectedActivity.seismicLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="offering-detail__link"
                        >
                          Open
                        </a>
                      </div>
                    )}
                  </div>
                </Modal>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="offering-detail__tab-content">
                <div className="offering-detail__section-title">
                  <Currency size={24} className="offering-detail__icon--green" />
                  <h2>Staffing & Pricing Dashboard</h2>
                </div>

                <div className="offering-detail__dashboard-grid offering-detail__dashboard-grid--four">
                  <Tile className="offering-detail__stat-tile offering-detail__stat-tile--blue bg-white">
                    <div className="offering-detail__stat-label">Total Activities</div>
                    <div className="offering-detail__stat-value">
                      {formattedActivities.length}
                    </div>
                  </Tile>
                  <Tile className="offering-detail__stat-tile offering-detail__stat-tile--purple bg-white">
                    <div className="offering-detail__stat-label">Total Effort</div>
                    <div className="offering-detail__stat-value">
                      {totalEffort}h
                    </div>
                  </Tile>
                  <Tile className="offering-detail__stat-tile offering-detail__stat-tile--green bg-white">
                    <div className="offering-detail__stat-label">Total Price</div>
                    <div className="offering-detail__stat-value">
                      ${totalPrice.toLocaleString()}
                    </div>
                  </Tile>
                  <Tile className="offering-detail__stat-tile offering-detail__stat-tile--red bg-white">
                    <div className="offering-detail__stat-label">Avg Rate/Hour</div>
                    <div className="offering-detail__stat-value">
                      ${totalEffort > 0 ? Math.round(totalPrice / totalEffort).toLocaleString() : 0}
                    </div>
                  </Tile>
                </div>

                {/* Staffing Section */}
                <div className="offering-detail__section">
                  <div className="offering-detail__section-title">
                    <User size={24} className="offering-detail__icon--blue" />
                    <h3>Staffing Allocation</h3>
                  </div>

                  <div className="offering-detail__staffing-grid">
                    {Object.entries(groupedByStaffing).map(([staffing, staffActivities]) => {
                      const staffEffort = staffActivities.reduce((sum, act) => sum + act.effort, 0);
                      const staffCost = staffActivities.reduce((sum, act) => sum + act.price, 0);
                      return (
                        <Tile key={staffing} className="offering-detail__staff-tile bg-white">
                          <div className="offering-detail__staff-header">
                            <div>
                              <div className="offering-detail__staff-name">{staffing}</div>
                              <div className="offering-detail__staff-activities">
                                {staffActivities.length} activities
                              </div>
                            </div>
                            <User size={32} className="offering-detail__icon--blue" />
                          </div>
                          <div className="offering-detail__staff-stats">
                            <div>
                              <div className="offering-detail__stat-label">Total Hours</div>
                              <div className="offering-detail__staff-stat-value">{staffEffort}h</div>
                            </div>
                            <div>
                              <div className="offering-detail__stat-label">Total Cost</div>
                              <div className="offering-detail__staff-stat-value">
                                ${staffCost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </Tile>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="offering-detail__section">
                  <div className="offering-detail__section-title">
                    <Currency size={24} className="offering-detail__icon--green" />
                    <h3>Pricing Breakdown by Phase</h3>
                  </div>

                  <div className="offering-detail__dashboard-grid">
                    {Object.entries(groupedByBlock).map(([block, blockActivities]) => {
                      const blockEffort = blockActivities.reduce((sum, act) => sum + act.effort, 0);
                      const blockPrice = blockActivities.reduce((sum, act) => sum + act.price, 0);
                      const blockClass = 
                        block.toLowerCase().includes('plan') ? 'blue' :
                        block.toLowerCase().includes('implement') ? 'purple' : 'green';
                      
                      return (
                        <Tile 
                          key={block} 
                          className={`offering-detail__phase-tile offering-detail__phase-tile--${blockClass} bg-white`}
                        >
                          <Tag type={getBlockTagType(block)} className="offering-detail__phase-tag">
                            {block}
                          </Tag>
                          <div className="offering-detail__phase-price">
                            ${blockPrice.toLocaleString()}
                          </div>
                          <div className="offering-detail__phase-percentage">
                            {totalPrice > 0 ? ((blockPrice / totalPrice) * 100).toFixed(1) : 0}% of total
                          </div>
                          <div className="offering-detail__phase-stats">
                            <div>
                              <div className="offering-detail__phase-stat-label">Activities</div>
                              <div className="offering-detail__phase-stat-value">
                                {blockActivities.length}
                              </div>
                            </div>
                            <div>
                              <div className="offering-detail__phase-stat-label">Hours</div>
                              <div className="offering-detail__phase-stat-value">
                                {blockEffort}h
                              </div>
                            </div>
                          </div>
                        </Tile>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <FinePrintTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}