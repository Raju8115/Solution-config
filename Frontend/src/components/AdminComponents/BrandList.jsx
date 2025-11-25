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
  Loading,
  DataTableSkeleton
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import offeringService from '../../services/offeringService';

export function BrandList() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await offeringService.getBrands();
      setBrands(data);
    } catch (err) {
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await offeringService.deleteBrand(brandId);
        fetchBrands();
      } catch (err) {
        setError('Failed to delete brand');
      }
    }
  };

  const headers = [
    { key: 'brand_name', header: 'Brand Name' },
    { key: 'description', header: 'Description' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredBrands = brands.filter(brand =>
    brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const rows = filteredBrands.map(brand => ({
    id: brand.brand_id,
    brand_name: brand.brand_name,
    description: brand.description || '-',
    actions: brand.brand_id,
  }));

  if (loading) {
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
        Brands Management
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

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch 
                  persistent 
                  placeholder="Search brands..." 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button
                  onClick={() => navigate('/admin/brands/create')}
                  renderIcon={Add}
                >
                  Add Brand
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
                {rows.map((row) => (
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
                                onClick={() => navigate(`/admin/brands/edit/${row.id}`)}
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
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DataTable>
    </div>
  );
}