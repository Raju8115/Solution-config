import { useState, useEffect } from 'react';
import offeringService from '../services/offeringService';

export const useBrandsAndProducts = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchProducts(selectedBrand);
    } else {
      setProducts([]);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offeringService.getBrands();
      setBrands(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (brandId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await offeringService.getProducts(brandId);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    brands,
    selectedBrand,
    setSelectedBrand,
    products,
    loading,
    error,
    refetchBrands: fetchBrands
  };
};