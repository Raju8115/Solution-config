import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  Button,
  InlineNotification,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import countryService from '../../services/countryService';

export function CountryForm() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(countryId);

  const [formData, setFormData] = useState({
    country_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchCountry();
    }
  }, [countryId]);

  const fetchCountry = async () => {
    try {
      setInitialLoading(true);
      const data = await countryService.getCountryById(countryId);
      setFormData({
        country_name: data.country_name || '',
      });
    } catch (err) {
      setError('Failed to load country');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_name) {
      setError('Country name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await countryService.updateCountry(countryId, formData);
      } else {
        await countryService.createCountry(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/countries');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save country');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
          <SkeletonText heading style={{ width: '200px' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
          <SkeletonPlaceholder style={{ height: '40px' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '48px' }} />
          <SkeletonPlaceholder style={{ width: '120px', height: '48px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/admin/countries')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Country' : 'Create New Country'}
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
          subtitle={`Country ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <TextInput
          id="country_name"
          labelText="Country Name *"
          value={formData.country_name}
          onChange={(e) => setFormData(prev => ({ ...prev, country_name: e.target.value }))}
          required
          style={{ marginBottom: '2rem' }}
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/countries')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Country' : 'Create Country'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
