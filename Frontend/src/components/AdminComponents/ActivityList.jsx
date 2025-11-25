import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  DataTableSkeleton,
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
  Tag,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import activityService from '../../services/activityService';

export function ActivityList() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity? This will remove it from all offerings.')) {
      try {
        await activityService.deleteActivity(activityId);
        fetchActivities();
      } catch (err) {
        setError('Failed to delete activity');
      }
    }
  };

  const headers = [
    { key: 'activity_name', header: 'Activity Name' },
    { key: 'category', header: 'Category' },
    { key: 'duration', header: 'Duration' },
    { key: 'effort_hours', header: 'Effort (hrs)' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredActivities = activities.filter(activity =>
    activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (activity.category && activity.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const rows = filteredActivities.map(activity => ({
    id: activity.activity_id,
    activity_name: activity.activity_name,
    category: activity.category || '-',
    duration: activity.duration_weeks ? `${activity.duration_weeks} weeks` : '-',
    effort_hours: activity.effort_hours || '-',
    actions: activity.activity_id,
  }));

  // Show skeleton table while loading
  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <DataTableSkeleton
          headers={headers}
          columnCount={headers.length}
          rowCount={10}
          showHeader={true}
          showToolbar={true}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
        Activities Management
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
                  placeholder="Search activities..." 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button
                  onClick={() => navigate('/admin/activities/create')}
                  renderIcon={Add}
                >
                  Add Activity
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
                      No activities found. {searchQuery && 'Try adjusting your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'category') {
                          return (
                            <TableCell key={cell.id}>
                              {cell.value !== '-' ? <Tag type="cool-gray">{cell.value}</Tag> : '-'}
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
                                  renderIcon={Edit}
                                  onClick={() => navigate(`/admin/activities/edit/${row.id}`)}
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
