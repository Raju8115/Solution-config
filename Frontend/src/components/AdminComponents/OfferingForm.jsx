import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Form,
  TextInput,
  TextArea,
  Dropdown,
  Loading,
  InlineNotification,
  Tile,
  Breadcrumb,
  BreadcrumbItem,
  Modal,
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Search,
  Tag,
  Grid,
  Column,
  Accordion,
  AccordionItem,
  Checkbox,
  SkeletonPlaceholder,
  SkeletonText
} from '@carbon/react';
import { ArrowLeft, Save, Add, TrashCan, View, Checkmark } from '@carbon/icons-react';
import { useAuth } from '../../contexts/AuthContexts';
import { usePermissions } from '../../hooks/usePermissions';
import offeringService from '../../services/offeringService';
import productService from '../../services/productService';
import activityService from '../../services/activityService';

export function OfferingForm() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { userRoles } = useAuth();
  const permissions = usePermissions();
  const isEditMode = Boolean(offeringId);

  // Form state - keep all your existing formData fields
  const [formData, setFormData] = useState({
    offering_name: '',
    product_id: '',
    saas_type: '',
    brand: '',
    supported_product: '',
    client_type: '',
    client_journey: '',
    client_journey_stage: '',
    framework_category: '',
    scenario: '',
    ibm_sales_play: '',
    tel_sales_tactic: '',
    industry: '',
    offering_tags: '',
    content_page: '',
    offering_sales_contact: '',
    offering_product_manager: '',
    offering_practice_leader: '',
    business_challenges: '',
    business_drivers: '',
    offering_value: '',
    tag_line: '',
    elevator_pitch: '',
    offering_outcomes: '',
    key_deliverables: '',
    offering_summary: '',
    when_and_why_to_sell: '',
    buyer_persona: '',
    user_persona: '',
    scope_summary: '',
    duration: '',
    occ: '',
    prerequisites: '',
    seismic_link: '',
    part_numbers: '',
  });

  // Data state
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [products, setProducts] = useState([]); // Filtered products by brand
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Activity management state
  const [linkedActivities, setLinkedActivities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isActivityDetailModalOpen, setIsActivityDetailModalOpen] = useState(false);
  const [selectedActivityForView, setSelectedActivityForView] = useState(null);
  const [selectedActivitiesToAdd, setSelectedActivitiesToAdd] = useState([]);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  // Check permissions
  useEffect(() => {
    if (!permissions.canEditOfferings) {
      navigate('/catalog');
    }
  }, [permissions, navigate]);

  // Fetch brands and all products on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchBrandsAndProducts();
    };
    initializeData();
  }, []);

  // Fetch offering data after brands are loaded (in edit mode)
useEffect(() => {
  if (isEditMode && brands.length > 0 && allProducts.length > 0) {
    fetchOffering();
    fetchLinkedActivities();
  }
}, [offeringId, brands, allProducts]);

  // Fetch products when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      const brandProducts = allProducts.filter(p => p.brand_id === selectedBrand);
      setProducts(brandProducts);
    }
  }, [selectedBrand, allProducts]);

const fetchBrandsAndProducts = async () => {
  try {
    const brandsData = await offeringService.getBrands();
    setBrands(brandsData);
    
    // Fetch all products for all brands
    const productsPromises = brandsData.map(brand => 
      productService.getProductsByBrand(brand.brand_id)
    );
    const productsArrays = await Promise.all(productsPromises);
    const flatProducts = productsArrays.flat();
    setAllProducts(flatProducts);
    
    // Return both for potential use
    return { brands: brandsData, products: flatProducts };
  } catch (err) {
    console.error('Error fetching brands:', err);
    setError('Failed to load brands');
  }
};

