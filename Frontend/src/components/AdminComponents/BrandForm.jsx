import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  TextArea,
  Button,
  InlineNotification,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import offeringService from '../../services/offeringService';

export function BrandForm() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(brandId);

  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchBrand();
    }
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      setInitialLoading(true);
      const data = await offeringService.getBrandById(brandId);
      setFormData({
        brand_name: data.brand_name || '',
        description: data.description || '',
      });
    } catch (err) {
      setError('Failed to load brand');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brand_name) {
      setError('Brand name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await offeringService.updateBrand(brandId, formData);
      } else {
        await offeringService.createBrand(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/brands');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save brand');
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

        <div style={{ marginBottom: '1.5rem' }}>
          <SkeletonText style={{ marginBottom: '0.5rem', width: '150px' }} />
          <SkeletonPlaceholder style={{ height: '120px' }} />
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
          onClick={() => navigate('/admin/brands')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Brand' : 'Create New Brand'}
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
          subtitle={`Brand ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <TextInput
          id="brand_name"
          labelText="Brand Name *"
          value={formData.brand_name}
          onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
          required
          style={{ marginBottom: '1.5rem' }}
        />

        <TextArea
          id="description"
          labelText="Description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          style={{ marginBottom: '2rem' }}
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/brands')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Brand' : 'Create Brand'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
