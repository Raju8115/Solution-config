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
  Tag,
  DataTableSkeleton
} from '@carbon/react';
import { Add, Edit, TrashCan, View } from '@carbon/icons-react';
import offeringService from '../../services/offeringService';

export function OfferingsList() {
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const data = await offeringService.searchOfferings({});
      setOfferings(data);
    } catch (err) {
      setError('Failed to load offerings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offeringId) => {
    if (window.confirm('Are you sure you want to delete this offering?')) {
      try {
        await offeringService.deleteOffering(offeringId);
        fetchOfferings();
      } catch (err) {
        setError('Failed to delete offering');
      }
    }
  };

  const headers = [
    { key: 'offering_name', header: 'Offering Name' },
    { key: 'brand', header: 'Brand' },
    { key: 'saas_type', header: 'Type' },
    { key: 'industry', header: 'Industry' },
    { key: 'duration', header: 'Duration' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredOfferings = offerings.filter(offering =>
    offering.offering_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offering.brand && offering.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (offering.saas_type && offering.saas_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (offering.industry && offering.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const rows = filteredOfferings.map(offering => ({
    id: offering.offering_id,
    offering_name: offering.offering_name,
    brand: offering.brand || '-',
    saas_type: offering.saas_type || '-',
    industry: offering.industry || '-',
    duration: offering.duration || '-',
    actions: offering.offering_id,
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
        Offerings Management
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
                  placeholder="Search offerings..." 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button
                  onClick={() => navigate('/admin/offerings/create')}
                  renderIcon={Add}
                >
                  Add Offering
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
                      if (cell.info.header === 'saas_type' && cell.value !== '-') {
                        return (
                          <TableCell key={cell.id}>
                            <Tag type="blue">{cell.value}</Tag>
                          </TableCell>
                        );
                      }
                      if (cell.info.header === 'actions') {
                        return (
                          <TableCell key={cell.id}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={View}
                                onClick={() => navigate(`/offering/${row.id}`)}
                                hasIconOnly
                                iconDescription="View Details"
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Edit}
                                onClick={() => navigate(`/admin/offerings/edit/${row.id}`)}
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