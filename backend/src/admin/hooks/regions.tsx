import { useEffect, useState } from "react";
import { RegionDTO } from "@medusajs/framework/types";

export function useRegions() {
  const [data, setData] = useState({ regions: [] as RegionDTO[] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("/admin/regions");
        if (!response.ok) {
          throw new Error("Failed to fetch regions");
        }
        const data = await response.json();
        setData(data);
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
