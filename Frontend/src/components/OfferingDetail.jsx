// OfferingDetail.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
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
  Loading,
  InlineNotification,
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
} from '@carbon/icons-react';
import { useOfferingDetail } from '../hooks/useOfferingDetail';
import offeringService from '../services/offeringService';
import './OfferingDetail.scss';

export function OfferingDetail() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  // Fetch offering details using custom hook
  const { offering, activities, staffing, pricing, loading, error, refetch } = useOfferingDetail(offeringId);

  // console.log("Pricing-> ", pricing)

  // State for ELA Dealmaker selections
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedOfferings, setSelectedOfferings] = useState([]);
  
  // Additional data for Deal Maker view
  const [relatedOfferings, setRelatedOfferings] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Check if user should see simplified view
  const isBrandSalesRep = userRole === 'brand-sales-and-renewal-rep';
  const isELADealmaker = userRole === 'deal-maker';

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

  // Calculate total for selected offerings
  const calculateSelectedTotal = () => {
    // Since we don't have price in offering data, we'll use a placeholder
    // You can modify this based on your actual pricing structure
    return selectedOfferings.length * 50000; // Placeholder calculation
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

  // Calculate activity price (placeholder - adjust based on your logic)
  function calculateActivityPrice(activity) {
    const hours = activity.effort_hours || activity.duration_hours || 40;
    const rate = activity.fixed_price || (hours * 430); // $430/hour average
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

  // Simplified offerings for Deal Maker (using related offerings)
  const simplifiedOfferings = relatedOfferings.map((off, index) => ({
    id: off.offering_id,
    productName: off.supported_product || off.brand || 'Product',
    offeringName: off.offering_name,
    outcome: off.offering_outcomes?.substring(0, 100) || '',
    description: off.tag_line || off.offering_summary?.substring(0, 100) || '',
    price: 50000 + (index * 10000), // Placeholder pricing
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

  // Loading state
  if (loading) {
    return (
      <div className="offering-detail">
        <div className="offering-detail__container">
          <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
            <Loading description="Loading offering details..." withOverlay={false} />
          </div>
        </div>
      </div>
    );
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
          <Button
            kind="ghost"
            renderIcon={ArrowLeft}
            onClick={() => navigate('/catalog')}
            className="offering-detail__back-button"
          >
            Back to Catalog
          </Button>

          <div className="offering-detail__header">
            <div className="offering-detail__header-content">
              <div className="offering-detail__title-section">
                <h1 className="offering-detail__title">
                  {offering.offering_name}
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
                    <Loading description="Loading related offerings..." />
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
                <div className="offering-detail__tab-content">
                  <div className="offering-detail__section-title">
                    <Currency size={24} className="offering-detail__icon--green" />
                    <h2>Pricing Dashboard</h2>
                  </div>

                  <div className="offering-detail__dashboard-grid">
                    <Tile className="offering-detail__stat-tile offering-detail__stat-tile--blue">
                      <div className="offering-detail__stat-label">Total Items</div>
                      <div className="offering-detail__stat-value">
                        {simplifiedOfferings.length}
                      </div>
                    </Tile>
                    <Tile className="offering-detail__stat-tile offering-detail__stat-tile--green">
                      <div className="offering-detail__stat-label">Total Price</div>
                      <div className="offering-detail__stat-value">
                        ${totalSimplifiedPrice.toLocaleString()}
                      </div>
                    </Tile>
                    <Tile className="offering-detail__stat-tile offering-detail__stat-tile--purple">
                      <div className="offering-detail__stat-label">Average Price</div>
                      <div className="offering-detail__stat-value">
                        ${simplifiedOfferings.length > 0 
                          ? Math.round(totalSimplifiedPrice / simplifiedOfferings.length).toLocaleString()
                          : 0}
                      </div>
                    </Tile>
                  </div>

                  {selectedOfferings.length > 0 && (
                    <>
                      <div className="offering-detail__dashboard-grid">
                        <Tile className="offering-detail__stat-tile offering-detail__stat-tile--blue">
                          <div className="offering-detail__stat-label">Selected Items</div>
                          <div className="offering-detail__stat-value">
                            {selectedOfferings.length}
                          </div>
                        </Tile>
                        <Tile className="offering-detail__stat-tile offering-detail__stat-tile--green">
                          <div className="offering-detail__stat-label">Selected Total</div>
                          <div className="offering-detail__stat-value">
                            ${selectedTotal.toLocaleString()}
                          </div>
                        </Tile>
                        <Tile className="offering-detail__stat-tile offering-detail__stat-tile--purple">
                          <div className="offering-detail__stat-label">Average per Item</div>
                          <div className="offering-detail__stat-value">
                            ${Math.round(selectedTotal / selectedOfferings.length).toLocaleString()}
                          </div>
                        </Tile>
                      </div>

                      <div className="offering-detail__selected-section">
                        <h3>Selected Offerings</h3>
                        <div className="offering-detail__offering-cards">
                          {simplifiedOfferings
                            .filter(item => selectedOfferings.includes(String(item.id)))
                            .map((item) => (
                              <Tile key={item.id} className="offering-detail__offering-card">
                                <div className="offering-detail__offering-card-content">
                                  <div>
                                    <div className="offering-detail__offering-name">{item.offeringName}</div>
                                    <div className="offering-detail__product-name">{item.productName}</div>
                                  </div>
                                  <div className="offering-detail__offering-price">
                                    ${item.price.toLocaleString()}
                                  </div>
                                </div>
                              </Tile>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
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

  // Standard detailed view for Seller and Architect
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
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/catalog')}
          className="offering-detail__back-button"
        >
          Back to Catalog
        </Button>

        <div className="offering-detail__header">
          <div className="offering-detail__header-content">
            <div className="offering-detail__title-section">
              <h1 className="offering-detail__title">
                {offering.offering_name}
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
                  <Time size={32} className="offering-detail__icon--blue" />
                  <div>
                    <div className="offering-detail__price-label">Total Effort</div>
                    <div className="offering-detail__price-value">
                      {pricing?.total_hours || totalEffort} hours
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