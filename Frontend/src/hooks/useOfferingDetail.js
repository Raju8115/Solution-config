import { useState, useEffect } from 'react';
import offeringService from '../services/offeringService';
import activityService from '../services/activityService';
import staffingService from '../services/staffingService';
import pricingService from '../services/pricingService';

export const useOfferingDetail = (offeringId) => {
  const [offering, setOffering] = useState(null);
  const [activities, setActivities] = useState([]);
  const [staffing, setStaffing] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (offeringId) {
      fetchOfferingDetails();
    }
  }, [offeringId]);

  const fetchOfferingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch offering details first
      const offeringData = await offeringService.getOfferingById(offeringId);
      setOffering(offeringData);

      // Fetch related data in parallel
      const [activitiesData, staffingData, pricingData] = await Promise.allSettled([
        activityService.getActivitiesByOffering(offeringId),
        staffingService.getStaffingByOffering(offeringId),
        pricingService.getTotalHoursAndPrices(offeringId)
      ]);

      if (activitiesData.status === 'fulfilled') {
        setActivities(activitiesData.value);
      }
      if (staffingData.status === 'fulfilled') {
        setStaffing(staffingData.value);
      }
      if (pricingData.status === 'fulfilled') {
        setPricing(pricingData.value);
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch offering details');
      console.error('Error fetching offering details:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    offering,
    activities,
    staffing,
    pricing,
    loading,
    error,
    refetch: fetchOfferingDetails
  };
};