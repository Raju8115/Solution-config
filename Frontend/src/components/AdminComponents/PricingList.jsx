import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  InlineNotification,
  Dropdown,
  DataTableSkeleton,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import pricingService from '../../services/pricingService';
import countryService from '../../services/countryService';

export function PricingList() {
  const navigate = useNavigate();
  const [pricingList, setPricingList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch countries only once on mount
  useEffect(() => {
    fetchCountries();
    fetchAllPricing();
  }, []);

  // Separate effect for filtering - this is the issue
  // When selectedCountry changes, it triggers a new fetch which sets loading to true
  useEffect(() => {
    if (selectedCountry) {
      fetchPricingByCountry();
    } else {
      fetchAllPricing();
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const data = await countryService.getCountries();
      setCountries(data);
    } catch (err) {
      console.error('Failed to load countries');
    }
  };

  const fetchAllPricing = async () => {
    try {
      setLoading(true);
      const data = await pricingService.getAllPricing();
      // console.log('Pricing Data : ', data);
      setPricingList(data);
    } catch (err) {
      setError('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingByCountry = async () => {
    try {
      setLoading(true);
      const data = await pricingService.getPricingByCountry(selectedCountry);
      setPricingList(data);
    } catch (err) {
      setError('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (country, role, band) => {
    if (window.confirm('Are you sure you want to delete this pricing detail?')) {
      try {
        await pricingService.deletePricing(country, role, band);
        if (selectedCountry) {
          fetchPricingByCountry();
        } else {
          fetchAllPricing();
        }
      } catch (err) {
        setError('Failed to delete pricing');
      }
    }
  };

  // Handle country filter change
  const handleCountryChange = ({ selectedItem }) => {
    const country = selectedItem?.country_id === null ? null : selectedItem?.country_name;
    setSelectedCountry(country);
  };

  const headers = [
    { key: 'country', header: 'Country' },
    { key: 'role', header: 'Role' },
    { key: 'band', header: 'Band' },
    { key: 'cost', header: 'Cost' },
    { key: 'sale_price', header: 'Sale Price' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredPricing = pricingList.filter(
    (pricing) =>
      pricing.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pricing.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pricing.band.toString().includes(searchQuery)
  );

  const rows = filteredPricing.map((pricing) => ({
    id: `${pricing.country}-${pricing.role}-${pricing.band}`,
    country: pricing.country,
    role: pricing.role,
    band: pricing.band,
    cost: pricing.cost ? `$${pricing.cost}` : '-',
    sale_price: pricing.sale_price ? `$${pricing.sale_price}` : '-',
    actions: { country: pricing.country, role: pricing.role, band: pricing.band },
  }));

  // Show skeleton only on initial load
  if (loading && pricingList.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <DataTableSkeleton
          headers={headers}
          columnCount={headers.length}
          rowCount={8}
          showHeader={true}
          showToolbar={true}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
        Pricing Management
      </h1>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <div style={{ marginBottom: '1rem', maxWidth: '300px' }}>
        <Dropdown
          id="country-filter"
          titleText="Filter by Country"
          label="All Countries"
          items={[{ country_id: null, country_name: 'All Countries' }, ...countries]}
          itemToString={(item) => (item ? item.country_name : '')}
          selectedItem={
            selectedCountry 
              ? countries.find(c => c.country_name === selectedCountry) 
              : { country_id: null, country_name: 'All Countries' }
          }
          onChange={handleCountryChange}
        />
      </div>

      {/* {loading && pricingList.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <InlineNotification
            kind="info"
            title="Loading"
            subtitle="Filtering pricing data..."
            hideCloseButton
            lowContrast
          />
        </div>
      ) : null} */}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  persistent
                  placeholder="Search pricing..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button onClick={() => navigate('/admin/pricing/create')} renderIcon={Add}>
                  Add Pricing
                </Button>
              </TableToolbarContent>
            </TableToolbar>
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length} style={{ textAlign: 'center', padding: '2rem' }}>
                      No pricing data found. {searchQuery && 'Try adjusting your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'actions') {
                          const { country, role, band } = cell.value;
                          return (
                            <TableCell key={cell.id}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={Edit}
                                  onClick={() => navigate(`/admin/pricing/edit/${country}/${role}/${band}`)}
                                  hasIconOnly
                                  iconDescription="Edit"
                                />
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  onClick={() => handleDelete(country, role, band)}
                                  hasIconOnly
                                  iconDescription="Delete"
                                />
                              </div>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </DataTable>
    </div>
  );
}
