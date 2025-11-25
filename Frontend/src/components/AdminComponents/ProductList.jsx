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
import offeringService from '../../services/offeringService';
import productService from '../../services/productService';

export function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBrands();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchProducts();
    } else {
      fetchAllProducts();
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const data = await offeringService.getBrands();
      setBrands(data);
    } catch (err) {
      setError('Failed to load brands');
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductsByBrand(selectedBrand);
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        if (selectedBrand) {
          fetchProducts();
        } else {
          fetchAllProducts();
        }
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleBrandChange = ({ selectedItem }) => {
    const brandId = selectedItem?.brand_id === null ? null : selectedItem?.brand_id;
    setSelectedBrand(brandId);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find((b) => b.brand_id === brandId);
    return brand ? brand.brand_name : '-';
  };

  const headers = [
    { key: 'product_name', header: 'Product Name' },
    { key: 'brand_name', header: 'Brand' },
    { key: 'description', header: 'Description' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredProducts = products.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getBrandName(product.brand_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rows = filteredProducts.map((product) => ({
    id: product.product_id,
    product_name: product.product_name,
    brand_name: getBrandName(product.brand_id),
    description: product.description || '-',
    actions: product.product_id,
  }));

  // Show skeleton only on initial load
  if (loading && products.length === 0) {
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
        Products Management
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
          id="brand-filter"
          titleText="Filter by Brand"
          label="All Brands"
          items={[{ brand_id: null, brand_name: 'All Brands' }, ...brands]}
          itemToString={(item) => (item ? item.brand_name : '')}
          selectedItem={
            selectedBrand
              ? brands.find((b) => b.brand_id === selectedBrand)
              : { brand_id: null, brand_name: 'All Brands' }
          }
          onChange={handleBrandChange}
        />
      </div>

      {/* {loading && products.length > 0 ? (
        <div style={{ marginBottom: '1rem' }}>
          <InlineNotification
            kind="info"
            title="Loading"
            subtitle="Filtering products..."
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
                  placeholder="Search products..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button onClick={() => navigate('/admin/products/create')} renderIcon={Add}>
                  Add Product
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
                      No products found. {searchQuery && 'Try adjusting your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'actions') {
                          return (
                            <TableCell key={cell.id}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={Edit}
                                  onClick={() => navigate(`/admin/products/edit/${row.id}`)}
                                  hasIconOnly
                                  iconDescription="Edit"
                                />
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  onClick={() => handleDelete(row.id)}
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