// Update fetchOffering to check and wait for data
const fetchOffering = async () => {
  try {
    setInitialLoading(true);
    const data = await offeringService.getOfferingById(offeringId);
    console.log('Fetched offering data:', data);
    console.log('Available products:', allProducts);
    
    // Set form data
    setFormData(data);

    // Find and set the brand based on product_id
    if (data.product_id && allProducts.length > 0) {
      const product = allProducts.find(p => p.product_id === data.product_id);
      console.log('Found product for offering:', product);
      
      if (product) {
        // Set the brand first
        setSelectedBrand(product.brand_id);
        
        // Filter products for this brand
        const brandProducts = allProducts.filter(p => p.brand_id === product.brand_id);
        setProducts(brandProducts);
        
        console.log('Set brand:', product.brand_id, 'and products:', brandProducts);
      } else {
        console.warn('Product not found for product_id:', data.product_id);
      }
    } else {
      console.warn('Missing data - product_id:', data.product_id, 'allProducts length:', allProducts.length);
    }
  } catch (err) {
    console.error('Error fetching offering:', err);
    setError('Failed to load offering');
  } finally {
    setInitialLoading(false);
  }
};

  const fetchLinkedActivities = async () => {
    if (!offeringId) return;
    
    try {
      setActivityLoading(true);
      const activities = await activityService.getActivitiesByOffering(offeringId);
      setLinkedActivities(activities);
    } catch (err) {
      console.error('Error fetching linked activities:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchAvailableActivities = async () => {
    try {
      const allActivities = await activityService.getAllActivities();
      const linkedIds = linkedActivities.map(a => a.activity_id);
      const available = allActivities.filter(a => !linkedIds.includes(a.activity_id));
      setAvailableActivities(available);
    } catch (err) {
      console.error('Error fetching available activities:', err);
      setError('Failed to load available activities');
    }
  };

  const handleOpenActivityModal = () => {
    fetchAvailableActivities();
    setSelectedActivitiesToAdd([]); // Reset selection
    setIsActivityModalOpen(true);
  };

  const handleViewActivityDetails = async (activityId) => {
    try {
      const activity = await activityService.getActivityById(activityId);
      setSelectedActivityForView(activity);
      setIsActivityDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching activity details:', err);
      setError('Failed to load activity details');
    }
  };

  const handleLinkActivities = async () => {
    if (!offeringId || selectedActivitiesToAdd.length === 0) return;

    try {
      setActivityLoading(true);
      for (const activityId of selectedActivitiesToAdd) {
        await activityService.linkActivityToOffering({
          offering_id: offeringId,
          activity_id: activityId,
          sequence: linkedActivities.length + 1,
          is_mandatory: true
        });
      }
      
      await fetchLinkedActivities();
      setIsActivityModalOpen(false);
      setSelectedActivitiesToAdd([]);
    } catch (err) {
      console.error('Error linking activities:', err);
      setError('Failed to link activities');
    } finally {
      setActivityLoading(false);
    }
  };

  const handleUnlinkActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to remove this activity from the offering?')) {
      return;
    }

    try {
      setActivityLoading(true);
      await activityService.unlinkActivityFromOffering(offeringId, activityId);
      await fetchLinkedActivities();
    } catch (err) {
      console.error('Error unlinking activity:', err);
      setError('Failed to unlink activity');
    } finally {
      setActivityLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBrandChange = ({ selectedItem }) => {
    setSelectedBrand(selectedItem?.brand_id || null);
    setFormData(prev => ({
      ...prev,
      product_id: '', // Reset product when brand changes
      brand: selectedItem?.brand_name || ''
    }));
  };

  const handleProductChange = ({ selectedItem }) => {
    setFormData(prev => ({
      ...prev,
      product_id: selectedItem?.product_id || ''
    }));
  };

  const toggleActivitySelection = (activityId) => {
    setSelectedActivitiesToAdd(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.offering_name || !formData.product_id) {
      setError('Offering name and product are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await offeringService.updateOffering(offeringId, formData);
        setSuccess(true);
        setTimeout(() => navigate(`/offering/${offeringId}`), 1500);
      } else {
        const newOffering = await offeringService.createOffering(formData);
        setSuccess(true);
        setTimeout(() => navigate(`/offering/${newOffering.offering_id}`), 1500);
      }
    } catch (err) {
      console.error('Error saving offering:', err);
      setError(err.message || 'Failed to save offering');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
        <SkeletonText heading style={{ width: '300px' }} />
      </div>

      {/* Basic Information Tile */}
      <Tile style={{ marginBottom: '1rem' }}>
        <SkeletonText heading style={{ marginBottom: '1rem', width: '200px' }} />
        <Grid narrow>
          <Column lg={8} md={4} sm={4}>
            <SkeletonText style={{ marginBottom: '0.5rem' }} />
            <SkeletonPlaceholder style={{ height: '40px', marginBottom: '1rem' }} />
          </Column>
          <Column lg={4} md={4} sm={4}>
            <SkeletonText style={{ marginBottom: '0.5rem' }} />
            <SkeletonPlaceholder style={{ height: '48px', marginBottom: '1rem' }} />
          </Column>
          <Column lg={4} md={4} sm={4}>
            <SkeletonText style={{ marginBottom: '0.5rem' }} />
            <SkeletonPlaceholder style={{ height: '48px', marginBottom: '1rem' }} />
          </Column>
          <Column lg={16} md={8} sm={4}>
            <SkeletonText style={{ marginBottom: '0.5rem' }} />
            <SkeletonPlaceholder style={{ height: '80px' }} />
          </Column>
        </Grid>
      </Tile>

      {/* Activities Section Skeleton */}
      <Tile style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <SkeletonText heading style={{ width: '250px' }} />
          <SkeletonPlaceholder style={{ width: '150px', height: '40px' }} />
        </div>
        <SkeletonPlaceholder style={{ height: '200px' }} />
      </Tile>

      {/* Accordion Skeleton */}
      <div style={{ marginBottom: '1rem' }}>
        <SkeletonPlaceholder style={{ height: '48px', marginBottom: '0.5rem' }} />
        <SkeletonPlaceholder style={{ height: '48px', marginBottom: '0.5rem' }} />
        <SkeletonPlaceholder style={{ height: '48px', marginBottom: '0.5rem' }} />
        <SkeletonPlaceholder style={{ height: '48px' }} />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <SkeletonPlaceholder style={{ width: '100px', height: '48px' }} />
        <SkeletonPlaceholder style={{ width: '150px', height: '48px' }} />
      </div>
    </div>
  );
}


  const activityHeaders = [
    { key: 'sequence', header: 'Seq' },
    { key: 'activity_name', header: 'Activity Name' },
    { key: 'category', header: 'Category' },
    { key: 'duration', header: 'Duration' },
    { key: 'effort_hours', header: 'Effort' },
    { key: 'is_mandatory', header: 'Mandatory' },
    { key: 'actions', header: 'Actions' },
  ];

  const activityRows = linkedActivities
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    .map((activity) => ({
      id: activity.activity_id,
      sequence: activity.sequence || '-',
      activity_name: activity.activity_name,
      category: activity.category || '-',
      duration: activity.duration_weeks ? `${activity.duration_weeks}w` : '-',
      effort_hours: activity.effort_hours ? `${activity.effort_hours}h` : '-',
      is_mandatory: activity.is_mandatory,
      actions: activity.activity_id,
    }));

  const filteredAvailableActivities = availableActivities.filter(activity =>
    activity.activity_name.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
    (activity.category && activity.category.toLowerCase().includes(activitySearchQuery.toLowerCase())) ||
    (activity.brand && activity.brand.toLowerCase().includes(activitySearchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* <Breadcrumb style={{ marginBottom: '1rem' }}>
        <BreadcrumbItem href="/admin">Admin</BreadcrumbItem>
        <BreadcrumbItem href="/admin/offerings">Offerings</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>{isEditMode ? 'Edit' : 'Create'}</BreadcrumbItem>
      </Breadcrumb> */}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/admin/offerings')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Offering' : 'Create New Offering'}
        </h1>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {success && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={`Offering ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Tile style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Basic Information</h3>
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="offering_name"
                labelText="Offering Name *"
                value={formData.offering_name}
                onChange={(e) => handleInputChange('offering_name', e.target.value)}
                required
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <Dropdown
                id="brand"
                titleText="Brand *"
                label="Select a brand"
                items={brands}
                itemToString={(item) => item?.brand_name || ''}
                selectedItem={brands.find(b => b.brand_id === selectedBrand) || null}
                onChange={handleBrandChange}
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <Dropdown
                id="product"
                titleText="Product *"
                label="Select a product"
                items={products}
                itemToString={(item) => item?.product_name || ''}
                selectedItem={products.find(p => p.product_id === formData.product_id) || null}
                onChange={handleProductChange}
                disabled={!selectedBrand}
              />
            </Column>

            {/* Keep all your other form fields here - tag_line, saas_type, offering_summary, etc. */}
            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="tag_line"
                labelText="Tag Line"
                value={formData.tag_line}
                onChange={(e) => handleInputChange('tag_line', e.target.value)}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="saas_type"
                labelText="SaaS Type"
                value={formData.saas_type}
                onChange={(e) => handleInputChange('saas_type', e.target.value)}
              />
            </Column>

            <Column lg={16} md={8} sm={4}>
              <TextArea
                id="offering_summary"
                labelText="Offering Summary"
                rows={4}
                value={formData.offering_summary}
                onChange={(e) => handleInputChange('offering_summary', e.target.value)}
              />
            </Column>
          </Grid>
        </Tile>

        {/* Activities Section - Only in edit mode */}
        {isEditMode && (
          <Tile style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Linked Activities ({linkedActivities.length})</h3>
              <Button
                size="sm"
                renderIcon={Add}
                onClick={handleOpenActivityModal}
                disabled={activityLoading}
              >
                Add Activities
              </Button>
            </div>

            {activityLoading ? (
              <Loading description="Loading activities..." small />
            ) : linkedActivities.length === 0 ? (
              <p style={{ color: 'var(--cds-text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No activities linked yet. Click "Add Activities" to get started.
              </p>
            ) : (
              <DataTable rows={activityRows} headers={activityHeaders} size="sm">
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
                            if (cell.info.header === 'is_mandatory') {
                              const activity = linkedActivities.find(a => a.activity_id === row.id);
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={activity?.is_mandatory ? 'green' : 'gray'} size="sm">
                                    {activity?.is_mandatory ? 'Yes' : 'No'}
                                  </Tag>
                                </TableCell>
                              );
                            }
                            if (cell.info.header === 'category') {
                              return (
                                <TableCell key={cell.id}>
                                  {cell.value !== '-' ? <Tag type="cool-gray" size="sm">{cell.value}</Tag> : '-'}
                                </TableCell>
                              );
                            }
                            if (cell.info.header === 'actions') {
                              return (
                                <TableCell key={cell.id}>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <Button
                                      kind="ghost"
                                      size="sm"
                                      renderIcon={View}
                                      onClick={() => handleViewActivityDetails(row.id)}
                                      hasIconOnly
                                      iconDescription="View Details"
                                    />
                                    <Button
                                      kind="danger--ghost"
                                      size="sm"
                                      renderIcon={TrashCan}
                                      onClick={() => handleUnlinkActivity(row.id)}
                                      hasIconOnly
                                      iconDescription="Remove"
                                    />
                                  </div>
                                </TableCell>
                              );
                            }
                            return <TableCell key={cell.id}>{cell.value}</TableCell>;
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            )}
          </Tile>
        )}

       <Accordion>
          {/* Business Context */}
          <AccordionItem title="Business Context">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="business_challenges"
                  labelText="Business Challenges"
                  rows={3}
                  value={formData.business_challenges}
                  onChange={(e) => handleInputChange('business_challenges', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="business_drivers"
                  labelText="Business Drivers"
                  rows={3}
                  value={formData.business_drivers}
                  onChange={(e) => handleInputChange('business_drivers', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="offering_value"
                  labelText="Offering Value"
                  rows={3}
                  value={formData.offering_value}
                  onChange={(e) => handleInputChange('offering_value', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="offering_outcomes"
                  labelText="Offering Outcomes"
                  rows={3}
                  value={formData.offering_outcomes}
                  onChange={(e) => handleInputChange('offering_outcomes', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>


          {/* Sales & Market Information */}
          <AccordionItem title="Sales & Market Information">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="ibm_sales_play"
                  labelText="IBM Sales Play"
                  value={formData.ibm_sales_play}
                  onChange={(e) => handleInputChange('ibm_sales_play', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="tel_sales_tactic"
                  labelText="TEL Sales Tactic"
                  value={formData.tel_sales_tactic}
                  onChange={(e) => handleInputChange('tel_sales_tactic', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="industry"
                  labelText="Industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="scenario"
                  labelText="Scenario"
                  value={formData.scenario}
                  onChange={(e) => handleInputChange('scenario', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="when_and_why_to_sell"
                  labelText="When and Why to Sell"
                  rows={4}
                  value={formData.when_and_why_to_sell}
                  onChange={(e) => handleInputChange('when_and_why_to_sell', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="elevator_pitch"
                  labelText="Elevator Pitch"
                  rows={4}
                  value={formData.elevator_pitch}
                  onChange={(e) => handleInputChange('elevator_pitch', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>


          {/* Client & User Information */}
          <AccordionItem title="Client & User Information">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="client_type"
                  labelText="Client Type"
                  value={formData.client_type}
                  onChange={(e) => handleInputChange('client_type', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="client_journey"
                  labelText="Client Journey"
                  value={formData.client_journey}
                  onChange={(e) => handleInputChange('client_journey', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="client_journey_stage"
                  labelText="Client Journey Stage"
                  value={formData.client_journey_stage}
                  onChange={(e) => handleInputChange('client_journey_stage', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="buyer_persona"
                  labelText="Buyer Persona"
                  value={formData.buyer_persona}
                  onChange={(e) => handleInputChange('buyer_persona', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="user_persona"
                  labelText="User Persona"
                  rows={3}
                  value={formData.user_persona}
                  onChange={(e) => handleInputChange('user_persona', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>


          {/* Scope & Delivery */}
          <AccordionItem title="Scope & Delivery">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="scope_summary"
                  labelText="Scope Summary"
                  rows={4}
                  value={formData.scope_summary}
                  onChange={(e) => handleInputChange('scope_summary', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="key_deliverables"
                  labelText="Key Deliverables"
                  rows={4}
                  value={formData.key_deliverables}
                  onChange={(e) => handleInputChange('key_deliverables', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="duration"
                  labelText="Duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 8 weeks"
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="occ"
                  labelText="OCC"
                  value={formData.occ}
                  onChange={(e) => handleInputChange('occ', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="prerequisites"
                  labelText="Prerequisites"
                  rows={3}
                  value={formData.prerequisites}
                  onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>


          {/* Team & Contacts */}
          <AccordionItem title="Team & Contacts">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="offering_sales_contact"
                  labelText="Sales Contact"
                  value={formData.offering_sales_contact}
                  onChange={(e) => handleInputChange('offering_sales_contact', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="offering_product_manager"
                  labelText="Product Manager"
                  value={formData.offering_product_manager}
                  onChange={(e) => handleInputChange('offering_product_manager', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="offering_practice_leader"
                  labelText="Practice Leader"
                  value={formData.offering_practice_leader}
                  onChange={(e) => handleInputChange('offering_practice_leader', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>


          {/* Additional Information */}
          <AccordionItem title="Additional Information">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="framework_category"
                  labelText="Framework Category"
                  value={formData.framework_category}
                  onChange={(e) => handleInputChange('framework_category', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="supported_product"
                  labelText="Supported Product"
                  value={formData.supported_product}
                  onChange={(e) => handleInputChange('supported_product', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="offering_tags"
                  labelText="Offering Tags"
                  value={formData.offering_tags}
                  onChange={(e) => handleInputChange('offering_tags', e.target.value)}
                  placeholder="Comma-separated tags"
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="part_numbers"
                  labelText="Part Numbers"
                  value={formData.part_numbers}
                  onChange={(e) => handleInputChange('part_numbers', e.target.value)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="content_page"
                  labelText="Content Page"
                  value={formData.content_page}
                  onChange={(e) => handleInputChange('content_page', e.target.value)}
                  placeholder="URL"
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="seismic_link"
                  labelText="Seismic Link"
                  value={formData.seismic_link}
                  onChange={(e) => handleInputChange('seismic_link', e.target.value)}
                  placeholder="URL"
                />
              </Column>
            </Grid>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/offerings')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Offering' : 'Create Offering'}
          </Button>
        </div>
      </Form>

      {/* Activity Selection Modal with Checkboxes */}
      <Modal
        open={isActivityModalOpen}
        onRequestClose={() => setIsActivityModalOpen(false)}
        modalHeading={`Add Activities to Offering (${selectedActivitiesToAdd.length} selected)`}
        primaryButtonText={`Add ${selectedActivitiesToAdd.length} Selected`}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleLinkActivities}
        primaryButtonDisabled={selectedActivitiesToAdd.length === 0 || activityLoading}
        size="lg"
      >
        <div style={{ marginBottom: '1rem' }}>
          <Search
            labelText="Search activities"
            placeholder="Search by name, category, or brand..."
            value={activitySearchQuery}
            onChange={(e) => setActivitySearchQuery(e.target.value)}
          />
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredAvailableActivities.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--cds-text-secondary)' }}>
              {activitySearchQuery ? 'No activities found matching your search.' : 'No available activities to add.'}
            </p>
          ) : (
            filteredAvailableActivities.map((activity) => {
              const isSelected = selectedActivitiesToAdd.includes(activity.activity_id);
              return (
                <Tile
                  key={activity.activity_id}
                  style={{
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    border: isSelected
                      ? '2px solid var(--cds-interactive-01)'
                      : '1px solid var(--cds-border-subtle-01)',
                    backgroundColor: isSelected
                      ? 'var(--cds-layer-selected-01)'
                      : 'transparent',
                    position: 'relative',
                  }}
                  onClick={() => toggleActivitySelection(activity.activity_id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <Checkbox
                      id={`activity-${activity.activity_id}`}
                      checked={isSelected}
                      onChange={() => toggleActivitySelection(activity.activity_id)}
                      labelText=""
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {activity.activity_name}
                        {isSelected && <Checkmark size={16} style={{ color: 'var(--cds-support-success)' }} />}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        {activity.category && <Tag type="cool-gray" size="sm">{activity.category}</Tag>}
                        {activity.brand && <Tag type="blue" size="sm">{activity.brand}</Tag>}
                        {activity.product_name && <Tag type="cyan" size="sm">{activity.product_name}</Tag>}
                        {activity.duration_weeks && (
                          <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                            {activity.duration_weeks} weeks
                          </span>
                        )}
                        {activity.effort_hours && (
                          <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                            {activity.effort_hours} hrs
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Tile>
              );
            })
          )}
        </div>
      </Modal>

      {/* Activity Detail Modal - Keep your existing implementation */}
      <Modal
        open={isActivityDetailModalOpen}
        onRequestClose={() => setIsActivityDetailModalOpen(false)}
        modalHeading={selectedActivityForView?.activity_name || 'Activity Details'}
        passiveModal
        size="lg"
      >
        {selectedActivityForView && (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Accordion>
              <AccordionItem title="Basic Information" open>
                <Grid narrow style={{ paddingTop: '1rem' }}>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Activity Name
                      </p>
                      <p>{selectedActivityForView.activity_name || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Brand
                      </p>
                      <p>{selectedActivityForView.brand || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Product Name
                      </p>
                      <p>{selectedActivityForView.product_name || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Category
                      </p>
                      <p>{selectedActivityForView.category || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Part Numbers
                      </p>
                      <p>{selectedActivityForView.part_numbers || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        WBS
                      </p>
                      <p>{selectedActivityForView.wbs || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Week
                      </p>
                      <p>{selectedActivityForView.week || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Description
                      </p>
                      <p>{selectedActivityForView.description || '-'}</p>
                    </div>
                  </Column>
                </Grid>
              </AccordionItem>


              <AccordionItem title="Duration & Effort">
                <Grid narrow style={{ paddingTop: '1rem' }}>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Duration (Weeks)
                      </p>
                      <p>{selectedActivityForView.duration_weeks ? `${selectedActivityForView.duration_weeks} weeks` : '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Duration (Hours)
                      </p>
                      <p>{selectedActivityForView.duration_hours ? `${selectedActivityForView.duration_hours} hours` : '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Effort Hours
                      </p>
                      <p>{selectedActivityForView.effort_hours ? `${selectedActivityForView.effort_hours} hours` : '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Fixed Price
                      </p>
                      <p>{selectedActivityForView.fixed_price ? `$${parseFloat(selectedActivityForView.fixed_price).toFixed(2)}` : '-'}</p>
                    </div>
                  </Column>
                </Grid>
              </AccordionItem>


              <AccordionItem title="Responsibilities">
                <Grid narrow style={{ paddingTop: '1rem' }}>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        IBM Responsibilities
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedActivityForView.ibm_responsibilities || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Client Responsibilities
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedActivityForView.client_responsibilities || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Assumptions
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedActivityForView.assumptions || '-'}</p>
                    </div>
                  </Column>
                </Grid>
              </AccordionItem>


              <AccordionItem title="Deliverables & Outcomes">
                <Grid narrow style={{ paddingTop: '1rem' }}>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Deliverables
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedActivityForView.deliverables || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Outcome
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedActivityForView.outcome || '-'}</p>
                    </div>
                  </Column>
                  <Column lg={16} md={8} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Completion Criteria
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedActivityForView.completion_criteria || '-'}</p>
                    </div>
                  </Column>
                </Grid>
              </AccordionItem>


              <AccordionItem title="Metadata">
                <Grid narrow style={{ paddingTop: '1rem' }}>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Created On
                      </p>
                      <p>{selectedActivityForView.created_on ? new Date(selectedActivityForView.created_on).toLocaleString() : '-'}</p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                        Updated On
                      </p>
                      <p>{selectedActivityForView.updated_on ? new Date(selectedActivityForView.updated_on).toLocaleString() : '-'}</p>
                    </div>
                  </Column>
                </Grid>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </Modal>
    </div>
  );
}
