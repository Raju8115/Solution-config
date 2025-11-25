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
import staffingService from '../../services/staffingService';
import activityService from '../../services/activityService';

export function StaffingList() {
  const navigate = useNavigate();
  const [staffingList, setStaffingList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivities();
    fetchAllStaffing();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      fetchStaffingByActivity();
    } else {
      fetchAllStaffing();
    }
  }, [selectedActivity]);

  const fetchActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities');
    }
  };

  const fetchAllStaffing = async () => {
    try {
      setLoading(true);
      const data = await staffingService.getAllStaffing();
      setStaffingList(data);
    } catch (err) {
      setError('Failed to load staffing');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffingByActivity = async () => {
    try {
      setLoading(true);
      const data = await staffingService.getStaffingByActivity(selectedActivity);
      setStaffingList(data);
    } catch (err) {
      setError('Failed to load staffing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffingId) => {
    if (window.confirm('Are you sure you want to delete this staffing detail?')) {
      try {
        await staffingService.deleteStaffing(staffingId);
        if (selectedActivity) {
          fetchStaffingByActivity();
        } else {
          fetchAllStaffing();
        }
      } catch (err) {
        setError('Failed to delete staffing');
      }
    }
  };

  const handleActivityChange = ({ selectedItem }) => {
    const activityId = selectedItem?.activity_id === null ? null : selectedItem?.activity_id;
    setSelectedActivity(activityId);
  };

  const getActivityName = (activityId) => {
    const activity = activities.find((a) => a.activity_id === activityId);
    return activity ? activity.activity_name : '-';
  };

  const headers = [
    { key: 'activity_name', header: 'Activity' },
    { key: 'country', header: 'Country' },
    { key: 'role', header: 'Role' },
    { key: 'band', header: 'Band' },
    { key: 'hours', header: 'Hours' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredStaffing = staffingList.filter((staffing) => {
    const activityName = getActivityName(staffing.activity_id);
    return (
      activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staffing.country && staffing.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staffing.role && staffing.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staffing.band && staffing.band.toString().includes(searchQuery))
    );
  });

  const rows = filteredStaffing.map((staffing) => ({
    id: staffing.staffing_id,
    activity_name: getActivityName(staffing.activity_id),
    country: staffing.country || '-',
    role: staffing.role || '-',
    band: staffing.band || '-',
    hours: staffing.hours || '-',
    actions: staffing.staffing_id,
  }));

  // Show skeleton only on initial load
  if (loading && staffingList.length === 0) {
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
        Staffing Management
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
          id="activity-filter"
          titleText="Filter by Activity"
          label="All Activities"
          items={[{ activity_id: null, activity_name: 'All Activities' }, ...activities]}
          itemToString={(item) => (item ? item.activity_name : '')}
          selectedItem={
            selectedActivity
              ? activities.find((a) => a.activity_id === selectedActivity)
              : { activity_id: null, activity_name: 'All Activities' }
          }
          onChange={handleActivityChange}
        />
      </div>

      {/* {loading && staffingList.length > 0 ? (
        <div style={{ marginBottom: '1rem' }}>
          <InlineNotification
            kind="info"
            title="Loading"
            subtitle="Filtering staffing data..."
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
                  placeholder="Search staffing..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                <Button onClick={() => navigate('/admin/staffing/create')} renderIcon={Add}>
                  Add Staffing
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
                      No staffing data found. {searchQuery && 'Try adjusting your search.'}
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
                                  onClick={() => navigate(`/admin/staffing/edit/${row.id}`)}
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
