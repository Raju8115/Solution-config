import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  TextArea,
  Dropdown,
  Button,
  InlineNotification,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import offeringService from '../../services/offeringService';
import productService from '../../services/productService';

export function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    brand_id: '',
  });

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [productId]);

  const fetchBrands = async () => {
    try {
      const data = await offeringService.getBrands();
      setBrands(data);
    } catch (err) {
      setError('Failed to load brands');
    }
  };

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const data = await productService.getProductById(productId);
      setFormData({
        product_name: data.product_name || '',
        description: data.description || '',
        brand_id: data.brand_id || '',
      });
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_name) {
      setError('Product name is required');
      return;
    }

    if (!formData.brand_id) {
      setError('Please select a brand');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await productService.updateProduct(productId, formData);
      } else {
        await productService.createProduct(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save product');
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
          <SkeletonPlaceholder style={{ height: '48px' }} />
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
          onClick={() => navigate('/admin/products')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit Product' : 'Create New Product'}
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
          subtitle={`Product ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <TextInput
          id="product_name"
          labelText="Product Name *"
          value={formData.product_name}
          onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
          required
          style={{ marginBottom: '1.5rem' }}
        />

        <Dropdown
          id="brand"
          titleText="Brand *"
          label="Select a brand"
          items={brands}
          itemToString={(item) => item?.brand_name || ''}
          selectedItem={brands.find(b => b.brand_id === formData.brand_id) || null}
          onChange={({ selectedItem }) => 
            setFormData(prev => ({ ...prev, brand_id: selectedItem?.brand_id || '' }))
          }
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
            onClick={() => navigate('/admin/products')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
