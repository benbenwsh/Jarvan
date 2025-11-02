import {useState, useEffect} from 'react';
import {checkCompanyStatus} from '../services/api';

/**
 * Custom hook to check and cache company status
 * @returns {{ hasCompany: boolean, loading: boolean, error: Error | null }}
 */
export const useCompanyStatus = () => {
  const [hasCompany, setHasCompany] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await checkCompanyStatus();
        setHasCompany(data.hasCompany);
      } catch (err) {
        setError(err);
        console.error('Error checking company status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyStatus();
  }, []);

  return {hasCompany, loading, error};
};
