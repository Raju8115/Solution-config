import { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  Search,
  Save,
  TrashCan,
  Currency,
  Tree,
  Time,
  User,
  ChevronRight,
  Draggable,
  Document,
  DocumentExport,
  Add,
  Information,
  Crossroads,
  CheckmarkFilled,
  WarningAlt,
  UserFollow,
  ChevronLeft,
  CloseOutline,
  EarthFilled,
  Percentage,
  ShoppingCart,
  Copy,
  Tag as TagIcon,
  Category,
  Template,
  Enterprise,
  Catalog,
  ListBoxes
} from '@carbon/icons-react';
import {
  Button,
  TextInput,
  Tile,
  Tag,
  Dropdown,
  Modal,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Search as SearchComponent,
  NumberInput,
  InlineNotification,
  Loading,
} from '@carbon/react';
import { useAuth } from '../contexts/AuthContexts';
import { usePermissions } from '../hooks/usePermissions';
import countryService from '../services/countryService';
import offeringService from '../services/offeringService';
import activityService from '../services/activityService';
import staffingService from '../services/staffingService';
import pricingService from '../services/pricingService';
import productService from '../services/productService';

// Helper function to get rate from pricing data
const getRate = (pricingData, country, role, band) => {
  if (!pricingData || pricingData.length === 0) return 100;
  
  const pricing = pricingData.find(p => 
    p.country === country && 
    p.role === role && 
    p.band === band
  );
  
  return pricing ? (pricing.sale_price || pricing.cost || 100) : 100;
};

