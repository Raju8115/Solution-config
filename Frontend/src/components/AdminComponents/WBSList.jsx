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
import wbsService from '../../services/wbsService';

export function WBSList() {
  const navigate = useNavigate();
  const [wbsList, setWbsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWBS();
  }, []);

  const fetchWBS = async () => {
    try {
      setLoading(true);
      const data = await wbsService.getAllWBS();
      setWbsList(data);
    } catch (err) {
      setError('Failed to load WBS');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (wbsId) => {
    if (window.confirm('Are you sure you want to delete this WBS?')) {
      try {
        await wbsService.deleteWBS(wbsId);
        fetchWBS();
      } catch (err) {
        setError('Failed to delete WBS');
      }
    }
  };

  const headers = [
    { key: 'wbs_description', header: 'WBS Description' },
    { key: 'wbs_weeks', header: 'Weeks' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredWBS = wbsList.filter(wbs =>
    wbs.wbs_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (wbs.wbs_weeks && wbs.wbs_weeks.toString().includes(searchQuery))
  );

  const rows = filteredWBS.map(wbs => ({
    id: wbs.wbs_id,
    wbs_description: wbs.wbs_description,
    wbs_weeks: wbs.wbs_weeks || '-',
    actions: wbs.wbs_id,
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
        WBS Management
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
                  placeholder="Search WBS..." 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button
                  onClick={() => navigate('/admin/wbs/create')}
                  renderIcon={Add}
                >
                  Add WBS
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
                                onClick={() => navigate(`/admin/wbs/edit/${row.id}`)}
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