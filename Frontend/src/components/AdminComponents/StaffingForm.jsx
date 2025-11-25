import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  NumberInput,
  Dropdown,
  Button,
  InlineNotification,
  Tile,
  Grid,
  Column,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import staffingService from '../../services/staffingService';
import activityService from '../../services/activityService';
import countryService from '../../services/countryService';

export function StaffingForm() {
  const { staffingId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(staffingId);

  const [formData, setFormData] = useState({
    activity_id: '',
    country: '',
    role: '',
    band: '',
    hours: '',
  });

  const [activities, setActivities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchStaffing();
    }
  }, [staffingId]);

  const fetchActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities');
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await countryService.getCountries();
      setCountries(data);
    } catch (err) {
      setError('Failed to load countries');
    }
  };

  const fetchStaffing = async () => {
    try {
      setInitialLoading(true);
      const data = await staffingService.getStaffingById(staffingId);
      setFormData({
        activity_id: data.activity_id || '',
        country: data.country || '',
        role: data.role || '',
        band: data.band || '',
        hours: data.hours || '',
      });
    } catch (err) {
      setError('Failed to load staffing');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.activity_id) {
      setError('Activity is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await staffingService.updateStaffing(staffingId, formData);
      } else {
        await staffingService.createStaffing(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/staffing');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save staffing');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
          <SkeletonText heading style={{ width: '250px' }} />
        </div>

        <Tile>
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
              <SkeletonPlaceholder style={{ height: '48px', marginBottom: '1rem' }} />
            </Column>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
              <SkeletonPlaceholder style={{ height: '48px', marginBottom: '1rem' }} />
            </Column>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
              <SkeletonPlaceholder style={{ height: '40px', marginBottom: '1rem' }} />
            </Column>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
              <SkeletonPlaceholder style={{ height: '40px', marginBottom: '1rem' }} />
            </Column>
            <Column lg={8} md={4} sm={4}>
              <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
              <SkeletonPlaceholder style={{ height: '40px' }} />
            </Column>
          </Grid>
        </Tile>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '48px' }} />
          <SkeletonPlaceholder style={{ width: '120px', height: '48px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/admin/staffing')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Staffing' : 'Create New Staffing'}
        </h1>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {success && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={`Staffing ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <Tile>
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <Dropdown
                id="activity"
                titleText="Activity *"
                label="Select an activity"
                items={activities}
                itemToString={(item) => item?.activity_name || ''}
                selectedItem={activities.find(a => a.activity_id === formData.activity_id) || null}
                onChange={({ selectedItem }) => 
                  setFormData(prev => ({ ...prev, activity_id: selectedItem?.activity_id || '' }))
                }
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <Dropdown
                id="country"
                titleText="Country"
                label="Select a country"
                items={countries}
                itemToString={(item) => item?.country_name || ''}
                selectedItem={countries.find(c => c.country_name === formData.country) || null}
                onChange={({ selectedItem }) => 
                  setFormData(prev => ({ ...prev, country: selectedItem?.country_name || '' }))
                }
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="role"
                labelText="Role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="band"
                labelText="Band"
                value={formData.band}
                onChange={(e) => setFormData(prev => ({ ...prev, band: e.target.value }))}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <NumberInput
                id="hours"
                label="Hours"
                value={formData.hours || ''}
                onChange={(e, { value }) => setFormData(prev => ({ ...prev, hours: value }))}
                min={0}
                allowEmpty
              />
            </Column>
          </Grid>
        </Tile>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/staffing')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Staffing' : 'Create Staffing'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
