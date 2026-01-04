
import { useState, useEffect } from 'react';
import { fetchActivePackages, NormalizedPackage } from '../shared/services/packageCatalog';
import { FEATURES } from '../config/features';

/**
 * usePackages Hook
 * Safely fetches active commerce packages if the feature is enabled.
 * Returns empty array and loading: false if the feature is disabled,
 * ensuring no breaking changes to legacy flows.
 */
export const usePackages = () => {
  const [packages, setPackages] = useState<NormalizedPackage[]>([]);
  const [loading, setLoading] = useState(FEATURES.packagesEnabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!FEATURES.packagesEnabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    fetchActivePackages()
      .then(data => {
        if (isMounted) {
          setPackages(data);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("usePackages Error:", err);
          setError("Could not load pricing data.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return { 
    packages, 
    loading, 
    error, 
    isEnabled: FEATURES.packagesEnabled 
  };
};