export function SolutionBuilder() {
  const { userRoles, userProfile } = useAuth();
  const permissions = usePermissions();

  // Data state
  const [countries, setCountries] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [pricingData, setPricingData] = useState([]);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Error states
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Selection state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedOffering, setSelectedOffering] = useState('');
  
  // Activities state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingActivity, setReviewingActivity] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Export modal state
  const [isBPEModalOpen, setIsBPEModalOpen] = useState(false);
  const [isWBSModalOpen, setIsWBSModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch brands when country is selected
  useEffect(() => {
    if (selectedCountry) {
      fetchBrands();
    }
  }, [selectedCountry]);

  // Fetch products when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      fetchProducts(selectedBrand);
    }
  }, [selectedBrand]);

  // Fetch offerings when product is selected
  useEffect(() => {
    if (selectedProduct) {
      fetchOfferings(selectedProduct);
    }
  }, [selectedProduct]);

  // Fetch activities when offering is selected
  useEffect(() => {
    if (selectedOffering) {
      fetchActivities(selectedOffering);
    }
  }, [selectedOffering]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      setError(null);
      const data = await countryService.getCountries();
      const formattedCountries = data.map(c => ({
        id: c.country_id,
        name: c.country_name
      }));
      setCountries(formattedCountries);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      setError(null);
      const data = await offeringService.getBrands();
      const formattedBrands = data.map(b => ({
        id: b.brand_id,
        name: b.brand_name
      }));
      setBrands(formattedBrands);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchProducts = async (brandId) => {
    try {
      setLoadingProducts(true);
      setError(null);
      const data = await productService.getProductsByBrand(brandId);
      const formattedProducts = data.map(p => ({
        id: p.product_id,
        name: p.product_name,
        brandId: brandId
      }));
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOfferings = async (productId) => {
    try {
      setLoadingOfferings(true);
      setError(null);
      const data = await offeringService.getOfferings(productId);
      const formattedOfferings = data.map(o => ({
        id: o.offering_id,
        name: o.offering_name,
        productId: productId,
        duration: parseDuration(o.duration),
        price: 0,
        rawData: o
      }));
      setOfferings(formattedOfferings);
    } catch (err) {
      console.error('Error fetching offerings:', err);
      setError('Failed to load offerings');
    } finally {
      setLoadingOfferings(false);
    }
  };

  const fetchActivities = async (offeringId) => {
    try {
      setLoadingActivities(true);
      setError(null);
      
      const activitiesData = await activityService.getActivitiesByOffering(offeringId);
      const staffingData = await staffingService.getStaffingByOffering(offeringId);
      
      setPricingData(staffingData);
      
      const formattedActivities = activitiesData.map(activity => {
        const activityStaffing = staffingData.filter(s => s.activity_id === activity.activity_id);
        const hours = activityStaffing.reduce((sum, s) => sum + (s.hours || 0), 0);
        const cost = calculateActivityCost(activityStaffing);
        
        return {
          id: activity.activity_id,
          name: activity.activity_name,
          offeringId: offeringId,
          category: activity.category || 'General',
          duration: Math.ceil((activity.duration_weeks || activity.duration_hours / 40 || 1)),
          hours: hours || activity.effort_hours || activity.duration_hours || 40,
          cost: cost || (activity.fixed_price || 0),
          scope: activity.description || 'Activity scope',
          outcome: activity.outcome || activity.deliverables || 'Activity outcome',
          responsibilities: formatResponsibilities(activity),
          assumptions: activity.assumptions || 'Standard assumptions apply',
          completionCriteria: activity.completion_criteria || activity.deliverables || activity.outcome,
          staffing: activityStaffing.map(s => ({
            role: s.role,
            country: s.country,
            band: s.band,
            hours: s.hours
          })),
          rawData: activity,
          originalId: activity.activity_id
        };
      });
      
      setAvailableActivities(formattedActivities);
      
      if (formattedActivities.length > 0) {
        const first3 = formattedActivities.slice(0, 3).map((activity, index) => ({
          ...activity,
          id: `${activity.id}-${Date.now()}-${index}`,
          originalId: activity.id,
          order: index
        }));
        setSelectedActivities(first3);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
      setAvailableActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const calculateActivityCost = (staffing) => {
    return staffing.reduce((sum, s) => {
      const rate = 200;
      return sum + ((s.hours || 0) * rate);
    }, 0);
  };

  const formatResponsibilities = (activity) => {
    const ibm = activity.ibm_responsibilities || 'IBM responsibilities not specified';
    const client = activity.client_responsibilities || 'Client responsibilities not specified';
    return `IBM: ${ibm}\n\nClient: ${client}`;
  };

  const getOriginalActivityId = (activity) => {
    if (activity.originalId !== undefined) {
      return String(activity.originalId);
    }
    if (typeof activity.id === 'string' && activity.id.includes('-')) {
      return activity.id.split('-')[0];
    }
    return String(activity.id);
  };

  const isActivitySelected = (activity) => {
    const activityOriginalId = getOriginalActivityId(activity);
    return selectedActivities.some(selectedActivity => {
      const selectedOriginalId = getOriginalActivityId(selectedActivity);
      return selectedOriginalId === activityOriginalId;
    });
  };

  const filteredProducts = selectedBrand 
    ? products.filter(p => p.brandId === selectedBrand)
    : [];
  
  const filteredOfferings = selectedProduct
    ? offerings.filter(o => o.productId === selectedProduct)
    : [];
  
  const filteredActivities = availableActivities
    .filter(activity =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aSelected = isActivitySelected(a);
      const bSelected = isActivitySelected(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOffering]);

  const handleCountryChange = ({ selectedItem }) => {
    setSelectedCountry(selectedItem?.id || '');
    setSelectedBrand('');
    setSelectedProduct('');
    setSelectedOffering('');
    setSelectedActivities([]);
    setProducts([]);
    setOfferings([]);
    setAvailableActivities([]);
  };

  const handleBrandChange = ({ selectedItem }) => {
    setSelectedBrand(selectedItem?.id || '');
    setSelectedProduct('');
    setSelectedOffering('');
    setSelectedActivities([]);
    setOfferings([]);
    setAvailableActivities([]);
  };

  const handleProductChange = ({ selectedItem }) => {
    setSelectedProduct(selectedItem?.id || '');
    setSelectedOffering('');
    setSelectedActivities([]);
    setAvailableActivities([]);
  };

  const handleOfferingChange = ({ selectedItem }) => {
    setSelectedOffering(selectedItem?.id || '');
    setSelectedActivities([]);
  };

  const openReviewModal = (activity) => {
    setReviewingActivity(activity);
    setActiveTab(0);
    setIsReviewModalOpen(true);
  };

  const addActivityAfterReview = () => {
    if (reviewingActivity) {
      setSelectedActivities([...selectedActivities, { 
        ...reviewingActivity, 
        id: `${reviewingActivity.id}-${Date.now()}`,
        originalId: reviewingActivity.id,
        order: selectedActivities.length
      }]);
      setIsReviewModalOpen(false);
      setReviewingActivity(null);
      setSuccessMessage('Activity added to canvas successfully!');
    }
  };

  const removeActivity = (activity) => {
  setActivityToDelete(activity);
  setIsDeleteConfirmOpen(true);
};

const confirmRemoveActivity = () => {
  if (activityToDelete) {
    setSelectedActivities(selectedActivities.filter(a => a.id !== activityToDelete.id));
    setSuccessMessage(`"${activityToDelete.name}" removed from canvas`);
    setIsDeleteConfirmOpen(false);
    setActivityToDelete(null);
  }
};


const cancelRemoveActivity = () => {
  setIsDeleteConfirmOpen(false);
  setActivityToDelete(null);
};

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newActivities = [...selectedActivities];
    const draggedItem = newActivities[draggedIndex];
    
    newActivities.splice(draggedIndex, 1);
    newActivities.splice(index, 0, draggedItem);
    
    setSelectedActivities(newActivities);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const generateBPEText = () => {
    let text = 'BUDGET PLANNING & ESTIMATE\n\n';
    text += '='.repeat(80) + '\n\n';
    
    text += 'ACTIVITIES:\n\n';
    
    selectedActivities.forEach((activity, index) => {
      text += `Activity ${index + 1}: ${activity.name}\n`;
      text += '-'.repeat(80) + '\n';
      text += `Description (Scope):\n${activity.scope}\n\n`;
      text += `Deliverables:\n${activity.outcome}\n\n`;
      text += `Responsibilities:\n${activity.responsibilities}\n\n`;
      text += `Assumptions:\n${activity.assumptions}\n\n`;
      text += `Completion Criteria:\n${activity.completionCriteria || activity.outcome}\n\n`;
      text += '\n';
    });

    text += '='.repeat(80) + '\n\n';
    text += 'BUDGET AND PLANNING ESTIMATED CHARGES:\n\n';

    const combinedStaffing = {};
    
    selectedActivities.forEach(activity => {
      if (activity.staffing) {
        activity.staffing.forEach(staff => {
          const key = `${staff.role} B${staff.band} (${staff.country})`;
          if (!combinedStaffing[key]) {
            combinedStaffing[key] = {
              role: staff.role,
              band: staff.band,
              country: staff.country,
              hours: 0,
              rate: 200
            };
          }
          combinedStaffing[key].hours += staff.hours;
        });
      }
    });

    let grandTotal = 0;
    Object.values(combinedStaffing).forEach(staff => {
      const total = staff.hours * staff.rate;
      grandTotal += total;
      text += `Resource: ${staff.role} B${staff.band} (${staff.country})\n`;
      text += `  Estimated Hours: ${staff.hours}\n`;
      text += `  Rate/Hour: $${staff.rate}\n`;
      text += `  Total: ${staff.hours} x $${staff.rate} = $${total.toLocaleString()}\n\n`;
    });

    text += '-'.repeat(80) + '\n';
    text += `TOTAL CHARGES: $${grandTotal.toLocaleString()}\n`;
    text += '='.repeat(80) + '\n';

    return text;
  };

  const generateWBSText = () => {
    let text = 'WORK BREAKDOWN STRUCTURE\n\n';
    text += '='.repeat(80) + '\n\n';
    
    text += 'ACTIVITIES:\n\n';
    
    selectedActivities.forEach((activity, index) => {
      text += `Activity ${index + 1}: ${activity.name}\n`;
      text += '-'.repeat(80) + '\n';
      text += `Description (Scope):\n${activity.scope}\n\n`;
      
      text += 'Resources:\n';
      let activityTotalHours = 0;
      if (activity.staffing) {
        activity.staffing.forEach(staff => {
          text += `  Resource: ${staff.role} B${staff.band} (${staff.country}), Estimated Hours: ${staff.hours}\n`;
          activityTotalHours += staff.hours;
        });
      }
      text += `\nTotal: ${activityTotalHours} Estimated Hours\n\n`;
      text += '\n';
    });

    text += '='.repeat(80) + '\n\n';
    text += 'TOTALS:\n\n';

    const combinedStaffing = {};
    
    selectedActivities.forEach(activity => {
      if (activity.staffing) {
        activity.staffing.forEach(staff => {
          const key = `${staff.role} B${staff.band} (${staff.country})`;
          if (!combinedStaffing[key]) {
            combinedStaffing[key] = {
              role: staff.role,
              band: staff.band,
              country: staff.country,
              hours: 0
            };
          }
          combinedStaffing[key].hours += staff.hours;
        });
      }
    });

    let grandTotalHours = 0;
    Object.values(combinedStaffing).forEach(staff => {
      grandTotalHours += staff.hours;
      text += `Resource: ${staff.role} B${staff.band} (${staff.country}), Estimated Hours: ${staff.hours}\n`;
    });

    text += '\n' + '-'.repeat(80) + '\n';
    text += `TOTAL ESTIMATED HOURS: ${grandTotalHours}\n`;
    text += '='.repeat(80) + '\n';

    return text;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const exportBPE = () => {
    setIsBPEModalOpen(true);
    setCopySuccess(false);
  };

  const exportWBS = () => {
    setIsWBSModalOpen(true);
    setCopySuccess(false);
  };

  const totals = selectedActivities.reduce(
    (acc, activity) => ({
      weeks: acc.weeks + activity.duration,
      hours: acc.hours + activity.hours,
      cost: acc.cost + activity.cost,
    }),
    { weeks: 0, hours: 0, cost: 0 }
  );

  const salesPrice = totals.cost;

  const selectedCountryName = countries.find(c => c.id === selectedCountry)?.name || '';
  const selectedBrandName = brands.find(b => b.id === selectedBrand)?.name || '';
  const selectedProductName = products.find(p => p.id === selectedProduct)?.name || '';
  const selectedOfferingName = offerings.find(o => o.id === selectedOffering)?.name || '';

  if (loadingCountries) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading description="Loading solution builder..." withOverlay={false} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f4', paddingTop: '3rem'}}>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Left Panel - Selection Wizard + Summary */}
        <aside 
          style={{
            width: '320px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div 
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f4f4f4',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                Build Solution
              </h2>
              {permissions.isAdmin ? (
                <Tag type="red" size="sm">ADMIN</Tag>
              ) : permissions.isSolutionArchitect ? (
                <Tag type="blue" size="sm">ARCHITECT</Tag>
              ) : null}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#525252' }}>
              Select country, brand, product, and offering
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                onCloseButtonClick={() => setError(null)}
                lowContrast
                style={{ marginBottom: '1rem' }}
              />
            )}

            {successMessage && (
              <InlineNotification
                kind="success"
                title="Success"
                subtitle={successMessage}
                onCloseButtonClick={() => setSuccessMessage(null)}
                lowContrast
                hideCloseButton={false}
                style={{ marginBottom: '1rem' }}
              />
            )}

            {/* Step 1: Country Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div 
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#0f62fe',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Select Country
                </h3>
              </div>
              <Dropdown
                id="country-dropdown"
                titleText=""
                label="Choose a country..."
                items={countries}
                itemToString={(item) => (item ? item.name : '')}
                onChange={handleCountryChange}
                selectedItem={countries.find(c => c.id === selectedCountry) || null}
              />
            </div>

            {/* Step 2: Brand Selection */}
            {selectedCountry && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div 
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      backgroundColor: '#0f62fe',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    2
                  </div>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Select Brand
                  </h3>
                </div>
                {loadingBrands ? (
                  <Loading description="Loading brands..." small />
                ) : (
                  <Dropdown
                    id="brand-dropdown"
                    titleText=""
                    label="Choose a brand..."
                    items={brands}
                    itemToString={(item) => (item ? item.name : '')}
                    onChange={handleBrandChange}
                    selectedItem={brands.find(b => b.id === selectedBrand) || null}
                  />
                )}
              </div>
            )}

            {/* Step 3: Product Selection */}
            {selectedBrand && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div 
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      backgroundColor: '#0f62fe',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    3
                  </div>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Select Product
                  </h3>
                </div>
                {loadingProducts ? (
                  <Loading description="Loading products..." small />
                ) : (
                  <Dropdown
                    id="product-dropdown"
                    titleText=""
                    label="Choose a product..."
                    items={filteredProducts}
                    itemToString={(item) => (item ? item.name : '')}
                    onChange={handleProductChange}
                    selectedItem={products.find(p => p.id === selectedProduct) || null}
                  />
                )}
              </div>
            )}

            {/* Step 4: Offering Selection */}
            {selectedProduct && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div 
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      backgroundColor: '#0f62fe',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    4
                  </div>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Select Offering/Template
                  </h3>
                </div>
                {loadingOfferings ? (
                  <Loading description="Loading offerings..." small />
                ) : (
                  <Dropdown
                    id="offering-dropdown"
                    titleText=""
                    label="Choose an offering..."
                    items={filteredOfferings}
                    itemToString={(item) => (item ? item.name : '')}
                    onChange={handleOfferingChange}
                    selectedItem={offerings.find(o => o.id === selectedOffering) || null}
                  />
                )}
              </div>
            )}
          </div>

          {/* Summary Section - Bottom of Sidebar */}
          {selectedActivities.length > 0 && (
            <div 
              style={{
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f4f4f4',
                padding: '1.25rem',
                flexShrink: 0
              }}
            >
              <div>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Solution Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Tile 
                    style={{
                      padding: '0.75rem',
                      borderLeft: '4px solid #0f62fe',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Time size={16} style={{ color: '#0f62fe' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Duration</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{totals.weeks}w</span>
                    </div>
                  </Tile>
                  <Tile 
                    style={{
                      padding: '0.75rem',
                      borderLeft: '4px solid #8a3ffc',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} style={{ color: '#8a3ffc' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Hours</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{totals.hours}h</span>
                    </div>
                  </Tile>
                  <Tile 
                    style={{
                      padding: '0.75rem',
                      borderLeft: '4px solid #da1e28',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Currency size={16} style={{ color: '#da1e28' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Total Cost</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>${totals.cost.toLocaleString()}</span>
                    </div>
                  </Tile>
                  <Tile 
                    style={{
                      padding: '0.75rem',
                      borderLeft: '4px solid #24a148',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart size={16} style={{ color: '#24a148' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sales Price</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>${salesPrice.toLocaleString()}</span>
                    </div>
                  </Tile>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f4f4f4' }}>
          {selectedOffering ? (
            <div style={{ padding: '1.5rem' }}>
              {/* Header with Export Buttons */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Available Activities
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#525252' }}>
                      <span>{selectedCountryName}</span>
                      <ChevronRight size={16} />
                      <span>{selectedBrandName}</span>
                      <ChevronRight size={16} />
                      <span>{selectedProductName}</span>
                      <ChevronRight size={16} />
                      <span>{selectedOfferingName}</span>
                    </div>
                  </div>
                  
                  {/* Export Buttons */}
                  {selectedActivities.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <Button 
                        kind="primary"
                        onClick={exportBPE}
                        renderIcon={Document}
                      >
                        Export BP&E
                      </Button>
                      <Button 
                        kind="primary"
                        onClick={exportWBS}
                        renderIcon={DocumentExport}
                      >
                        Export WBS
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search */}
              <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                <SearchComponent
                  id="search-activities"
                  labelText=""
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="lg"
                  closeButtonLabelText="Clear search"
                />
              </div>

              {/* Activities Grid */}
              {loadingActivities ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loading description="Loading activities..." />
                </div>
              ) : filteredActivities.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {paginatedActivities.map(activity => {
                      const selected = isActivitySelected(activity);
                      return (
                        <Tile 
                          key={activity.id} 
                          style={{
                            padding: '1.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: 'white',
                            ...(selected && { borderLeft: '4px solid #0f62fe' })
                          }}
                          onClick={() => openReviewModal(activity)}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, flex: 1, paddingRight: '0.5rem' }}>
                              {activity.name}
                            </h3>
                            <Tag type="cool-gray" size="sm">
                              {activity.category}
                            </Tag>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#525252' }}>
                                <Time size={16} />
                                Duration
                              </span>
                              <span style={{ fontWeight: 600 }}>{activity.duration} weeks</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#525252' }}>
                                <User size={16} />
                                Hours
                              </span>
                              <span style={{ fontWeight: 600 }}>{activity.hours}h</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#525252' }}>
                                <Currency size={16} />
                                Cost
                              </span>
                              <span style={{ fontWeight: 600 }}>${activity.cost.toLocaleString()}</span>
                            </div>
                          </div>

                          <div style={{ marginTop: '10px' }}>
                            <Button
                              kind="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReviewModal(activity);
                              }}
                              style={{ width: '100%' }}
                            >
                              View Details
                            </Button>
                          </div>
                        </Tile>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                      <Button
                        style={{width: '1rem'}}
                        kind="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        hasIconOnly
                        renderIcon={ChevronLeft}
                        iconDescription="Previous page"
                      />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            kind={currentPage === page ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        hasIconOnly
                        renderIcon={ChevronRight}
                        iconDescription="Next page"
                      />
                    </div>
                  )}
                </>
              ) : (
                <Tile style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ color: '#525252' }}>
                    <SearchIcon size={48} style={{ margin: '0 auto 1rem', color: '#0f62fe' }} />
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>No activities found</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      {availableActivities.length === 0 
                        ? 'No activities available for this offering'
                        : 'Try adjusting your search criteria'}
                    </p>
                  </div>
                </Tile>
              )}

              {/* Solution Canvas Section */}
              <div 
                style={{
                  borderTop: '4px solid #0f62fe',
                  backgroundColor: '#ffffff',
                  marginTop: '2rem'
                }}
              >
                <div 
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f4f4f4'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Solution Canvas
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: '#525252' }}>
                        {selectedActivities.length === 0 
                          ? 'No activities added yet - review and add activities from above'
                          : `${selectedActivities.length} ${selectedActivities.length === 1 ? 'activity' : 'activities'} selected - drag to reorder`}
                      </p>
                    </div>
                    {selectedActivities.length > 0 && (
                      <Tag type="blue" size="lg">
                        {selectedActivities.length}
                      </Tag>
                    )}
                  </div>
                </div>

                {selectedActivities.length > 0 ? (
                  <div style={{ padding: '1.5rem' }}>
                    {/* Table Header */}
                    <div 
                      style={{
                        backgroundColor: '#f4f4f4',
                        borderBottom: '2px solid #161616',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 4fr 2fr 1fr 1fr 2fr 1fr', gap: '1rem', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        <div style={{ textAlign: 'center' }}>SL.No</div>
                        <div>Activity Name</div>
                        <div>Category</div>
                        <div style={{ textAlign: 'center' }}>Duration</div>
                        <div style={{ textAlign: 'center' }}>Hours</div>
                        <div style={{ textAlign: 'center' }}>Cost</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                      </div>
                    </div>

                    {/* Activities Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedActivities.map((activity, index) => (
                        <div
                          key={activity.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          style={{
                            opacity: draggedIndex === index ? 0.5 : 1,
                            cursor: 'move',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Tile 
                            style={{
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 4fr 2fr 1fr 1fr 2fr 1fr', gap: '1rem', alignItems: 'center' }}>
                              {/* Order Number + Drag Handle */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Draggable size={20} style={{ color: '#525252' }} />
                                <span 
                                  style={{
                                    width: '1.75rem',
                                    height: '1.75rem',
                                    borderRadius: '50%',
                                    backgroundColor: '#0f62fe',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                  }}
                                >
                                  {index + 1}
                                </span>
                              </div>

                              {/* Activity Name */}
                              <div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                  {activity.name}
                                </h4>
                              </div>

                              {/* Category */}
                              <div>
                                <Tag type="cool-gray" size="sm">
                                  {activity.category}
                                </Tag>
                              </div>

                              {/* Duration */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <Time size={16} style={{ color: '#525252', marginBottom: '0.25rem' }} />
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{activity.duration}w</span>
                                </div>
                              </div>

                              {/* Hours */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <User size={16} style={{ color: '#525252', marginBottom: '0.25rem' }} />
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{activity.hours}h</span>
                                </div>
                              </div>

                              {/* Cost */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <Currency size={16} style={{ color: '#525252', marginBottom: '0.25rem' }} />
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>${activity.cost.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  onClick={() => removeActivity(activity)}
                                  hasIconOnly
                                  renderIcon={TrashCan}
                                  iconDescription="Remove Activity"
                                />
                              </div>
                            </div>
                          </Tile>
                        </div>
                      ))}
                    </div>

                    {/* Total Row */}
                    <div 
                      style={{
                        marginTop: '1rem',
                        backgroundColor: '#f4f4f4',
                        border: '2px solid #0f62fe'
                      }}
                    >
                      <Tile>
                        <div style={{ display: 'grid', gridTemplateColumns: '5fr 2fr 1fr 1fr 2fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                              Total:
                            </span>
                          </div>
                          <div></div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f62fe' }}>{totals.weeks}w</span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f62fe' }}>{totals.hours}h</span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f62fe' }}>${totals.cost.toLocaleString()}</span>
                          </div>
                          <div></div>
                        </div>

                        {/* Additional Pricing Info */}
                        <div 
                          style={{
                            borderTop: '1px solid #e0e0e0',
                            paddingTop: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                              Total Cost
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#da1e28' }}>
                              ${totals.cost.toLocaleString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                              Sales Price
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#24a148' }}>
                              ${salesPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Tile>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#525252' }}>
                    <Add size={64} style={{ margin: '0 auto 1rem', color: '#e0e0e0' }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Canvas is empty</p>
                    <p style={{ fontSize: '0.875rem' }}>Review and add activities from above to build your solution</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ textAlign: 'center', color: '#525252' }}>
                <div 
                  style={{
                    width: '6rem',
                    height: '6rem',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '50%',
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!selectedCountry ? (
                    <EarthFilled size={64} style={{ color: '#0f62fe' }} />
                  ) : !selectedBrand ? (
                    <Enterprise size={64} style={{ color: '#0f62fe' }} />
                  ) : !selectedProduct ? (
                    <Catalog size={64} style={{ color: '#0f62fe' }} />
                  ) : (
                    <ListBoxes size={64} style={{ color: '#0f62fe' }} />
                  )}
                </div>
                <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {!selectedCountry 
                    ? 'Start by selecting a country from the left panel'
                    : !selectedBrand 
                    ? 'Select a brand to continue'
                    : !selectedProduct 
                    ? 'Select a product to view available offerings'
                    : 'Select an offering to view its activities'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#8d8d8d' }}>
                  {!selectedCountry 
                    ? 'Choose the country where your solution will be delivered'
                    : !selectedBrand 
                    ? 'Pick the brand that aligns with your solution'
                    : !selectedProduct 
                    ? 'Choose a product from the selected brand'
                    : 'Pick an offering template to begin building your solution'}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Activity Modal with Tabs */}
      <Modal
        open={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        modalHeading={reviewingActivity?.name || ''}
        primaryButtonText="Add to Canvas"
        secondaryButtonText="Cancel"
        onRequestSubmit={addActivityAfterReview}
        size="lg"
      >
        {reviewingActivity && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <Tag type="cool-gray">
                {reviewingActivity.category}
              </Tag>
              <span style={{ fontSize: '0.875rem', color: '#525252', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Time size={16} />
                {reviewingActivity.duration} weeks
              </span>
              <span style={{ fontSize: '0.875rem', color: '#525252', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={16} />
                {reviewingActivity.hours}h
              </span>
              <span style={{ fontSize: '0.875rem', color: '#525252', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Currency size={16} />
                ${reviewingActivity.cost.toLocaleString()}
              </span>
            </div>

            <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
              <TabList aria-label="Activity details tabs" style={{width:'100%'}}>
                <Tab>Overview</Tab>
                <Tab>Scope</Tab>
                <Tab>Outcome</Tab>
                <Tab>Responsibilities</Tab>
                <Tab>Assumptions</Tab>
                <Tab>Staffing</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div style={{ paddingTop: '1rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                        Activity Summary
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <Tile style={{ padding: '1rem', backgroundColor: '#f4f4f4' }}>
                          <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Category</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{reviewingActivity.category}</div>
                        </Tile>
                        <Tile style={{ padding: '1rem', backgroundColor: '#f4f4f4' }}>
                          <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Duration</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{reviewingActivity.duration} weeks</div>
                        </Tile>
                        <Tile style={{ padding: '1rem', backgroundColor: '#f4f4f4' }}>
                          <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Total Hours</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{reviewingActivity.hours}h</div>
                        </Tile>
                        <Tile style={{ padding: '1rem', backgroundColor: '#f4f4f4' }}>
                          <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Estimated Cost</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>${reviewingActivity.cost.toLocaleString()}</div>
                        </Tile>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                        Quick Overview
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Tile style={{ backgroundColor: '#f4f4f4', padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <Crossroads size={20} style={{ color: '#0f62fe', marginTop: '0.125rem', flexShrink: 0 }} />
                            <div>
                              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Scope</h4>
                              <p style={{ fontSize: '0.875rem', color: '#525252' }}>{reviewingActivity.scope}</p>
                            </div>
                          </div>
                        </Tile>
                        <Tile style={{ backgroundColor: '#f4f4f4', padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <CheckmarkFilled size={20} style={{ color: '#24a148', marginTop: '0.125rem', flexShrink: 0 }} />
                            <div>
                              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Expected Outcome</h4>
                              <p style={{ fontSize: '0.875rem', color: '#525252' }}>{reviewingActivity.outcome}</p>
                            </div>
                          </div>
                        </Tile>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel>
                  <Tile 
                    style={{
                      backgroundColor: '#f4f4f4',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Crossroads size={20} style={{ color: '#0f62fe' }} />
                      Scope of Work
                    </h3>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {reviewingActivity.scope}
                    </p>
                  </Tile>
                </TabPanel>

                <TabPanel>
                  <Tile 
                    style={{
                      backgroundColor: '#f4f4f4',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckmarkFilled size={20} style={{ color: '#24a148' }} />
                      Expected Outcomes
                    </h3>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {reviewingActivity.outcome}
                    </p>
                  </Tile>
                </TabPanel>

                <TabPanel>
                  <Tile 
                    style={{
                      backgroundColor: '#f4f4f4',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserFollow size={20} style={{ color: '#8a3ffc' }} />
                      Role Responsibilities
                    </h3>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {reviewingActivity.responsibilities}
                    </p>
                  </Tile>
                </TabPanel>

                <TabPanel>
                  <Tile 
                    style={{
                      backgroundColor: '#fff3cd',
                      borderLeft: '4px solid #f1c21b',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <WarningAlt size={20} style={{ color: '#f1c21b' }} />
                      Key Assumptions
                    </h3>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {reviewingActivity.assumptions}
                    </p>
                  </Tile>
                </TabPanel>

                <TabPanel>
                  <Tile 
                    style={{
                      backgroundColor: '#f4f4f4',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={20} style={{ color: '#0f62fe' }} />
                      Resource Requirements (Total: {reviewingActivity.hours}h) - Read Only
                    </h3>
                    {reviewingActivity.staffing && reviewingActivity.staffing.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {reviewingActivity.staffing.map((staff, index) => (
                          <Tile 
                            key={index}
                            style={{
                              backgroundColor: '#ffffff',
                              padding: '1rem',
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Role</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{staff.role}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Country</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{staff.country}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Band</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f62fe' }}>Band {staff.band}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.25rem' }}>Hours</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f62fe' }}>{staff.hours}h</div>
                              </div>
                            </div>
                          </Tile>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: '#525252' }}>No staffing details available</p>
                    )}
                  </Tile>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* BP&E Export Modal */}
      <Modal
        open={isBPEModalOpen}
        onRequestClose={() => setIsBPEModalOpen(false)}
        modalHeading="Budget Planning & Estimate"
        passiveModal
        size="lg"
        style={{ marginTop: '3rem'}}
      >
        <div style={{ marginBottom: '1rem'}}>
          {copySuccess && (
            <InlineNotification
              kind="success"
              title="Copied!"
              subtitle="Text copied to clipboard"
              hideCloseButton
              lowContrast
              style={{ marginBottom: '1rem' }}
            />
          )}
          <Button
            kind="primary"
            renderIcon={Copy}
            onClick={() => copyToClipboard(generateBPEText())}
            style={{ marginBottom: '1rem' }}
          >
            Copy All Text
          </Button>
        </div>
        <Tile style={{ backgroundColor: '#f4f4f4', padding: '1.5rem' }}>
          <pre style={{ 
            fontFamily: 'IBM Plex Mono, monospace', 
            fontSize: '0.75rem', 
            whiteSpace: 'pre-wrap', 
            wordWrap: 'break-word',
            lineHeight: '1.5'
          }}>
            {generateBPEText()}
          </pre>
        </Tile>
      </Modal>

      {/* WBS Export Modal */}
      <Modal
        open={isWBSModalOpen}
        onRequestClose={() => setIsWBSModalOpen(false)}
        modalHeading="Work Breakdown Structure"
        passiveModal
        size="lg"
        style={{ marginTop: '3rem'}}
      >
        <div style={{ marginBottom: '1rem' }}>
          {copySuccess && (
            <InlineNotification
              kind="success"
              title="Copied!"
              subtitle="Text copied to clipboard"
              hideCloseButton
              lowContrast
              style={{ marginBottom: '1rem' }}
            />
          )}
          <Button
            kind="primary"
            renderIcon={Copy}
            onClick={() => copyToClipboard(generateWBSText())}
            style={{ marginBottom: '1rem' }}
          >
            Copy All Text
          </Button>
        </div>
        <Tile style={{ backgroundColor: '#f4f4f4', padding: '1.5rem' }}>
          <pre style={{ 
            fontFamily: 'IBM Plex Mono, monospace', 
            fontSize: '0.75rem', 
            whiteSpace: 'pre-wrap', 
            wordWrap: 'break-word',
            lineHeight: '1.5'
          }}>
            {generateWBSText()}
          </pre>
        </Tile>
      </Modal>

            {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onRequestClose={cancelRemoveActivity}
        modalHeading="Remove Activity from Canvas?"
        primaryButtonText="Remove"
        secondaryButtonText="Cancel"
        onRequestSubmit={confirmRemoveActivity}
        onSecondarySubmit={cancelRemoveActivity}
        danger
        size="sm"
      >
        {activityToDelete && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Are you sure you want to remove <strong>"{activityToDelete.name}"</strong> from your solution canvas?
            </p>
            
            <Tile style={{ backgroundColor: '#fff1f1', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <WarningAlt size={20} style={{ color: '#da1e28', marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '0.5rem' }}>
                    This will remove the activity from your current solution. The activity will still be available in the activity library.
                  </p>
                  {/* <div style={{ fontSize: '0.75rem', color: '#8d8d8d' }}>
                    <div>Duration: {activityToDelete.duration} weeks</div>
                    <div>Hours: {activityToDelete.hours}h</div>
                    <div>Cost: ${activityToDelete.cost.toLocaleString()}</div>
                  </div> */}
                </div>
              </div>
            </Tile>
          </div>
        )}
      </Modal>
    </div>
  );
}