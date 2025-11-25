import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextArea,
  NumberInput,
  Button,
  InlineNotification,
  Tile,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { ArrowLeft, Save } from '@carbon/icons-react';
import wbsService from '../../services/wbsService';

export function WBSForm() {
  const { wbsId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(wbsId);

  const [formData, setFormData] = useState({
    wbs_description: '',
    wbs_weeks: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchWBS();
    }
  }, [wbsId]);

  const fetchWBS = async () => {
    try {
      setInitialLoading(true);
      const data = await wbsService.getWBSById(wbsId);
      setFormData({
        wbs_description: data.wbs_description || '',
        wbs_weeks: data.wbs_weeks || '',
      });
    } catch (err) {
      setError('Failed to load WBS');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.wbs_description) {
      setError('WBS description is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await wbsService.updateWBS(wbsId, formData);
      } else {
        await wbsService.createWBS(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/wbs');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save WBS');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <SkeletonPlaceholder style={{ width: '100px', height: '40px' }} />
          <SkeletonText heading style={{ width: '250px' }} />
        </div>

        <Tile style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <SkeletonText style={{ marginBottom: '0.5rem', width: '180px' }} />
            <SkeletonPlaceholder style={{ height: '120px' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <SkeletonText style={{ marginBottom: '0.5rem', width: '180px' }} />
            <SkeletonPlaceholder style={{ height: '40px' }} />
          </div>
        </Tile>

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
          onClick={() => navigate('/admin/wbs')}
        >
          Back
        </Button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isEditMode ? 'Edit WBS' : 'Create New WBS'}
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
          subtitle={`WBS ${isEditMode ? 'updated' : 'created'} successfully`}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <Tile>
          <TextArea
            id="wbs_description"
            labelText="WBS Description *"
            rows={4}
            value={formData.wbs_description}
            onChange={(e) => setFormData(prev => ({ ...prev, wbs_description: e.target.value }))}
            required
            style={{ marginBottom: '1.5rem' }}
          />

          <NumberInput
            id="wbs_weeks"
            label="WBS Weeks"
            value={formData.wbs_weeks || ''}
            onChange={(e, { value }) => setFormData(prev => ({ ...prev, wbs_weeks: value }))}
            min={0}
            allowEmpty
          />
        </Tile>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button
            kind="secondary"
            onClick={() => navigate('/admin/wbs')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            renderIcon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update WBS' : 'Create WBS'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
