import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  TextArea,
  NumberInput,
  Button,
  InlineNotification,
  Tile,
  Dropdown,
  MultiSelect,
  Grid,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  Accordion,
  AccordionItem,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import activityService from '../../services/activityService';
import offeringService from '../../services/offeringService';
import productService from '../../services/productService';
import wbsService from '../../services/wbsService';

export function ActivityForm() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(activityId);

  // Form state with all Activity model fields
  const [formData, setFormData] = useState({
    activity_name: '',
    brand: '',
    product_name: '',
    category: '',
    part_numbers: '',
    duration_weeks: null,
    duration_hours: null,
    outcome: '',
    description: '',
    effort_hours: null,
    fixed_price: null,
    client_responsibilities: '',
    ibm_responsibilities: '',
    assumptions: '',
    deliverables: '',
    completion_criteria: '',
    wbs: '',
    week: null,
  });

  // Dropdown data
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // WBS data for multi-select
  const [allWBS, setAllWBS] = useState([]);
  const [selectedWBSItems, setSelectedWBSItems] = useState([]);
  const [linkedWBSIds, setLinkedWBSIds] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      await fetchBrandsAndProducts();
      await fetchAllWBS();
    };
    initializeData();
  }, []);

  // Fetch activity data if in edit mode
  useEffect(() => {
    if (isEditMode && brands.length > 0 && allProducts.length > 0) {
      fetchActivity();
    }
  }, [activityId, brands, allProducts]);

  // Filter products when brand changes
  useEffect(() => {
    if (selectedBrand) {
      const brandProducts = allProducts.filter(p => p.brand_id === selectedBrand);
      setProducts(brandProducts);
    } else {
      setProducts([]);
    }
  }, [selectedBrand, allProducts]);

  const fetchBrandsAndProducts = async () => {
    try {
      const brandsData = await offeringService.getBrands();
      setBrands(brandsData);
      
      const productsPromises = brandsData.map(brand => 
        productService.getProductsByBrand(brand.brand_id)
      );
      const productsArrays = await Promise.all(productsPromises);
      const flatProducts = productsArrays.flat();
      setAllProducts(flatProducts);
    } catch (err) {
      console.error('Error fetching brands and products:', err);
      setError('Failed to load brands and products');
    }
  };

  const fetchAllWBS = async () => {
    try {
      const wbsData = await wbsService.getAllWBS();
      setAllWBS(wbsData);
    } catch (err) {
      console.error('Error fetching WBS:', err);
      setError('Failed to load WBS items');
    }
  };

  const fetchActivity = async () => {
    try {
      setInitialLoading(true);
      const data = await activityService.getActivityById(activityId);
      
      console.log('✅ Fetched activity data:', data);
      
      setFormData({
        activity_name: data.activity_name || '',
        brand: data.brand || '',
        product_name: data.product_name || '',
        category: data.category || '',
        part_numbers: data.part_numbers || '',
        duration_weeks: data.duration_weeks || null,
        duration_hours: data.duration_hours || null,
        outcome: data.outcome || '',
        description: data.description || '',
        effort_hours: data.effort_hours || null,
        fixed_price: data.fixed_price || null,
        client_responsibilities: data.client_responsibilities || '',
        ibm_responsibilities: data.ibm_responsibilities || '',
        assumptions: data.assumptions || '',
        deliverables: data.deliverables || '',
        completion_criteria: data.completion_criteria || '',
        wbs: data.wbs || '',
        week: data.week || null,
      });

      if (data.brand && brands.length > 0 && allProducts.length > 0) {
        const brand = brands.find(b => b.brand_name === data.brand);
        
        if (brand) {
          console.log('✅ Found brand:', brand);
          setSelectedBrand(brand.brand_id);
          
          const brandProducts = allProducts.filter(p => p.brand_id === brand.brand_id);
          setProducts(brandProducts);
          console.log('✅ Filtered products:', brandProducts);
          
          const product = brandProducts.find(p => p.product_name === data.product_name);
          if (product) {
            console.log('✅ Product found:', product);
          } else {
            console.warn('⚠️ Product not found:', data.product_name);
          }
        } else {
          console.warn('⚠️ Brand not found:', data.brand);
        }
      }

      if (activityId) {
        try {
          const linkedWBS = await wbsService.getWBSForActivity(activityId);
          setLinkedWBSIds(linkedWBS.map(w => w.wbs_id));
          setSelectedWBSItems(linkedWBS);
          console.log('✅ Linked WBS items:', linkedWBS);
        } catch (err) {
          console.error('Error fetching linked WBS:', err);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching activity:', err);
      setError('Failed to load activity');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBrandChange = ({ selectedItem }) => {
    if (selectedItem) {
      const brandName = selectedItem.brand_name;
      const brandId = selectedItem.brand_id;
      
      setFormData(prev => ({
        ...prev,
        brand: brandName,
        product_name: '',
      }));
      
      setSelectedBrand(brandId);
    } else {
      setFormData(prev => ({
        ...prev,
        brand: '',
        product_name: '',
      }));
      setSelectedBrand(null);
    }
  };

  const handleProductChange = ({ selectedItem }) => {
    if (selectedItem) {
      const productName = selectedItem.product_name;
      
      setFormData(prev => ({
        ...prev,
        product_name: productName,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product_name: '',
      }));
    }
  };

  const handleWBSChange = ({ selectedItems }) => {
    setSelectedWBSItems(selectedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.activity_name) {
      setError('Activity name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let savedActivityId = activityId;

      if (isEditMode) {
        console.log("Update Activity Details ", formData);
        await activityService.updateActivity(activityId, formData);
      } else {
        const newActivity = await activityService.createActivity(formData);
        savedActivityId = newActivity.activity_id;
      }

      if (savedActivityId) {
        const currentWBSIds = selectedWBSItems.map(w => w.wbs_id);
        const wbsToAdd = currentWBSIds.filter(id => !linkedWBSIds.includes(id));
        const wbsToRemove = linkedWBSIds.filter(id => !currentWBSIds.includes(id));

        for (const wbsId of wbsToAdd) {
          try {
            await wbsService.addWBSToActivity(savedActivityId, wbsId);
          } catch (err) {
            console.error(`Error adding WBS ${wbsId}:`, err);
          }
        }

        for (const wbsId of wbsToRemove) {
          try {
            await wbsService.removeWBSFromActivity(savedActivityId, wbsId);
          } catch (err) {
            console.error(`Error removing WBS ${wbsId}:`, err);
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/activities');
      }, 1500);
    } catch (err) {
      console.error('Error saving activity:', err);
      setError(err.message || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  // Skeleton Loading State
  if (initialLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
          <SkeletonText heading style={{ width: '300px' }} />
        </div>

        {/* Basic Information Skeleton */}
        <Tile style={{ marginBottom: '1rem' }}>
          <SkeletonText heading style={{ marginBottom: '1rem', width: '200px' }} />
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '40px' }} />
            </Column>
            <Column lg={4} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '40px' }} />
            </Column>
            <Column lg={4} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '40px' }} />
            </Column>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '40px' }} />
            </Column>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '40px' }} />
            </Column>
            <Column lg={16} md={8} sm={4}>
              <SkeletonText style={{ marginBottom: '1rem' }} />
              <SkeletonPlaceholder style={{ height: '80px' }} />
            </Column>
          </Grid>
        </Tile>

        {/* Duration & Effort Skeleton */}
        <Tile style={{ marginBottom: '1rem' }}>
          <SkeletonText heading style={{ marginBottom: '1rem', width: '200px' }} />
          <Grid narrow>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Column lg={4} md={4} sm={4} key={i}>
                <SkeletonText style={{ marginBottom: '1rem' }} />
                <SkeletonPlaceholder style={{ height: '40px' }} />
              </Column>
            ))}
          </Grid>
        </Tile>

        {/* WBS Skeleton */}
        <Tile style={{ marginBottom: '1rem' }}>
          <SkeletonText heading style={{ marginBottom: '1rem', width: '300px' }} />
          <SkeletonPlaceholder style={{ height: '48px', marginBottom: '0.5rem' }} />
          <SkeletonText style={{ width: '400px' }} />
        </Tile>

        {/* Action Buttons Skeleton */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '48px' }} />
          <SkeletonPlaceholder style={{ width: '150px', height: '48px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/admin/activities')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Activity' : 'Create New Activity'}
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
          subtitle={`Activity ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit} >
        {/* Basic Information */}
        <Tile style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Basic Information</h3>
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="activity_name"
                labelText="Activity Name *"
                value={formData.activity_name}
                onChange={(e) => handleInputChange('activity_name', e.target.value)}
                required
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <Dropdown
                id="brand"
                titleText="Brand"
                label="Select a brand"
                items={brands}
                itemToString={(item) => item?.brand_name || ''}
                selectedItem={
                  formData.brand && brands.length > 0
                    ? brands.find(b => b.brand_name === formData.brand) || null
                    : null
                }
                onChange={handleBrandChange}
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <Dropdown
                id="product"
                titleText="Product"
                label="Select a product"
                items={products}
                itemToString={(item) => item?.product_name || ''}
                selectedItem={
                  formData.product_name && products.length > 0
                    ? products.find(p => p.product_name === formData.product_name) || null
                    : null
                }
                onChange={handleProductChange}
                disabled={!selectedBrand && !formData.brand}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="category"
                labelText="Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
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

            <Column lg={16} md={8} sm={4}>
              <TextArea
                id="description"
                labelText="Description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Column>
          </Grid>
        </Tile>

        {/* Duration & Effort */}
        <Tile style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Duration & Effort</h3>
          <Grid narrow>
            <Column lg={4} md={4} sm={4}>
              <NumberInput
                id="duration_weeks"
                label="Duration (Weeks)"
                value={formData.duration_weeks || ''}
                onChange={(e, { value }) => handleInputChange('duration_weeks', value)}
                min={0}
                allowEmpty
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <NumberInput
                id="duration_hours"
                label="Duration (Hours)"
                value={formData.duration_hours || ''}
                onChange={(e, { value }) => handleInputChange('duration_hours', value)}
                min={0}
                allowEmpty
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <NumberInput
                id="effort_hours"
                label="Effort Hours"
                value={formData.effort_hours || ''}
                onChange={(e, { value }) => handleInputChange('effort_hours', value)}
                min={0}
                allowEmpty
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <NumberInput
                id="fixed_price"
                label="Fixed Price ($)"
                value={formData.fixed_price || ''}
                onChange={(e, { value }) => handleInputChange('fixed_price', value)}
                min={0}
                step={0.01}
                allowEmpty
              />
            </Column>

            <Column lg={4} md={4} sm={4}>
              <NumberInput
                id="week"
                label="Week"
                value={formData.week || ''}
                onChange={(e, { value }) => handleInputChange('week', value)}
                min={0}
                allowEmpty
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="wbs"
                labelText="WBS Code"
                value={formData.wbs}
                onChange={(e) => handleInputChange('wbs', e.target.value)}
                placeholder="Single WBS identifier"
              />
            </Column>
          </Grid>
        </Tile>

        {/* WBS Items */}
        <Tile style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Work Breakdown Structure</h3>
          <Grid narrow>
            <Column lg={16} md={8} sm={4}>
              <MultiSelect
                id="wbs-items"
                titleText="Link WBS Items"
                label="Select WBS items"
                items={allWBS}
                itemToString={(item) => item ? `${item.wbs_description} (${item.wbs_weeks} weeks)` : ''}
                selectedItems={selectedWBSItems}
                onChange={handleWBSChange}
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                Select multiple WBS items to link with this activity
              </p>
            </Column>
          </Grid>
        </Tile>

        {/* Expandable Sections */}
        <Accordion>
          <AccordionItem title="Responsibilities & Assumptions">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="ibm_responsibilities"
                  labelText="IBM Responsibilities"
                  rows={4}
                  value={formData.ibm_responsibilities}
                  onChange={(e) => handleInputChange('ibm_responsibilities', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="client_responsibilities"
                  labelText="Client Responsibilities"
                  rows={4}
                  value={formData.client_responsibilities}
                  onChange={(e) => handleInputChange('client_responsibilities', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="assumptions"
                  labelText="Assumptions"
                  rows={3}
                  value={formData.assumptions}
                  onChange={(e) => handleInputChange('assumptions', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>

          <AccordionItem title="Deliverables & Outcomes">
            <Grid narrow style={{ paddingTop: '1rem' }}>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="deliverables"
                  labelText="Deliverables"
                  rows={4}
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange('deliverables', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="outcome"
                  labelText="Outcome"
                  rows={4}
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                />
              </Column>
              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="completion_criteria"
                  labelText="Completion Criteria"
                  rows={3}
                  value={formData.completion_criteria}
                  onChange={(e) => handleInputChange('completion_criteria', e.target.value)}
                />
              </Column>
            </Grid>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/activities')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Activity' : 'Create Activity'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
