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
import pricingService from '../../services/pricingService';
import countryService from '../../services/countryService';

export function PricingForm() {
  const { country, role, band } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(country && role && band);

  const [formData, setFormData] = useState({
    country: '',
    role: '',
    band: '',
    cost: '',
    sale_price: '',
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchPricing();
    }
  }, [country, role, band]);

  const fetchCountries = async () => {
    try {
      const data = await countryService.getCountries();
      setCountries(data);
    } catch (err) {
      setError('Failed to load countries');
    }
  };

  const fetchPricing = async () => {
    try {
      setInitialLoading(true);
      const data = await pricingService.getPricingDetail(country, role, band);
      setFormData({
        country: data.country || '',
        role: data.role || '',
        band: data.band || '',
        cost: data.cost || '',
        sale_price: data.sale_price || '',
      });
    } catch (err) {
      setError('Failed to load pricing');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country || !formData.role || !formData.band) {
      setError('Country, role, and band are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await pricingService.updatePricing(country, role, band, formData);
      } else {
        await pricingService.createPricing(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/pricing');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save pricing');
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
              <SkeletonPlaceholder style={{ height: '40px', marginBottom: '1rem' }} />
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
          onClick={() => navigate('/admin/pricing')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Pricing' : 'Create New Pricing'}
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
          subtitle={`Pricing ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <Tile>
          <Grid narrow>
            <Column lg={8} md={4} sm={4}>
              <Dropdown
                id="country"
                titleText="Country *"
                label="Select a country"
                items={countries}
                itemToString={(item) => item?.country_name || ''}
                selectedItem={countries.find(c => c.country_name === formData.country) || null}
                onChange={({ selectedItem }) => 
                  setFormData(prev => ({ ...prev, country: selectedItem?.country_name || '' }))
                }
                disabled={isEditMode}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="role"
                labelText="Role *"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                required
                disabled={isEditMode}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <TextInput
                id="band"
                labelText="Band *"
                value={formData.band}
                onChange={(e) => setFormData(prev => ({ ...prev, band: e.target.value }))}
                required
                disabled={isEditMode}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <NumberInput
                id="cost"
                label="Cost"
                value={formData.cost || ''}
                onChange={(e, { value }) => setFormData(prev => ({ ...prev, cost: value }))}
                min={0}
                step={0.01}
                allowEmpty
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <NumberInput
                id="sale_price"
                label="Sale Price"
                value={formData.sale_price || ''}
                onChange={(e, { value }) => setFormData(prev => ({ ...prev, sale_price: value }))}
                min={0}
                step={0.01}
                allowEmpty
              />
            </Column>
          </Grid>
        </Tile>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/pricing')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Pricing' : 'Create Pricing'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
