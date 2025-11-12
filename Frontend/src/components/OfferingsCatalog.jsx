// OfferingsCatalog.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import {
  Search as SearchIcon,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ChevronDown,
  Package as PackageIcon,
  Information,
  Launch,
  Document,
  Crossroads,
  CheckmarkFilled,
  WarningAlt,
  Link as LinkIcon,
} from '@carbon/icons-react';
import {
  Button,
  Search,
  Tile,
  Tag,
  Checkbox,
  Dropdown,
  Modal,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  Pagination,
  Loading,
  InlineNotification,
} from '@carbon/react';

import offeringService from '../services/offeringService';

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
              <Crossroads size={20} />
              <h4 className="text-heading-03 font-semibold">Scope</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.scope_summary}</p>
          </div>
        )}

        {/* Outcomes */}
        {offering.offering_outcomes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckmarkFilled size={20} />
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
              <WarningAlt size={20} className="text-yellow-30" />
              <h4 className="text-heading-03 font-semibold">Prerequisites</h4>
            </div>
            <p className="text-body-01 ml-7">{offering.prerequisites}</p>
          </div>
        )}

        {/* Part Number */}
        {offering.part_numbers && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PackageIcon size={20} />
              <h4 className="text-heading-03 font-semibold">Part Number</h4>
            </div>
            <code className="ml-7 text-body-01 font-mono">{offering.part_numbers}</code>
          </div>
        )}

        {/* Seismic Link */}
        {offering.seismic_link && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={20} />
              <h4 className="text-heading-03 font-semibold">Content Resources</h4>
            </div>
            <a
              href={offering.seismic_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-7 text-link-01 flex items-center gap-1 hover:underline"
            >
              View in Seismic <Launch size={16} />
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

export function OfferingsCatalog() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allOfferings, setAllOfferings] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('offering_name');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [detailModalOffering, setDetailModalOffering] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // For Deal Maker role
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [productsForSelectedBrand, setProductsForSelectedBrand] = useState([]);
  const [selectedDealMakerProducts, setSelectedDealMakerProducts] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState([]);
  const [selectedOfferings, setSelectedOfferings] = useState([]);
  const [offeringsForProducts, setOfferingsForProducts] = useState({});

  const isDealMaker = userRole === 'deal-maker';
  const isBrandSalesOrRenewal = userRole === 'brand-sales-and-renewal-rep';
  const showViewDetailsButton = userRole === 'seller' || userRole === 'solution-architect';

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all brands
      const brandsData = await offeringService.getBrands();
      // console.log(brandsData)
      setBrands(brandsData);

      // For standard view, fetch all offerings
      if (!isDealMaker) {
        const offeringsData = await offeringService.searchOfferings({});
        setAllOfferings(offeringsData);
      }

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for selected brand (Deal Maker view)
  useEffect(() => {
    if (isDealMaker && selectedBrand) {
      fetchProductsForBrand(selectedBrand);
    }
  }, [selectedBrand, isDealMaker]);

  const fetchProductsForBrand = async (brandId) => {
    try {
      setLoading(true);
      const productsData = await offeringService.getProducts(brandId);
      setProductsForSelectedBrand(productsData);
      setSelectedDealMakerProducts([]);
      setExpandedProducts([]);
      setSelectedOfferings([]);
      setOfferingsForProducts({});
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch offerings for a product (Deal Maker view)
  const fetchOfferingsForProduct = async (productId) => {
    if (offeringsForProducts[productId]) {
      return; // Already fetched
    }

    try {
      const offeringsData = await offeringService.getOfferings(productId);
      // console.log("Offering data: ", offeringsData)
      setOfferingsForProducts(prev => ({
        ...prev,
        [productId]: offeringsData
      }));
    } catch (err) {
      console.error('Error fetching offerings for product:', err);
    }
  };

  const handleProductSelection = async (productId, checked) => {
    if (checked) {
      setSelectedDealMakerProducts([...selectedDealMakerProducts, productId]);
      setExpandedProducts([...expandedProducts, productId]);
      // Fetch offerings for this product
      await fetchOfferingsForProduct(productId);
    } else {
      setSelectedDealMakerProducts(selectedDealMakerProducts.filter(p => p !== productId));
      setExpandedProducts(expandedProducts.filter(p => p !== productId));
      // Remove offerings for this product from selection
      const productOfferings = offeringsForProducts[productId] || [];
      const offeringIds = productOfferings.map(off => off.offering_id);
      setSelectedOfferings(selectedOfferings.filter(id => !offeringIds.includes(id)));
    }
  };

  const toggleProductExpand = async (productId) => {
    if (expandedProducts.includes(productId)) {
      setExpandedProducts(expandedProducts.filter(p => p !== productId));
    } else {
      setExpandedProducts([...expandedProducts, productId]);
      // Fetch offerings if not already fetched
      await fetchOfferingsForProduct(productId);
    }
  };

  const handleOfferingSelection = (offeringId, checked) => {
    if (checked) {
      setSelectedOfferings([...selectedOfferings, offeringId]);
    } else {
      setSelectedOfferings(selectedOfferings.filter(id => id !== offeringId));
    }
  };

  const getProductOfferings = (productId) => {
    return offeringsForProducts[productId] || [];
  };

  const selectedOfferingDetails = Object.values(offeringsForProducts)
    .flat()
    .filter(off => selectedOfferings.includes(off.offering_id));

  const totalPrice = selectedOfferingDetails.reduce((sum, off) => {
    // Try to calculate a rough price based on available data
    // This is a placeholder - adjust based on your actual pricing logic
    return sum + 0;
  }, 0);

  const handleAddToELA = () => {
    console.log('Adding to ELA:', selectedOfferingDetails);
    alert(`Adding ${selectedOfferingDetails.length} offerings to ELA.`);
  };

  // Get unique values for filters
  const uniqueBrands = brands.map(b => b.brand_name);
// const uniqueSaasTypes = [...new Set(allProducts.map(p => p.product_name).filter(Boolean))];

  const uniqueSaasTypes = [...new Set(allOfferings.map(off => off.saas_type).filter(Boolean))];

  // console.log(uniqueBrands)

  // Filter and sort offerings for standard view
  const filteredOfferings = allOfferings.filter(offering => {
    const matchesSearch = 
      offering.offering_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.offering_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.tag_line?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(offering.brand);
    const matchesProduct = selectedProducts.length === 0 || selectedProducts.includes(offering.saas_type);
    
    return matchesSearch && matchesBrand && matchesProduct;
  });

  const sortedOfferings = [...filteredOfferings].sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return (a.duration || '').localeCompare(b.duration || '');
      case 'offering_name':
      default:
        return (a.offering_name || '').localeCompare(b.offering_name || '');
    }
  });

  const totalPages = Math.ceil(sortedOfferings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOfferings = sortedOfferings.slice(startIndex, endIndex);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const sortItems = [
    { id: 'offering_name', text: 'Name' },
    { id: 'duration', text: 'Duration' },
  ];

  // Show loading state
  if (loading && brands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading description="Loading offerings..." withOverlay={false} />
      </div>
    );
  }

  // Show error state
  if (error && brands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <InlineNotification
            kind="error"
            title="Error Loading Data"
            subtitle={error}
            lowContrast
          />
          <Button onClick={fetchInitialData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // DEAL MAKER VIEW
  if (isDealMaker) {
    return (
      <div className="min-h-screen cds--g10">
        <div className="flex min-h-screen" style={{paddingTop:'2.3rem'}}>
          <aside 
            className={`${showFilters ? 'w-64' : 'w-0'} bg-layer-01 transition-all duration-300 overflow-hidden min-h-screen`}
            style={{
              borderRight: '1px solid #cbcbcbff'
            }}
          >
            <div className="p-4 h-full">
              <div className="flex items-center gap-2 mb-4">
                <PackageIcon size={20} />
                <h2 className="text-heading-03 font-semibold">Brands</h2>
              </div>

              <div className="space-y-2">
                {brands.map(brand => (
                  <div
                    key={brand.brand_id}
                    onClick={() => {
                      setSelectedBrand(brand.brand_id);
                      setSelectedDealMakerProducts([]);
                      setExpandedProducts([]);
                      setSelectedOfferings([]);
                    }}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedBrand === brand.brand_id
                        ? 'bg-background-selected'
                        : 'hover:bg-layer-hover'
                    }`}
                    style={{
                      borderLeft: selectedBrand === brand.brand_id ? '4px solid #0f62fe' : '4px solid transparent'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-body-01 font-medium">{brand.brand_name}</span>
                      {selectedBrand === brand.brand_id && <ChevronRight size={16} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto bg-background">
            {!selectedBrand ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <PackageIcon size={64} className="mx-auto mb-4 text-interactive" />
                  <h2 className="text-heading-04 mb-2 font-semibold">Select a Brand</h2>
                  <p className="text-body-01">Choose a brand from the sidebar to view available products and offerings</p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-96">
                <Loading description="Loading products..." />
              </div>
            ) : (
              <>
                <Tile className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-heading-04 font-semibold">
                        {brands.find(b => b.brand_id === selectedBrand)?.brand_name}
                      </h2>
                      <p className="text-body-01 mt-1">
                        Select products to view and choose offerings
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-6 text-label-01">
                    <div>
                      <span className="font-semibold">{selectedDealMakerProducts.length}</span> product{selectedDealMakerProducts.length !== 1 ? 's' : ''} selected
                    </div>
                    <div>
                      <span className="font-semibold">{selectedOfferings.length}</span> offering{selectedOfferings.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                </Tile>

                <div className={`space-y-4 ${selectedOfferings.length > 0 ? 'mb-[400px]' : 'mb-6'}`}>
                  {productsForSelectedBrand.map(product => {
                    const isExpanded = expandedProducts.includes(product.product_id);
                    const isSelected = selectedDealMakerProducts.includes(product.product_id);
                    const productOfferings = getProductOfferings(product.product_id);
                    
                    return (
                      <Tile
                        key={product.product_id}
                        style={{
                          borderLeft: '4px solid #0f62fe'
                        }}
                      >
                        <div 
                          className="pb-4 mb-4"
                          style={{
                            borderBottom: '1px solid #525252'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`product-${product.product_id}`}
                              checked={isSelected}
                              onChange={(e) => handleProductSelection(product.product_id, e.target.checked)}
                              labelText=""
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <label
                                    htmlFor={`product-${product.product_id}`}
                                    className="text-heading-03 cursor-pointer font-semibold"
                                  >
                                    {product.product_name}
                                  </label>
                                  <p className="text-body-01 mt-1">{product.description || 'No description available'}</p>
                                  <div className="mt-2 text-label-01">
                                    {productOfferings.length} offering{productOfferings.length !== 1 ? 's' : ''} available
                                  </div>
                                </div>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  onClick={() => toggleProductExpand(product.product_id)}
                                  disabled={!isSelected}
                                  hasIconOnly
                                  renderIcon={isExpanded ? ChevronDown : ChevronRight}
                                  iconDescription={isExpanded ? "Collapse" : "Expand"}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {isSelected && isExpanded && (
                          <div className="bg-layer-01 p-4 -m-4 mt-0">
                            <h4 className="text-heading-03 font-semibold mb-3">
                              Offerings for {product.product_name}
                            </h4>
                            {productOfferings.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {productOfferings.map(offering => (
                                  <Tile key={offering.offering_id} className="hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-2 mb-2">
                                      <Checkbox
                                        id={`offering-${offering.offering_id}`}
                                        checked={selectedOfferings.includes(offering.offering_id)}
                                        onChange={(e) => handleOfferingSelection(offering.offering_id, e.target.checked)}
                                        labelText={offering.offering_name}
                                      />
                                    </div>

                                    <div className="space-y-1 text-label-01 pl-6">
                                      {offering.part_numbers && (
                                        <div className="flex justify-between">
                                          <span>Part #:</span>
                                          <span className="font-mono">{offering.part_numbers}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span>{offering.duration || 'N/A'}</span>
                                      </div>
                                      {offering.saas_type && (
                                        <div className="flex justify-between">
                                          <span>Type:</span>
                                          <Tag size="sm" type="blue">{offering.saas_type}</Tag>
                                        </div>
                                      )}
                                    </div>
                                  </Tile>
                                ))}
                              </div>
                            ) : (
                              <p className="text-body-01 text-center py-4">Loading offerings...</p>
                            )}
                          </div>
                        )}
                      </Tile>
                    );
                  })}
                </div>

                {selectedOfferings.length > 0 && (
                  <div 
                    className="fixed bottom-0 left-0 right-0 z-50" 
                    style={{ marginLeft: showFilters ? '16rem' : '0' }}
                  >
                    <Tile 
                      className="shadow-2xl"
                      style={{
                        borderTop: '4px solid #0f62fe'
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-heading-04 font-semibold">
                            Selected Offerings ({selectedOfferings.length})
                          </h3>
                        </div>

                        <div 
                          className="mb-4 max-h-48 overflow-y-auto"
                          style={{
                            border: '1px solid #525252'
                          }}
                        >
                          <StructuredListWrapper>
                            <StructuredListHead>
                              <StructuredListRow head>
                                <StructuredListCell head>Part Number</StructuredListCell>
                                <StructuredListCell head>Offering</StructuredListCell>
                                <StructuredListCell head>Duration</StructuredListCell>
                                <StructuredListCell head>Type</StructuredListCell>
                              </StructuredListRow>
                            </StructuredListHead>
                            <StructuredListBody>
                              {selectedOfferingDetails.map(offering => (
                                <StructuredListRow key={offering.offering_id}>
                                  <StructuredListCell className="font-mono">
                                    {offering.part_numbers || 'N/A'}
                                  </StructuredListCell>
                                  <StructuredListCell>{offering.offering_name}</StructuredListCell>
                                  <StructuredListCell>{offering.duration || 'N/A'}</StructuredListCell>
                                  <StructuredListCell>{offering.saas_type || 'N/A'}</StructuredListCell>
                                </StructuredListRow>
                              ))}
                            </StructuredListBody>
                          </StructuredListWrapper>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleAddToELA}
                            renderIcon={ShoppingCart}
                            size="lg"
                          >
                            Add {selectedOfferings.length} Offering{selectedOfferings.length !== 1 ? 's' : ''} to ELA
                          </Button>
                          <Button
                            onClick={() => setSelectedOfferings([])}
                            kind="secondary"
                            size="lg"
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </div>
                    </Tile>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    );
  }

  // STANDARD VIEW (Seller, Architect, Brand Sales, Renewal Rep)
  return (
    <div className="min-h-screen cds--g10">
      <div className="flex" style={{paddingTop:'2.5rem'}}>
        {/* Left Sidebar - Filters */}
        <aside 
          className={`${showFilters ? 'w-64' : 'w-0'} bg-layer-01 transition-all duration-300 overflow-hidden min-h-screen`}
          style={{
            borderRight: '1px solid #cbcbcbff'
          }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} />
              <h2 className="text-heading-03 font-semibold">Filters</h2>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="mb-3 text-heading-03 font-semibold">Brand</h3>
              <fieldset className="space-y-2">
                {uniqueBrands.map(brand => (
                  <Checkbox
                    key={brand}
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands([...selectedBrands, brand]);
                      } else {
                        setSelectedBrands(selectedBrands.filter(b => b !== brand));
                      }
                      handleFilterChange();
                    }}
                    labelText={brand}
                  />
                ))}
              </fieldset>
            </div>

            {/* Product Type Filter */}
            <div className="mb-6">
              <h3 className="mb-3 text-heading-03 font-semibold">Type</h3>
              <fieldset className="space-y-2">
                {uniqueSaasTypes.map(type => (
                  <Checkbox
                    key={type}
                    id={`type-${type}`}
                    checked={selectedProducts.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, type]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(p => p !== type));
                      }
                      handleFilterChange();
                    }}
                    labelText={type}
                  />
                ))}
              </fieldset>
            </div>

            {/* Clear Filters */}
            <Button
              kind="ghost"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedProducts([]);
                handleFilterChange();
              }}
            >
              Clear all filters
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background">
          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              className="mb-4"
            />
          )}

          {/* Search and Sort Bar */}
          <Tile className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <Search
                  size="lg"
                  placeholder="Search offerings..."
                  labelText="Search"
                  closeButtonLabelText="Clear search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-label-01">Sort by:</span>
                <Dropdown
                  style={{width:'7rem'}}
                  id="sort-dropdown"
                  titleText=""
                  label="Sort by"
                  items={sortItems}
                  selectedItem={sortItems.find(item => item.id === sortBy)}
                  onChange={({ selectedItem }) => setSortBy(selectedItem.id)}
                  itemToString={(item) => (item ? item.text : '')}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-body-01">
              <div>
                Showing {startIndex + 1}-{Math.min(endIndex, sortedOfferings.length)} of {sortedOfferings.length} offerings
              </div>
              {totalPages > 1 && (
                <div className="text-label-01">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </Tile>

          {/* Offerings Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loading description="Loading offerings..." />
            </div>
          ) : currentOfferings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {currentOfferings.map(offering => (
                  <Tile 
                    key={offering.offering_id} 
                    className="hover:shadow-lg transition-shadow"
                    style={{
                      // borderLeft: '4px solid #0f62fe',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-heading-03 flex-1 font-semibold">
                        {offering.offering_name}
                      </h3>
                      {isBrandSalesOrRenewal && (
                        <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          renderIcon={Information}
                          iconDescription="View details"
                          onClick={() => setDetailModalOffering(offering)}
                        />
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {offering.saas_type && <Tag type="cool-gray">{offering.saas_type}</Tag>}
                        {offering.brand && <Tag type="blue">{offering.brand}</Tag>}
                      </div>
                      <p className="text-body-01">
                        {offering.tag_line || offering.offering_summary?.substring(0, 100) + '...' || 'No description available'}
                      </p>
                    </div>

                    <div className="space-y-1 mb-4 text-body-01">
                      {offering.part_numbers && (
                        <div className="flex justify-between">
                          <span>Part #:</span>
                          <code className="font-mono text-label-01">{offering.part_numbers}</code>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold">{offering.duration || 'N/A'}</span>
                      </div>
                      {offering.industry && (
                        <div className="flex justify-between">
                          <span>Industry:</span>
                          <span className="text-label-01">{offering.industry}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      {showViewDetailsButton && (
                        <Button
                          kind="primary"
                          onClick={() => navigate(`/offering/${offering.offering_id}`)}
                          renderIcon={ArrowRight}
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            justifyContent: 'center',
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </Tile>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalItems={sortedOfferings.length}
                  pageSize={itemsPerPage}
                  pageSizes={[6, 12, 24]}
                  onChange={({ page, pageSize }) => {
                    setCurrentPage(page);
                    setItemsPerPage(pageSize);
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <SearchIcon size={64} className="mx-auto mb-4" />
                <h3 className="text-heading-04 mb-2 font-semibold">No offerings found</h3>
                <p className="text-body-01">Try adjusting your filters or search query</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detailModalOffering && (
        <OfferingDetailModal
          offering={detailModalOffering}
          open={!!detailModalOffering}
          onClose={() => setDetailModalOffering(null)}
        />
      )}
    </div>
  );
}