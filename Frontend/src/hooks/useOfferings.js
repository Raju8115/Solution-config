import { useState, useEffect } from 'react';
import offeringService from '../services/offeringService';

export const useOfferings = (productId) => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchOfferings();
    }
  }, [productId]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offeringService.getOfferings(productId);
      setOfferings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch offerings');
      console.error('Error fetching offerings:', err);
    } finally {
      setLoading(false);
    }
  };

  return { offerings, loading, error, refetch: fetchOfferings };
};