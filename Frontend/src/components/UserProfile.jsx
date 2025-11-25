import { useState } from 'react';
import {
  Button,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tag,
  TextInput,
  Select,
  SelectItem,
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Tile,
  Search as SearchComponent,
} from '@carbon/react';
import {
  Edit,
  UserRole,
  Email,
  Building,
  Calendar,
  Checkmark,
  Search,
} from '@carbon/icons-react';
import { useAuth } from '../contexts/AuthContexts';

const mockUsers = [
  { id: '1', name: 'Alice Williams', email: 'alice@ibm.com', role: 'Admin', department: 'IT Services', status: 'Active', lastLogin: '2025-10-22' },
  { id: '2', name: 'Bob Martin', email: 'bob@ibm.com', role: 'Architect', department: 'Cloud Solutions', status: 'Active', lastLogin: '2025-10-21' },
  { id: '3', name: 'Carol White', email: 'carol@ibm.com', role: 'Seller', department: 'Sales', status: 'Active', lastLogin: '2025-10-20' },
  { id: '4', name: 'David Brown', email: 'david@ibm.com', role: 'Seller', department: 'Sales', status: 'Inactive', lastLogin: '2025-10-15' },
];

export function UserProfile({ onNavigate, onLogout }) {
  const { isAdmin, isSolutionArchitect, userProfile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f4', paddingTop: '3rem' }}>
        <div style={{ maxWidth: '1584px', margin: '0 auto', padding: '1rem' }}>
          <Tile style={{ padding: '2rem', textAlign: 'center' }}>
            Loading user profile...
          </Tile>
        </div>
      </div>
    );
  }

  // Show error state if profile is not available
  if (!userProfile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f4', paddingTop: '3rem' }}>
        <div style={{ maxWidth: '1584px', margin: '0 auto', padding: '1rem' }}>
          <Tile style={{ padding: '2rem', textAlign: 'center' }}>
            Unable to load user profile. Please try again.
          </Tile>
        </div>
      </div>
    );
  }

  // Determine user role display text
  const getUserRole = () => {
    if (isAdmin) return 'Admin';
    if (isSolutionArchitect) return 'Solution Architect';
    return 'User';
  };

  const userRoleDisplay = getUserRole();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userProfile?.name) return 'U';
    return userProfile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Filter users based on search and role
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Prepare data for DataTable
  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status' },
    { key: 'lastLogin', header: 'Last Login' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = filteredUsers.map(user => ({
    ...user,
    actions: user.id,
  }));

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f4f4f4',
      paddingTop: '3rem',
    },
    innerContainer: {
      maxWidth: '1584px',
      margin: '0 auto',
      padding: '1rem',
    },
    content: {
      padding: '1.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '1.5rem',
      '@media (max-width: 1056px)': {
        gridTemplateColumns: '1fr',
      },
    },
    profileCard: {
      padding: '1.5rem',
      height: 'fit-content',
      backgroundColor: 'white',
    },
    cardHeader: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    avatar: {
      width: '96px',
      height: '96px',
      backgroundColor: '#0f62fe',
      borderRadius: '50%',
      margin: '0 auto 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: 'white',
      fontSize: '2rem',
      fontWeight: '600',
    },
    name: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
    },
    email: {
      color: '#525252',
      marginBottom: '1rem',
    },
    info: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #e0e0e0',
      marginBottom: '1.5rem',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#525252',
    },
    infoIcon: {
      color: '#0f62fe',
    },
    editButton: {
      width: '100%',
    },
    details: {
      padding: '1.5rem',
      backgroundColor: 'white',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.25rem',
      marginBottom: '2rem',
    },
    permissions: {
      paddingTop: '1.5rem',
      borderTop: '1px solid #e0e0e0',
    },
    subsectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '1.25rem',
    },
    permissionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    permissionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#525252',
    },
    permissionIcon: {
      color: '#24a148',
    },
    management: {
      padding: '1.5rem',
    },
    managementHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1.25rem',
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-end',
    },
    searchInput: {
      width: '320px',
    },
    selectInput: {
      minWidth: '160px',
    },
  };

  // Responsive grid style
  const getGridStyle = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1056) {
      return {
        ...styles.grid,
        gridTemplateColumns: '1fr',
      };
    }
    return styles.grid;
  };

  // Responsive form grid style
  const getFormGridStyle = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 672) {
      return {
        ...styles.formGrid,
        gridTemplateColumns: '1fr',
      };
    }
    return styles.formGrid;
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <Tabs>
          <TabList aria-label="User Profile tabs" contained>
            <Tab>My Profile</Tab>
          </TabList>
          <TabPanels>
            {/* My Profile Tab */}
            <TabPanel>
              <div style={styles.content}>
                <div style={getGridStyle()}>
                  {/* Profile Card */}
                  <Tile style={styles.profileCard}>
                    <div style={styles.cardHeader}>
                      <div style={styles.avatar}>
                        <span style={styles.avatarText}>
                          {getUserInitials()}
                        </span>
                      </div>
                      <h2 style={styles.name}>{userProfile.name || 'User'}</h2>
                      <p style={styles.email}>{userProfile.email || ''}</p>
                      <Tag type="blue">
                        {userRoleDisplay}
                      </Tag>
                    </div>

                    <div style={styles.info}>
                      {userProfile.phoneNumber && (
                        <div style={styles.infoItem}>
                          <Email size={16} style={styles.infoIcon} />
                          <span>{userProfile.phoneNumber}</span>
                        </div>
                      )}
                      {userProfile.joiningDate && (
                        <div style={styles.infoItem}>
                          <Calendar size={16} style={styles.infoIcon} />
                          <span>Joined {userProfile.joiningDate}</span>
                        </div>
                      )}
                    </div>
                  </Tile>

                  {/* Profile Details */}
                  <Tile style={styles.details}>
                    <h2 style={styles.sectionTitle}>Profile Information</h2>

                    <div style={getFormGridStyle()}>
                      <TextInput
                        id="fullname"
                        labelText="Full Name"
                        value={userProfile.name || ''}
                        readOnly
                      />

                      <TextInput
                        id="email"
                        labelText="Email Address"
                        value={userProfile.email || ''}
                        readOnly
                      />

                      <TextInput
                        id="phone"
                        labelText="Phone Number"
                        value={userProfile.phoneNumber || 'Not provided'}
                        readOnly
                      />

                      <TextInput
                        id="location"
                        labelText="Location"
                        value={userProfile.location || 'Not provided'}
                        readOnly
                      />

                      <TextInput
                        id="role"
                        labelText="Role"
                        value={userRoleDisplay}
                        readOnly
                      />
                    </div>
                  </Tile>
                </div>
              </div>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}