import { useEffect, useState } from "react";
import { HttpTypes, RegionDTO } from "@medusajs/framework/types";
import { sdk } from "../lib/client";

export function useRegions() {
  const [data, setData] = useState<HttpTypes.AdminRegion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const result = await sdk.admin.region.list();
        setData(result.regions);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
